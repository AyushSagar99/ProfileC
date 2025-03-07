

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { TrendingUp, Lightbulb } from 'lucide-react';


const decodeHtmlEntities = (html: string | undefined) => {
  if (!html) return '';
  const textArea = document.createElement('textarea');
  textArea.innerHTML = html;
  return textArea.value;
};

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

interface TrendingSubredditsProps {
  trending: SubredditData[];
  recommended: SubredditData[];
  isLoading: boolean;
  error: string | null;
}

export default function TrendingSubreddits({ 
  trending, 
  recommended, 
  isLoading, 
  error 
}: TrendingSubredditsProps) {
  
  const [fallbackSuggestions, setFallbackSuggestions] = useState<SubredditData[]>([]);
  
 
  useEffect(() => {
    if ((!trending || trending.length === 0) && (!recommended || recommended.length === 0) && !isLoading) {
   
      const popularSuggestions: SubredditData[] = [
        {
          display_name: "AskReddit",
          subscribers: 41000000,
          primary_color: "#FF4500",
          growth_percentage: 12
        },
        {
          display_name: "funny",
          subscribers: 38500000,
          primary_color: "#0079D3",
          growth_percentage: 8
        },
        {
          display_name: "gaming",
          subscribers: 36200000,
          primary_color: "#FF5700",
          growth_percentage: 15
        },
        {
          display_name: "aww",
          subscribers: 32400000,
          primary_color: "#FF4500",
          growth_percentage: 7
        },
        {
          display_name: "pics",
          subscribers: 29800000,
          primary_color: "#0079D3",
          growth_percentage: 5
        },
        {
          display_name: "science",
          subscribers: 28500000,
          primary_color: "#3D9BE9",
          growth_percentage: 10
        }
      ];
      
      setFallbackSuggestions(popularSuggestions);
    }
  }, [trending, recommended, isLoading]);
  
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Discover Subreddits
          </h2>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <div className="h-8 w-8 rounded-full border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent animate-spin mb-3 mx-auto"></div>
            <p className="text-gray-500 dark:text-gray-400">Discovering Reddit communities for you...</p>
          </div>
        </div>
      </div>
    );
  }

  const displayTrending = trending && trending.length > 0 ? trending : fallbackSuggestions;
  const hasRecommended = recommended && recommended.length > 0;
  
  if (!displayTrending.length && !hasRecommended) {
    return null;
  }

  const hasError = error !== null && error !== '';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Discover Subreddits
        </h2>
        {fallbackSuggestions.length > 0 && trending.length === 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Popular communities you might enjoy</p>
        )}
      </div>
      
      <div className="p-6">
        {/* Error message if there is an error */}
        {hasError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-800/50">
            <p className="text-sm">{error}</p>
            <p className="text-xs mt-1">Showing suggested communities instead.</p>
          </div>
        )}
        
        {/* Trending Section */}
        {displayTrending.length > 0 && (
          <div className="mb-8">
            <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
              <div className="w-6 h-6 mr-2 flex items-center justify-center text-red-500 dark:text-red-400">
                <TrendingUp size={20} />
              </div>
              {fallbackSuggestions.length > 0 && trending.length === 0 ? 
                "Popular Communities" : 
                "Trending Communities"}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {displayTrending.slice(0, 6).map(sub => (
                <div key={sub.display_name} className="flex items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-black/20 transition-all hover:border-red-200 dark:hover:border-red-500/30">
                  <div 
                    className="w-10 h-10 rounded-full mr-3 flex items-center justify-center relative shadow-sm"
                    style={{ 
                      backgroundColor: sub.primary_color || '#FF4500',
                      overflow: 'hidden'
                    }}
                  >
                    {sub.icon_img ? (
                      <Image 
                        src={decodeHtmlEntities(sub.icon_img)}
                        alt={sub.display_name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-sm font-bold">
                        {sub.display_name.charAt(0).toUpperCase()}
                      </span>
                    )}
                    
                    {/* Growth Badge */}
                    {sub.growth_percentage && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white dark:border-gray-800">
                        {sub.growth_percentage}%
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 overflow-hidden">
                    <p className="font-medium text-gray-800 dark:text-gray-200 truncate">r/{sub.display_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {sub.subscribers?.toLocaleString() || '0'} members
                    </p>
                    {sub.trending_rank && (
                      <div className="mt-1">
                        <span className="inline-block px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-full">
                          #{sub.trending_rank} Trending
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Recommended Section */}
        {hasRecommended && (
          <div>
            <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
              <div className="w-6 h-6 mr-2 flex items-center justify-center text-purple-500 dark:text-purple-400">
                <Lightbulb size={20} />
              </div>
              Recommended For You
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {recommended.map(sub => (
                <div key={sub.display_name} className="flex items-center p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-gray-200 dark:border-purple-800/30 hover:shadow-md dark:hover:shadow-black/20 transition-all hover:border-purple-300 dark:hover:border-purple-500/50">
                  <div 
                    className="w-10 h-10 rounded-full mr-3 flex items-center justify-center shadow-sm"
                    style={{ 
                      backgroundColor: sub.primary_color || '#8A63D2',
                      overflow: 'hidden'
                    }}
                  >
                    {sub.icon_img ? (
                      <Image 
                        src={decodeHtmlEntities(sub.icon_img)}
                        alt={sub.display_name}
                        width={40}
                        height={40}
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
                    {sub.recommended_because && (
                      <div className="mt-1">
                        <span className="inline-block px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded-full truncate max-w-full">
                          {sub.recommended_because}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Action Button */}
        <div className="mt-6 text-center">
          <Button
            className="bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-700 hover:to-rose-700 text-white"
            onClick={() => window.open('https://www.reddit.com/subreddits/popular/', '_blank')}
          >
            Browse More Communities
          </Button>
        </div>
      </div>
    </div>
  );
}