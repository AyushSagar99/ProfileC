
import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

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
  detailed_description?: string;
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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Trophy Case</h2>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <div className="h-8 w-8 rounded-full border-4 border-t-amber-500 border-r-transparent border-b-transparent border-l-transparent animate-spin mb-3 mx-auto"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading your trophy case...</p>
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
          bg: 'bg-gray-50 dark:bg-gray-700/40',
          text: 'text-gray-600 dark:text-gray-400',
          badge: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
          border: 'border-gray-200 dark:border-gray-600'
        };
      case 'Uncommon':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          text: 'text-blue-600 dark:text-blue-400',
          badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
          border: 'border-blue-200 dark:border-blue-800/50'
        };
      case 'Rare':
        return {
          bg: 'bg-purple-50 dark:bg-purple-900/20',
          text: 'text-purple-600 dark:text-purple-400',
          badge: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
          border: 'border-purple-200 dark:border-purple-800/50'
        };
      case 'Very Rare':
        return {
          bg: 'bg-amber-50 dark:bg-amber-900/20',
          text: 'text-amber-600 dark:text-amber-400',
          badge: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
          border: 'border-amber-200 dark:border-amber-800/50'
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-700/40',
          text: 'text-gray-600 dark:text-gray-400',
          badge: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
          border: 'border-gray-200 dark:border-gray-600'
        };
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          Trophy Case
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {trophies.length > 0 
            ? `${username}'s collection of ${trophies.length} Reddit achievements` 
            : `${username}'s Reddit achievements`
          }
        </p>
      </div>
      
      <div className="p-6">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm mb-4 border border-red-100 dark:border-red-800/50">
            <div className="flex items-center">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-800/30 text-red-500 dark:text-red-400 mr-3">
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
                  className={`flex flex-col items-center ${rarityClasses.bg} p-4 rounded-lg text-center hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/10 transition-shadow group cursor-pointer border ${rarityClasses.border}`}
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
                      <div className="w-full h-full flex items-center justify-center bg-amber-200 dark:bg-amber-700 rounded-full text-amber-800 dark:text-amber-200 text-xl font-bold">
                        🏆
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-medium text-gray-800 dark:text-gray-200 text-sm mb-1">
                    {trophy.data.name}
                  </h3>
                  
                  <div className={`text-xs ${rarityClasses.text} font-medium px-2 py-0.5 ${rarityClasses.badge} rounded-full mb-1`}>
                    {rarity}
                  </div>
                  
                  {trophy.data.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {trophy.data.description}
                    </p>
                  )}
                  
                  {trophy.data.granted_at && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      {formatDate(trophy.data.granted_at)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-medium">No trophies yet</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Keep participating in Reddit to earn achievements!
            </p>
          </div>
        )}
        
        {/* Trophy detail modal */}
        {selectedTrophy && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{selectedTrophy.name}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedTrophy(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-5 w-5" />
                </Button>
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
                    <div className="w-full h-full flex items-center justify-center bg-amber-200 dark:bg-amber-700 rounded-full text-amber-800 dark:text-amber-200 text-3xl font-bold">
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
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Description</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{selectedTrophy.description}</p>
                  </div>
                )}
                
                {selectedTrophy.detailed_description && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Detailed Information</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{selectedTrophy.detailed_description}</p>
                  </div>
                )}
                
                {selectedTrophy.granted_at && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Awarded On</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{formatDate(selectedTrophy.granted_at)}</p>
                  </div>
                )}
                
                {selectedTrophy.url && (
                  <div className="pt-4">
                    <Button
                      onClick={() => window.open(selectedTrophy.url, '_blank')}
                      className="bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-600 dark:hover:bg-amber-700"
                    >
                      View on Reddit
                    </Button>
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