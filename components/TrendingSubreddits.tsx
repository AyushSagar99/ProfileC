// Update the TrendingSubreddits component to handle empty data gracefully:

import React, { useEffect, useState } from 'react';

// Helper function to decode HTML entities in URLs
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
  
  // Generate fallback suggestions if API fails
  useEffect(() => {
    if ((!trending || trending.length === 0) && (!recommended || recommended.length === 0) && !isLoading) {
      // Create some fallback suggestions for popular subreddits
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
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Discover Subreddits</h2>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <div className="h-8 w-8 rounded-full border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent animate-spin mb-3 mx-auto"></div>
            <p className="text-gray-500">Discovering Reddit communities for you...</p>
          </div>
        </div>
      </div>
    );
  }

  // We'll show fallback suggestions if API data is missing
  const displayTrending = trending && trending.length > 0 ? trending : fallbackSuggestions;
  const hasRecommended = recommended && recommended.length > 0;
  
  // If we have no data and no fallbacks, don't render the section
  if (!displayTrending.length && !hasRecommended) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">Discover Subreddits</h2>
        {fallbackSuggestions.length > 0 && trending.length === 0 && (
          <p className="text-xs text-gray-500 mt-1">Popular communities you might enjoy</p>
        )}
      </div>
      
      <div className="p-6">
        {/* Trending Section */}
        {displayTrending.length > 0 && (
          <div className="mb-8">
            <h3 className="text-md font-semibold text-gray-700 mb-4 flex items-center">
              <div className="w-6 h-6 mr-2 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              {fallbackSuggestions.length > 0 && trending.length === 0 ? 
                "Popular Communities" : 
                "Trending Communities"}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {displayTrending.slice(0, 6).map(sub => (
                <div key={sub.display_name} className="flex items-center p-3 bg-gradient-to-r from-white to-gray-50 rounded-lg border border-gray-100 hover:shadow-md transition-all hover:border-red-200">
                  <div 
                    className="w-10 h-10 rounded-full mr-3 flex items-center justify-center relative"
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
                    
                    {/* Growth Badge */}
                    {sub.growth_percentage && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
                        {sub.growth_percentage}%
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 overflow-hidden">
                    <p className="font-medium text-gray-800 truncate">r/{sub.display_name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {sub.subscribers?.toLocaleString() || '0'} members
                    </p>
                    {sub.trending_rank && (
                      <div className="mt-1">
                        <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
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
            <h3 className="text-md font-semibold text-gray-700 mb-4 flex items-center">
              <div className="w-6 h-6 mr-2 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              Recommended For You
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {recommended.map(sub => (
                <div key={sub.display_name} className="flex items-center p-3 bg-gradient-to-r from-white to-purple-50 rounded-lg border border-gray-100 hover:shadow-md transition-all hover:border-purple-200">
                  <div 
                    className="w-10 h-10 rounded-full mr-3 flex items-center justify-center"
                    style={{ 
                      backgroundColor: sub.primary_color || '#8A63D2',
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
                    {sub.recommended_because && (
                      <div className="mt-1">
                        <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full truncate max-w-full">
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
          <a 
            href="https://www.reddit.com/subreddits/popular/" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-2 bg-gradient-to-r from-purple-500 to-red-500 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-red-600 transition-colors"
          >
            Browse More Communities
          </a>
        </div>
      </div>
    </div>
  );
}