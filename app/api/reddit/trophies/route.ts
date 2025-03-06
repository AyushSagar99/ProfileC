// File: app/api/reddit/trophies/route.ts
// Enhanced API route that fetches user's Reddit trophies with proper TypeScript types

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define the interface for trophy details
interface TrophyDescriptions {
  [key: string]: string;
}

export async function GET(req: NextRequest) {
  try {
    console.log("Reddit trophies API route called");
    
    // Get the session token from the request
    const token = await getToken({ 
      req,
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token || !token.accessToken) {
      console.log("Authentication required - no valid token or access token");
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // First, get the user's Reddit username
    const userResponse = await fetch('https://oauth.reddit.com/api/v1/me', {
      headers: {
        'Authorization': `Bearer ${token.accessToken}`,
        'User-Agent': 'web:RedditProfileApp:v1.0.0'
      }
    });

    if (!userResponse.ok) {
      console.error("Failed to fetch user info:", userResponse.status);
      return NextResponse.json(
        { error: 'Failed to fetch user info' },
        { status: userResponse.status }
      );
    }

    const userData = await userResponse.json();
    const username = userData.name;
    
    if (!username) {
      return NextResponse.json(
        { error: 'Could not determine username' },
        { status: 500 }
      );
    }

    // Use the public API endpoint (doesn't require special scopes)
    console.log(`Fetching trophies for user: ${username} using public API`);
    const trophiesResponse = await fetch(`https://www.reddit.com/user/${username}/trophies.json`, {
      headers: {
        'User-Agent': 'web:RedditProfileApp:v1.0.0'
      }
    });

    if (!trophiesResponse.ok) {
      console.error("Failed to fetch trophies:", trophiesResponse.status);
      return NextResponse.json(
        { error: 'Failed to fetch trophies', status: trophiesResponse.status },
        { status: trophiesResponse.status }
      );
    }

    const trophiesData = await trophiesResponse.json();
    console.log("Successfully fetched user trophies from public API");
    
    // Also fetch additional trophy information from the Reddit about page
    // This provides details about trophy types, even ones the user doesn't have
    try {
      const trophyTypesResponse = await fetch('https://www.reddit.com/wiki/trophies.json', {
        headers: {
          'User-Agent': 'web:RedditProfileApp:v1.0.0'
        }
      });
      
      if (trophyTypesResponse.ok) {
        const trophyTypesData = await trophyTypesResponse.json();
        
        // Extract trophy descriptions from wiki content if available
        let trophyDetails: TrophyDescriptions = {};
        if (trophyTypesData.data?.content_md) {
          const wikiContent = trophyTypesData.data.content_md;
          
          // Parse the wiki content to find trophy descriptions
          // Note: This is a simplified parsing logic
          const trophyRegex = /\*\*([^*]+)\*\*\s*-\s*([^\n]+)/g;
          let match;
          
          while ((match = trophyRegex.exec(wikiContent)) !== null) {
            const trophyName = match[1].trim();
            const trophyDescription = match[2].trim();
            trophyDetails[trophyName.toLowerCase()] = trophyDescription;
          }
        }
        
        // Add detailed descriptions to the trophies when available
        if (trophiesData.data?.trophies && Object.keys(trophyDetails).length > 0) {
          trophiesData.data.trophies.forEach((trophy: any) => {
            const trophyName = trophy.data?.name?.toLowerCase();
            if (trophyName && trophyDetails[trophyName]) {
              trophy.data.detailed_description = trophyDetails[trophyName];
            }
          });
        }
      }
    } catch (wikiError) {
      console.warn("Could not fetch additional trophy details:", wikiError);
      // Continue without additional details
    }
    
    return NextResponse.json({ 
      trophies: trophiesData.data?.trophies || [],
      username: username,
      total_count: trophiesData.data?.trophies?.length || 0
    });
    
  } catch (error) {
    console.error('Error in Reddit trophies API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trophies', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}