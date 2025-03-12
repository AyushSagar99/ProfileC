// app/shared/[token]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import { ArrowBigUp, Trophy, Calendar, User } from 'lucide-react';

// interface SharePayload {
//   userId: string;
//   username?: string;
//   created: number;
//   isAnonymous: boolean;
// }

interface RedditUserProfile {
  username?: string;
  avatarUrl?: string;
  karma: {
    post: number;
    comment: number;
    total: number;
  };
  accountAge: string;
  trophies: string[];
  isAnonymous: boolean;
}

export default function SharedProfilePage() {
  // Use the useParams hook instead of receiving params as props
  const params = useParams();
  const token = params.token as string;
  
  // Remove unused state
  // const [tokenData, setTokenData] = useState<SharePayload | null>(null);
  const [profile, setProfile] = useState<RedditUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        console.log("Starting to fetch profile with token:", token ? `${token.substring(0, 10)}...` : 'none');
        
        const response = await axios.get(`/api/reddit/verify-token?token=${token}`);
        console.log("Token verification response:", response.data);
        
        if (!response.data.isValid) {
          console.error("Token verification failed:", response.data.error);
          setError('This share link is invalid or has expired');
          setLoading(false);
          return;
        }
        
        console.log("Token is valid, token data:", response.data.tokenData);
        
        // Fetch profile data based on anonymity setting
        let profileResponse;
        
        if (response.data.tokenData.isAnonymous) {
          // Pass the token in headers for anonymous profiles
          console.log("Fetching anonymous profile for userId:", response.data.tokenData.userId);
          
          try {
            profileResponse = await axios.get(
              `/api/reddit/anonymous-profile/${response.data.tokenData.userId}`,
              {
                headers: {
                  'x-share-token': token
                }
              }
            );
            console.log("Anonymous profile response:", profileResponse.status, profileResponse.data);
          } catch (anonError) {
            console.error("Anonymous profile fetch error:", anonError);
            throw anonError;
          }
        } else {
          console.log("Fetching public profile for username:", response.data.tokenData.username);
          
          try {
            profileResponse = await axios.get(
              `/api/reddit/profile?username=${response.data.tokenData.username}`
            );            
            console.log("Public profile response:", profileResponse.status, profileResponse.data);
          } catch (publicError) {
            console.error("Public profile fetch error:", publicError);
            throw publicError;
          }
        }
        
        console.log("Setting profile with data:", profileResponse.data);
        
        // In your shared profile page, update the setProfile call
if (profileResponse.data.error) {
  console.warn("API returned data with error:", profileResponse.data.error);
}

setProfile({
  ...profileResponse.data,
  isAnonymous: response.data.tokenData.isAnonymous
});
        
        setLoading(false);
      } catch (err: unknown) {
        // Use a proper type for the error
        const error = err as Error & { 
          response?: { 
            data?: { error?: string },
            status?: number
          } 
        };
        
        // Add more detailed error logging
        const errorDetails = error.response?.data?.error || error.message || 'Unknown error';
        const statusCode = error.response?.status;
        
        console.error('Error loading shared profile:', {
          message: errorDetails,
          status: statusCode,
          fullError: String(error)
        });
        
        setError(`Unable to load profile data: ${errorDetails}${statusCode ? ` (${statusCode})` : ''}`);
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [token]);
  
  // Rest of the component remains the same...
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950 transition-colors duration-300">
        <div className="flex flex-col items-center">
          <div className="h-14 w-14 rounded-full border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent animate-spin mb-6"></div>
          <div className="text-xl font-medium text-gray-700 dark:text-gray-300">
            Loading shared profile...
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-md w-full">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-center text-gray-800 dark:text-gray-200 mb-2">Invalid Share Link</h2>
          <p className="text-gray-600 dark:text-gray-400 text-center">
            {error || 'This share link is invalid or has expired.'}
          </p>
        </div>
      </div>
    );
  }
  
  const displayName = profile.isAnonymous 
    ? "Anonymous Redditor" 
    : `u/${profile.username}`;
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 py-8 px-4 transition-colors duration-300">
      <div className="container mx-auto max-w-3xl">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center">
              {profile.isAnonymous ? (
                <User className="h-8 w-8 text-gray-500" />
              ) : profile.avatarUrl ? (
                <Image 
                  src={profile.avatarUrl}
                  alt={displayName}
                  width={64}
                  height={64}
                  className="object-cover h-full w-full"
                />
              ) : (
                <User className="h-8 w-8 text-gray-500" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{displayName}</h2>
              <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Redditor since {profile.accountAge}</span>
              </p>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Karma Card */}
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 shadow-sm">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <ArrowBigUp className="h-5 w-5 text-orange-500" />
                Karma
              </h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{profile.karma.post.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Post</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{profile.karma.comment.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Comment</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{profile.karma.total.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                </div>
              </div>
            </div>
            
            {/* Trophies Card */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 shadow-sm">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Trophies
              </h3>
              <ul className="list-disc pl-5">
                {profile.trophies.slice(0, 5).map((trophy, index) => (
                  <li key={index} className="text-sm text-gray-700 dark:text-gray-300">{trophy}</li>
                ))}
                {profile.trophies.length > 5 && (
                  <li className="text-sm text-gray-500">+{profile.trophies.length - 5} more</li>
                )}
              </ul>
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              This Reddit profile data was shared on {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}