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
  
  // Fetch user's history to determine most visited subreddits using our server API route
  // Fix for the useEffect dependency array issue
// Change this part in your profile page:

// Fetch user's history to determine most visited subreddits using our server API route
useEffect(() => {
  if (!redditData) return;
  
  setLoadingSubreddits(true);
  
  // Use alternative API route for subscribed subreddits
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
        
        setSubreddits(subredditList.slice(0, 5)); // Top 5 most popular
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }
  
  if (!session) {
    return null; // Will redirect in the useEffect
  }
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Your Reddit Profile</h1>
        
        {error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-md mb-4">
            {error}
          </div>
        ) : redditData ? (
          <div className="space-y-6">
            {/* Profile Header with Avatar */}
            <div className="flex items-center space-x-4">
              <div className="relative h-20 w-20 rounded-full overflow-hidden bg-gray-200">
                {redditData.subreddit?.icon_img ? (
                  <Image 
                    src={decodeHtmlEntities(redditData.subreddit.icon_img)}
                    alt="Profile"
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-orange-500 text-white text-xl font-bold">
                    {redditData.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              
              <div>
                <h2 className="text-xl font-bold">{redditData.name}</h2>
                <p className="text-sm text-gray-500">u/{redditData.name}</p>
              </div>
            </div>
            
            {/* Karma Statistics */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-md">
              <div className="text-center">
                <p className="text-2xl font-bold">{redditData.link_karma}</p>
                <p className="text-sm text-gray-600">Post Karma</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{redditData.comment_karma}</p>
                <p className="text-sm text-gray-600">Comment Karma</p>
              </div>
            </div>
            
            {/* Account Details */}
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Account Created</p>
                <p className="font-medium">{formatDate(redditData.created_utc)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Reddit ID</p>
                <p className="font-medium">{redditData.id}</p>
              </div>
              
              {/* Status Badges */}
              <div className="flex flex-wrap gap-2 mt-2">
                {redditData.has_verified_email && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Verified Email
                  </span>
                )}
                {redditData.is_gold && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    Reddit Gold
                  </span>
                )}
                {redditData.is_mod && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Moderator
                  </span>
                )}
              </div>
            </div>
            
            {/* Subscribed Subreddits Section */}
<div className="mt-6">
  <h2 className="text-lg font-semibold mb-3">Your Subreddits</h2>
  
  {loadingSubreddits ? (
    <div className="text-center py-4">
      <p className="text-gray-500">Loading your subreddits...</p>
    </div>
  ) : subredditError ? (
    <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
      {subredditError}
    </div>
  ) : subreddits.length > 0 ? (
    <div className="space-y-2">
      {subreddits.map(sub => (
        <div key={sub.display_name} className="flex items-center p-2 bg-gray-50 rounded-md hover:bg-gray-100">
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
          <div className="flex-1">
            <p className="font-medium">r/{sub.display_name}</p>
            <p className="text-xs text-gray-500">
              {sub.subscribers.toLocaleString()} members
            </p>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-gray-500 text-center py-4">
      No subreddit data available
    </p>
  )}
</div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-gray-600">Username:</p>
              <p className="font-medium">{session.user?.name}</p>
            </div>
            
            <div className="flex justify-center my-4">
              <div className="relative h-20 w-20 rounded-full overflow-hidden bg-orange-500 flex items-center justify-center text-white text-xl font-bold">
                {session.user?.name?.charAt(0).toUpperCase() || 'R'}
              </div>
            </div>
          </div>
        )}
        
        {/* Sign Out Button */}
        <div className="pt-6 mt-4">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}