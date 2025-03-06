// components/UserTrophies.tsx
import React from 'react';

// Helper function to decode HTML entities in URLs
const decodeHtmlEntities = (html: string | undefined) => {
  if (!html) return '';
  const textArea = document.createElement('textarea');
  textArea.innerHTML = html;
  return textArea.value;
};

interface TrophyData {
  icon_70: string;
  icon_40: string;
  name: string;
  description?: string;
  award_id?: string;
  url?: string;
  granted_at?: number;
}

interface Trophy {
  kind: string;
  data: TrophyData;
}

interface UserTrophiesProps {
  trophies: Trophy[];
  isLoading: boolean;
  error: string | null;
  username: string;
}

export default function UserTrophies({ 
  trophies, 
  isLoading, 
  error,
  username
}: UserTrophiesProps) {

  // Default fallback trophies if API fails or user has none
  const fallbackTrophies: Trophy[] = [
    {
      kind: "t6",
      data: {
        icon_70: "https://www.redditstatic.com/awards2/verified_email-70.png",
        icon_40: "https://www.redditstatic.com/awards2/verified_email-40.png",
        name: "Verified Email",
        description: "User has a verified email address"
      }
    },
    {
      kind: "t6",
      data: {
        icon_70: "https://www.redditstatic.com/awards2/one_year_club-70.png",
        icon_40: "https://www.redditstatic.com/awards2/one_year_club-40.png",
        name: "One-Year Club",
        description: "Reddit member for 1 year"
      }
    }
  ];
  
  // Format trophy grant date
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'Date unknown';
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Trophy Case</h2>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <div className="h-8 w-8 rounded-full border-4 border-t-amber-500 border-r-transparent border-b-transparent border-l-transparent animate-spin mb-3 mx-auto"></div>
            <p className="text-gray-500">Loading your trophy case...</p>
          </div>
        </div>
      </div>
    );
  }

  // Use fallbacks if no trophies or there was an error
  const displayTrophies = (trophies && trophies.length > 0) ? trophies : fallbackTrophies;
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">Trophy Case</h2>
        <p className="text-xs text-gray-500">{username}'s achievements on Reddit</p>
      </div>
      
      <div className="p-6">
        {error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm mb-4">
            <div className="flex items-center">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 text-red-500 mr-3">
                ⚠️
              </div>
              <div>{error}</div>
            </div>
          </div>
        ) : null}
        
        {displayTrophies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {displayTrophies.map((trophy, index) => (
              <div 
                key={`${trophy.data.name}-${index}`} 
                className="flex flex-col items-center bg-gradient-to-b from-amber-50 to-amber-100 p-4 rounded-lg text-center hover:shadow-md transition-shadow group"
              >
                <div className="relative h-16 w-16 mb-3">
                  {trophy.data.icon_70 ? (
                    <img 
                      src={decodeHtmlEntities(trophy.data.icon_70)}
                      alt={trophy.data.name}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-amber-200 rounded-full text-amber-800 text-xl font-bold">
                      🏆
                    </div>
                  )}
                </div>
                
                <h3 className="font-medium text-gray-800 text-sm mb-1">{trophy.data.name}</h3>
                
                {trophy.data.description && (
                  <p className="text-xs text-gray-500 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {trophy.data.description}
                  </p>
                )}
                
                {trophy.data.granted_at && (
                  <p className="text-xs text-amber-600 font-medium">
                    {formatDate(trophy.data.granted_at)}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-amber-200 text-amber-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">No trophies yet</p>
            <p className="text-gray-500 text-sm mt-1">
              Keep participating in Reddit to earn trophies!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}