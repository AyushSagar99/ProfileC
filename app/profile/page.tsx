// File: app/profile/page.tsx
'use client';

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import TrendingSubreddits from "@/components/TrendingSubreddits";
import UserTrophies from "@/components/UserTrophies";
import { ModeToggle } from "@/components/toggle-theme";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

/* eslint-disable @next/next/no-img-element */

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

// Define the subreddit data type
interface SubredditData {
  display_name: string;
  subscribers: number;
  public_description?: string;
  icon_img?: string;
  primary_color?: string;
  banner_img?: string;
  growth_percentage?: number;
  trending_rank?: number;
  recommended_because?: string;
}

// Define the trophy data type
interface TrophyData {
  icon_70: string;
  icon_40?: string;
  name: string;
  description?: string;
  detailed_description?: string;
  award_id?: string;
  url?: string;
  granted_at?: number;
}

interface Trophy {
  kind: string;
  data: TrophyData;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [redditData, setRedditData] = useState<RedditUserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // State for subscribed subreddits
  const [subreddits, setSubreddits] = useState<SubredditData[]>([]);
  const [loadingSubreddits, setLoadingSubreddits] = useState(false);
  const [subredditError, setSubredditError] = useState("");
  
  // State for trending subreddits
  const [trendingSubreddits, setTrendingSubreddits] = useState<SubredditData[]>([]);
  const [recommendedSubreddits, setRecommendedSubreddits] = useState<SubredditData[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(false);
  const [trendingError, setTrendingError] = useState<string | null>(null);
  
  const [trophies, setTrophies] = useState<Trophy[]>([]);
  const [loadingTrophies, setLoadingTrophies] = useState(false);
  const [trophyError, setTrophyError] = useState<string | null>(null);
  
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
          .map((child: { data: SubredditData }) => child.data)
          .sort((a: SubredditData, b: SubredditData) => (b.subscribers || 0) - (a.subscribers || 0)); // Sort by popularity
          
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
  
  // Fetch trending subreddits
  useEffect(() => {
    if (!redditData) return;
    
    setLoadingTrending(true);
    
    // Use the trending API endpoint
    fetch('/api/reddit/trending')
      .then(response => {
        return response.json().catch(() => {
          return {};
        });
      })
      .then(data => {
        if (data.error) {
          console.warn("Trending API returned an error:", data.error);
          setTrendingError(data.error);
          setTrendingSubreddits([]);
          setRecommendedSubreddits([]);
        } else {
          setTrendingSubreddits(data.trending || []);
          setRecommendedSubreddits(data.recommended || []);
        }
        setLoadingTrending(false);
      })
      .catch(err => {
        console.error("Error fetching trending subreddits:", err);
        setTrendingSubreddits([]);
        setRecommendedSubreddits([]);
        setLoadingTrending(false);
      });
  }, [redditData]);

  // Update the useEffect for trophies
  useEffect(() => {
    if (!redditData) return;
    
    setLoadingTrophies(true);
    
    // Use the trophies API endpoint
    fetch('/api/reddit/trophies')
      .then(response => {
        return response.json().catch(() => {
          return { error: 'Failed to parse response' };
        });
      })
      .then(data => {
        if (data.error) {
          console.warn("Trophies API returned an error:", data.error);
          setTrophies([]);
          setTrophyError(null);
        } else {
          setTrophies(data.trophies || []);
          setTrophyError(null);
        }
        setLoadingTrophies(false);
      })
      .catch(err => {
        console.error("Error fetching trophies:", err);
        setTrophies([]);
        setTrophyError(null);
        setLoadingTrophies(false);
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
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950 transition-colors duration-300">
        <div className="flex flex-col items-center">
          <div className="h-14 w-14 rounded-full border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent animate-spin mb-6">
          </div>
          <div className="text-xl font-medium text-gray-700 dark:text-gray-300">
            Loading your dashboard...
          </div>
          <div className="mt-4 text-xs text-gray-500">Connecting to Reddit API</div>
        </div>
      </div>
    );
  }
  
  if (!session) {
    return null; // Will redirect in the useEffect
  }
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-800 dark:text-gray-300 transition-colors duration-300">
      {/* Top Navigation */}
      <div className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-purple-500 bg-clip-text text-transparent">
              Reddit Dashboard
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <ModeToggle/>
            
            {redditData && (
              <div className="flex items-center">
                <span className="mr-3 font-medium hidden md:inline text-gray-700 dark:text-gray-200">{redditData.name}</span>
                <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-purple-300 dark:border-purple-500/30 ring-2 ring-purple-100 dark:ring-purple-500/20 shadow-lg">
                  {redditData.subreddit?.icon_img ? (
                    <Image 
                      src={decodeHtmlEntities(redditData.subreddit.icon_img)}
                      alt="Profile"
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-orange-500 text-white text-sm font-bold">
                      {redditData.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <UserTrophies 
          trophies={trophies}
          isLoading={loadingTrophies}
          error={trophyError}
          username={redditData?.name || ''}
        />
        
        {error ? (
          <div className="p-5 bg-red-100 dark:bg-red-500/10 border-l-4 border-red-500 rounded-lg mb-6">
            <div className="flex items-center">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-red-200 dark:bg-red-500/20 text-red-500 dark:text-red-400 mr-3">
                ⚠️
              </div>
              <div className="text-red-600 dark:text-red-400">{error}</div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Profile Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:shadow-md group">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </h2>
                  {redditData ? (
                    <div className="flex flex-col items-center">
                      <div className="relative h-24 w-24 rounded-full overflow-hidden mb-4 border-2 border-purple-200 dark:border-purple-500/30 ring-4 ring-purple-100 dark:ring-purple-500/10 shadow-md">
                        {redditData.subreddit?.icon_img ? (
                          <Image 
                            src={decodeHtmlEntities(redditData.subreddit.icon_img)}
                            alt="Profile"
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-orange-500 text-white text-2xl font-bold">
                            {redditData.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{redditData.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">u/{redditData.name}</p>
                      
                      <div className="w-full mt-2 space-y-2">
                        <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-gray-500 dark:text-gray-400">Account Age</span>
                          <span className="font-medium text-gray-800 dark:text-gray-300">{formatDate(redditData.created_utc)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-gray-500 dark:text-gray-400">Reddit ID</span>
                          <span className="font-medium text-xs text-gray-600 dark:text-gray-500">{redditData.id}</span>
                        </div>
                      </div>
                      
                      {/* Status Badges */}
                      <div className="flex flex-wrap gap-2 mt-4 justify-center">
                        {redditData.has_verified_email && (
                          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs rounded-full font-medium">
                            Verified Email
                          </span>
                        )}
                        {redditData.is_gold && (
                          <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 text-xs rounded-full font-medium">
                            Reddit Gold
                          </span>
                        )}
                        {redditData.is_mod && (
                          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs rounded-full font-medium">
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
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Karma Statistics
                  </h2>
                  {redditData ? (
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center shadow-sm">
                        <div className="w-12 h-12 rounded-full bg-blue-500 dark:bg-blue-600 mx-auto mb-3 flex items-center justify-center shadow-md text-white">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                          </svg>
                        </div>
                        <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{redditData.link_karma.toLocaleString()}</p>
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">Post Karma</p>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center shadow-sm">
                        <div className="w-12 h-12 rounded-full bg-purple-500 dark:bg-purple-600 mx-auto mb-3 flex items-center justify-center shadow-md text-white">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                        </div>
                        <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{redditData.comment_karma.toLocaleString()}</p>
                        <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">Comment Karma</p>
                      </div>
                      
                      {/* Total Karma Card */}
                      <div className="col-span-2 bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6 text-center shadow-sm">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 mx-auto mb-4 flex items-center justify-center shadow-md text-white">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <p className="text-4xl font-bold text-gray-800 dark:text-gray-200">
                          {(redditData.link_karma + redditData.comment_karma).toLocaleString()}
                        </p>
                        <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">Total Karma</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">Karma data unavailable</div>
                  )}
                </div>
              </div>
              
              {/* Account Activity */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Account Activity
                  </h2>
                  <div className="space-y-4">
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 shadow-sm">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-green-500 dark:bg-green-600 flex items-center justify-center mr-3 shadow-md text-white">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-green-600 dark:text-green-400">Account Created</p>
                          <p className="font-medium text-gray-800 dark:text-gray-200">
                            {redditData ? formatDate(redditData.created_utc) : 'Unavailable'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 shadow-sm">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-orange-500 dark:bg-orange-600 flex items-center justify-center mr-3 shadow-md text-white">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-orange-600 dark:text-orange-400">Account Status</p>
                          <p className="font-medium text-gray-800 dark:text-gray-200">
                            {redditData ? 'Active' : 'Unavailable'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {redditData && (
                      <div className="mt-4 py-3 px-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-center shadow-sm">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-emerald-500 dark:bg-emerald-600 flex items-center justify-center text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-emerald-600 dark:text-emerald-400 text-sm">Reddit account in good standing</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Trending Subreddits Section */}
            <TrendingSubreddits 
              trending={trendingSubreddits}
              recommended={recommendedSubreddits}
              isLoading={loadingTrending}
              error={trendingError}
            />

            {/* Your Subreddits Section - Full Width */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Your Subreddits
                </h2>
              </div>
              <div className="p-6">
                {loadingSubreddits ? (
                  <div className="text-center py-8">
                    <div className="h-8 w-8 rounded-full border-4 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent animate-spin mb-3 mx-auto"></div>
                    <p className="text-gray-500 dark:text-gray-400">Loading your subreddits...</p>
                  </div>
                ) : subredditError ? (
                  <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                    <div className="flex items-center">
                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-red-200 dark:bg-red-800/30 text-red-500 dark:text-red-400 mr-3">
                        ⚠️
                      </div>
                      <div>{subredditError}</div>
                    </div>
                  </div>
                ) : subreddits.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {subreddits.slice(0, 12).map(sub => (
                        <div key={sub.display_name} className="flex items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all hover:border-indigo-300 dark:hover:border-indigo-500/30">
                          <div 
                            className="w-10 h-10 rounded-full mr-3 flex items-center justify-center shadow-sm"
                            style={{ 
                              backgroundColor: sub.primary_color || '#6366F1',
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
                            <p className="font-medium text-gray-800 dark:text-gray-200 truncate">r/{sub.display_name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {sub.subscribers?.toLocaleString() || '0'} members
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      {subreddits.length > 12 && (
                        <div className="col-span-full mt-4">
                          <div className="flex justify-center">
                            <Button 
                              onClick={() => {
                                const subredditModal = document.getElementById('subredditModal');
                                if (subredditModal) subredditModal.classList.remove('hidden');
                              }}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                              </svg>
                              View All {subreddits.length} Subreddits
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Modal for all subreddits */}
                    <div id="subredditModal" className="hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-4xl w-full max-h-[90vh] flex flex-col">
                        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            All Your Subreddits
                          </h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const subredditModal = document.getElementById('subredditModal');
                              if (subredditModal) subredditModal.classList.add('hidden');
                            }}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </Button>
                        </div>
                        
                        <div className="p-5 overflow-y-auto">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {subreddits.map(sub => (
                              <div key={`modal-${sub.display_name}`} className="flex items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all">
                                <div 
                                  className="w-8 h-8 rounded-full mr-3 flex items-center justify-center"
                                  style={{ 
                                    backgroundColor: sub.primary_color || '#6366F1',
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
                                  <p className="font-medium text-gray-800 dark:text-gray-200 truncate">r/{sub.display_name}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
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
                  <div className="text-center py-10 px-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 font-medium">No subreddit data available</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                      Try refreshing or check your Reddit permissions.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer Card with Sign Out */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
              <div className="px-6 py-4 flex justify-between items-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Data refreshed at: {new Date().toLocaleTimeString()}
                </div>
                <Button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}