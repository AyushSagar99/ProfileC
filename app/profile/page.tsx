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
  
  // State for subreddits
  const [subreddits, setSubreddits] = useState<any[]>([]);
  const [loadingSubreddits, setLoadingSubreddits] = useState(false);
  const [subredditError, setSubredditError] = useState("");
  
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
  
  // Fetch user's subreddits
  useEffect(() => {
    if (!redditData) return;
    
    setLoadingSubreddits(true);
    
    // Use the subscribed subreddits endpoint
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
            .map((child: any) => child.data)
            .sort((a: any, b: any) => b.subscribers - a.subscribers); // Sort by popularity
          
          setSubreddits(subredditList);
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

            {/* Subreddits Section - Full Width */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800">Your Subreddits</h2>
              </div>
              <div className="p-6">
                {loadingSubreddits ? (
                  <div className="text-center py-8">
                    <div className="h-8 w-8 rounded-full border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent animate-spin mb-3 mx-auto"></div>
                    <p className="text-gray-500">Loading your subreddits...</p>
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
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {subreddits.slice(0, 12).map(sub => (
                        <div key={sub.display_name} className="flex items-center p-3 bg-gradient-to-r from-white to-gray-50 rounded-lg border border-gray-100 hover:shadow-md transition-all hover:border-purple-200">
                          <div 
                            className="w-10 h-10 rounded-full mr-3 flex items-center justify-center"
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
                              <span className="text-white text-sm font-bold">
                                {sub.display_name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="font-medium text-gray-800 truncate">r/{sub.display_name}</p>
                            <p className="text-xs text-gray-500 truncate">
                              {sub.subscribers?.toLocaleString() || '0'} members
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      {subreddits.length > 12 && (
                        <div className="col-span-full mt-2">
                          <div className="flex justify-center">
                            <button 
                              onClick={() => {
                                const subredditModal = document.getElementById('subredditModal');
                                if (subredditModal) subredditModal.classList.remove('hidden');
                              }}
                              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-blue-600 transition-colors"
                            >
                              View All {subreddits.length} Subreddits
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Modal for all subreddits */}
                    <div id="subredditModal" className="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                          <h3 className="text-xl font-bold text-gray-800">All Your Subreddits</h3>
                          <button 
                            onClick={() => {
                              const subredditModal = document.getElementById('subredditModal');
                              if (subredditModal) subredditModal.classList.add('hidden');
                            }}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        
                        <div className="p-5 overflow-y-auto">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {subreddits.map(sub => (
                              <div key={`modal-${sub.display_name}`} className="flex items-center p-3 bg-white rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                                <div 
                                  className="w-8 h-8 rounded-full mr-3 flex items-center justify-center"
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
                                    <span className="text-white text-xs font-bold">
                                      {sub.display_name.charAt(0).toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                  <p className="font-medium text-gray-800 truncate">r/{sub.display_name}</p>
                                  <p className="text-xs text-gray-500 truncate">
                                    {sub.subscribers?.toLocaleString() || '0'}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-200 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="text-gray-600 font-medium">No subreddit data available</p>
                    <p className="text-gray-500 text-sm mt-1">
                      Try refreshing or check your Reddit permissions.
                    </p>
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