// File: app/profile/page.tsx
'use client';

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

// Define the Reddit user data type
interface RedditUserData {
  id: string;
  name: string;
  created: number;
  created_utc: number;
  link_karma: number;
  comment_karma: number;
  is_gold: boolean;
  is_mod: boolean;
  has_verified_email: boolean;
  subreddit?: {
    display_name: string;
    subscribers: number;
    name: string;
    id: string;
    icon_img?: string;
  };
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [redditData, setRedditData] = useState<RedditUserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // State for most visited subreddits
  const [subreddits, setSubreddits] = useState<any[]>([]);
  const [loadingSubreddits, setLoadingSubreddits] = useState(false);
  const [subredditError, setSubredditError] = useState("");
  const [subredditSource, setSubredditSource] = useState<'history' | 'subscribed' | 'simulated' | null>(null);
  
  // Helper function to decode HTML entities in URLs
  const decodeHtmlEntities = (html: string | undefined) => {
    if (!html) return '';
    const textArea = document.createElement('textarea');
    textArea.innerHTML = html;
    return textArea.value;
  };
  
  // Redirect to home if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);
  
  // Fetch Reddit user data when session is available
  useEffect(() => {
    if (session?.accessToken) {
      setLoading(true);
      fetch('https://oauth.reddit.com/api/v1/me', {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("Reddit API response:", data);
        console.log("Icon image URL:", data.subreddit?.icon_img);
        setRedditData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching Reddit user data:", err);
        setError("Failed to load Reddit profile data. Please try again later.");
        setLoading(false);
      });
    }
  }, [session]);
  
  // Fetch user's most visited subreddits
  useEffect(() => {
    if (!redditData) return;
    
    setLoadingSubreddits(true);
    
    // Use the existing subscribed API route which now has simulated visit counts
    fetch('/api/reddit/subscribed')
      .then(response => {
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.data && data.data.children) {
          const subredditList = data.data.children
            .map((child: any) => child.data);
          
          setSubreddits(subredditList);
          
          // Track the source of this data
          setSubredditSource(data.source || null);
        }
        setLoadingSubreddits(false);
      })
      .catch(err => {
        console.error("Error fetching subreddits:", err);
        setSubredditError("Failed to load subreddit data");
        setLoadingSubreddits(false);
      });
  }, [redditData]);
  
  // Format Unix timestamp to readable date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent animate-spin mb-4"></div>
          <div className="text-xl font-medium text-gray-700">Loading your dashboard...</div>
        </div>
      </div>
    );
  }
  
  if (!session) {
    return null; // Will redirect in the useEffect
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Top Navigation */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              Reddit Dashboard
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {redditData && (
              <div className="flex items-center">
                <span className="mr-3 font-medium hidden md:inline">{redditData.name}</span>
                <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-purple-200">
                  {redditData.subreddit?.icon_img ? (
                    <Image 
                      src={decodeHtmlEntities(redditData.subreddit.icon_img)}
                      alt="Profile"
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500 text-white text-sm font-bold">
                      {redditData.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-gray-600 hover:text-red-500 text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Dashboard Container */}
      <div className="container mx-auto px-4 py-8">
        {error ? (
          <div className="p-5 bg-white border-l-4 border-red-500 rounded-lg shadow-md mb-6">
            <div className="flex items-center">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 text-red-500 mr-3">
                ⚠️
              </div>
              <div className="text-red-600">{error}</div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Profile Card */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Profile</h2>
                  {redditData ? (
                    <div className="flex flex-col items-center">
                      <div className="relative h-24 w-24 rounded-full overflow-hidden mb-4 border-4 border-purple-100">
                        {redditData.subreddit?.icon_img ? (
                          <Image 
                            src={decodeHtmlEntities(redditData.subreddit.icon_img)}
                            alt="Profile"
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500 text-white text-2xl font-bold">
                            {redditData.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-800">{redditData.name}</h3>
                      <p className="text-sm text-gray-500 mb-4">u/{redditData.name}</p>
                      
                      <div className="w-full mt-2 space-y-2">
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Account Age</span>
                          <span className="font-medium">{formatDate(redditData.created_utc)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Reddit ID</span>
                          <span className="font-medium text-xs">{redditData.id}</span>
                        </div>
                      </div>
                      
                      {/* Status Badges */}
                      <div className="flex flex-wrap gap-2 mt-4 justify-center">
                        {redditData.has_verified_email && (
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                            Verified Email
                          </span>
                        )}
                        {redditData.is_gold && (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                            Reddit Gold
                          </span>
                        )}
                        {redditData.is_mod && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                            Moderator
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">Profile data unavailable</div>
                  )}
                </div>
              </div>
              
              {/* Karma Stats */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Karma Statistics</h2>
                  {redditData ? (
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 mx-auto mb-3 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                          </svg>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{redditData.link_karma.toLocaleString()}</p>
                        <p className="text-sm text-gray-600 mt-1">Post Karma</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-purple-500 mx-auto mb-3 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">{redditData.comment_karma.toLocaleString()}</p>
                        <p className="text-sm text-gray-600 mt-1">Comment Karma</p>
                      </div>
                      
                      {/* Total Karma Card */}
                      <div className="col-span-2 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-400 to-indigo-500 mx-auto mb-3 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <p className="text-3xl font-bold text-gray-800">
                          {(redditData.link_karma + redditData.comment_karma).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Total Karma</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">Karma data unavailable</div>
                  )}
                </div>
              </div>
              
              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Account Activity</h2>
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Account Created</p>
                          <p className="font-medium text-gray-800">
                            {redditData ? formatDate(redditData.created_utc) : 'Unavailable'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 flex items-center justify-center mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Account Status</p>
                          <p className="font-medium text-gray-800">
                            {redditData ? 'Active' : 'Unavailable'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {redditData && (
                      <div className="text-center mt-4 py-2 px-4 rounded-lg bg-blue-50 text-blue-800 text-sm">
                        Reddit account in good standing
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Most Visited Subreddits Section - Full Width */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Your Most Visited Subreddits</h2>
                {subredditSource === 'subscribed' && (
                  <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-lg">
                    * Estimated visits based on subscriptions
                  </span>
                )}
                {subredditSource === 'simulated' && (
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-lg">
                    * Demonstration with simulated visit data
                  </span>
                )}
              </div>
              <div className="p-6">
                {loadingSubreddits ? (
                  <div className="text-center py-8">
                    <div className="h-8 w-8 rounded-full border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent animate-spin mb-3 mx-auto"></div>
                    <p className="text-gray-500">Analyzing your Reddit activity...</p>
                  </div>
                ) : subredditError ? (
                  <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                    <div className="flex items-center">
                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 text-red-500 mr-3">
                        ⚠️
                      </div>
                      <div>{subredditError}</div>
                    </div>
                  </div>
                ) : subreddits.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subreddits.map(sub => (
                      <div key={sub.display_name} className="flex items-center p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
                        <div 
                          className="w-12 h-12 rounded-full mr-4 flex items-center justify-center relative"
                          style={{ 
                            backgroundColor: sub.primary_color || '#FF4500',
                            overflow: 'hidden'
                          }}
                        >
                          {sub.icon_img ? (
                            <img 
                              src={decodeHtmlEntities(sub.icon_img)} 
                              alt={sub.display_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white text-lg font-bold">
                              {sub.display_name.charAt(0).toUpperCase()}
                            </span>
                          )}
                          
                          {/* Visit count badge */}
                          <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
                            {sub.visit_count}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <p className="font-medium text-gray-800">r/{sub.display_name}</p>
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-md font-medium">
                              {sub.visit_count} visits
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {sub.subscribers?.toLocaleString() || '0'} members
                          </p>
                          {sub.public_description && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                              {sub.public_description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-200 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="text-gray-600 font-medium">No browsing history available</p>
                    <p className="text-gray-500 text-sm mt-1">
                      Your Reddit permissions might be limiting access to history data.
                    </p>
                    <div className="mt-4">
                      <a 
                        href="/" 
                        onClick={(e) => { 
                          e.preventDefault(); 
                          signOut({ callbackUrl: "/" });
                        }}
                        className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                      >
                        Sign out and try again with different permissions
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer Card with Sign Out */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Data refreshed at: {new Date().toLocaleTimeString()}
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2 px-6 rounded-lg shadow-sm transition-all"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}