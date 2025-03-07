// components/UserTrophies.tsx
import React, { useState } from 'react';
import Image from 'next/image'; // Import Next.js Image component

// Helper function to decode HTML entities in URLs
const decodeHtmlEntities = (html: string | undefined) => {
  if (!html) return '';
  const textArea = document.createElement('textarea');
  textArea.innerHTML = html;
  return textArea.value;
};

interface TrophyData {
  icon_70: string;
  icon_40?: string;
  name: string;
  description?: string;
  detailed_description?: string; // Added field for detailed descriptions
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
  // State for selected trophy (for modal view)
  const [selectedTrophy, setSelectedTrophy] = useState<TrophyData | null>(null);
  
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
  
  // Get trophy rarities based on frequency
  const getTrophyRarity = (trophyName: string) => {
    // Common trophies that most users have
    const commonTrophies = ['verified email', 'one-year club', 'two-year club', 'three-year club', 'four-year club', 'five-year club'];
    
    // Uncommon trophies that some users have
    const uncommonTrophies = ['gilding i', 'gilding ii', 'popular post', 'well-rounded', 'team orangered', 'team periwinkle'];
    
    // Rare trophies
    const rareTrophies = ['gilding iii', 'gilding iv', 'gilding v', 'best comment', 'inciteful comment', 'best link', 'inciteful link'];
    
    // Very rare trophies
    const veryRareTrophies = ['gilding vi', 'gilding vii', 'gilding viii', 'gilding ix', 'reddit gold', 'reddit platinum', 'moderator', 'beta team'];
    
    const lowerName = trophyName.toLowerCase();
    
    if (commonTrophies.some(t => lowerName.includes(t))) return 'Common';
    if (uncommonTrophies.some(t => lowerName.includes(t))) return 'Uncommon';
    if (rareTrophies.some(t => lowerName.includes(t))) return 'Rare';
    if (veryRareTrophies.some(t => lowerName.includes(t))) return 'Very Rare';
    
    // Default to Rare for unknown trophies
    return 'Rare';
  };
  
  // Get color classes based on rarity
  const getRarityClasses = (rarity: string) => {
    switch (rarity) {
      case 'Common':
        return {
          bg: 'from-gray-50 to-gray-100',
          text: 'text-gray-600',
          badge: 'bg-gray-100 text-gray-700'
        };
      case 'Uncommon':
        return {
          bg: 'from-blue-50 to-blue-100',
          text: 'text-blue-600',
          badge: 'bg-blue-100 text-blue-700'
        };
      case 'Rare':
        return {
          bg: 'from-purple-50 to-purple-100',
          text: 'text-purple-600',
          badge: 'bg-purple-100 text-purple-700'
        };
      case 'Very Rare':
        return {
          bg: 'from-amber-50 to-amber-100',
          text: 'text-amber-600',
          badge: 'bg-amber-100 text-amber-700'
        };
      default:
        return {
          bg: 'from-gray-50 to-gray-100',
          text: 'text-gray-600',
          badge: 'bg-gray-100 text-gray-700'
        };
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">Trophy Case</h2>
        <p className="text-xs text-gray-500">
          {trophies.length > 0 
            ? `${username}'s collection of ${trophies.length} Reddit achievements` 
            : `${username}'s Reddit achievements`
          }
        </p>
      </div>
      
      <div className="p-6">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm mb-4">
            <div className="flex items-center">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 text-red-500 mr-3">
                ⚠️
              </div>
              <div>{error}</div>
            </div>
          </div>
        )}
        
        {trophies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {trophies.map((trophy, index) => {
              const rarity = getTrophyRarity(trophy.data.name);
              const rarityClasses = getRarityClasses(rarity);
              
              return (
                <div 
                  key={`${trophy.data.name}-${index}`} 
                  className={`flex flex-col items-center bg-gradient-to-b ${rarityClasses.bg} p-4 rounded-lg text-center hover:shadow-md transition-shadow group cursor-pointer`}
                  onClick={() => setSelectedTrophy(trophy.data)}
                >
                  <div className="relative h-16 w-16 mb-3">
                    {trophy.data.icon_70 ? (
                      <Image 
                        src={decodeHtmlEntities(trophy.data.icon_70)}
                        alt={trophy.data.name}
                        width={70}
                        height={70}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-amber-200 rounded-full text-amber-800 text-xl font-bold">
                        🏆
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-medium text-gray-800 text-sm mb-1">
                    {trophy.data.name}
                  </h3>
                  
                  <div className={`text-xs ${rarityClasses.text} font-medium px-2 py-0.5 ${rarityClasses.badge} rounded-full mb-1`}>
                    {rarity}
                  </div>
                  
                  {trophy.data.description && (
                    <p className="text-xs text-gray-500 mt-1">
                      {trophy.data.description}
                    </p>
                  )}
                  
                  {trophy.data.granted_at && (
                    <p className="text-xs text-gray-400 mt-2">
                      {formatDate(trophy.data.granted_at)}
                    </p>
                  )}
                </div>
              );
            })}
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
              Keep participating in Reddit to earn achievements!
            </p>
          </div>
        )}
        
        {/* Trophy detail modal */}
        {selectedTrophy && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-800">{selectedTrophy.name}</h3>
                <button 
                  onClick={() => setSelectedTrophy(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="flex flex-col items-center mb-6">
                <div className="h-24 w-24 mb-4">
                  {selectedTrophy.icon_70 ? (
                    <Image 
                      src={decodeHtmlEntities(selectedTrophy.icon_70)}
                      alt={selectedTrophy.name}
                      width={70}
                      height={70}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-amber-200 rounded-full text-amber-800 text-3xl font-bold">
                      🏆
                    </div>
                  )}
                </div>
                
                <div className={`text-sm ${getRarityClasses(getTrophyRarity(selectedTrophy.name)).badge} px-3 py-1 rounded-full mb-4`}>
                  {getTrophyRarity(selectedTrophy.name)}
                </div>
              </div>
              
              <div className="space-y-4">
                {selectedTrophy.description && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Description</h4>
                    <p className="text-gray-600 text-sm">{selectedTrophy.description}</p>
                  </div>
                )}
                
                {selectedTrophy.detailed_description && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Detailed Information</h4>
                    <p className="text-gray-600 text-sm">{selectedTrophy.detailed_description}</p>
                  </div>
                )}
                
                {selectedTrophy.granted_at && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Awarded On</h4>
                    <p className="text-gray-600 text-sm">{formatDate(selectedTrophy.granted_at)}</p>
                  </div>
                )}
                
                {selectedTrophy.url && (
                  <div className="pt-4">
                    <a 
                      href={selectedTrophy.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      View on Reddit
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}