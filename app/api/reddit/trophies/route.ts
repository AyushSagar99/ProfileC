// File: app/api/reddit/trophies/route.ts
// Updated to use the /api/v1/me/trophies endpoint directly

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

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

    // Use the /api/v1/me/trophies endpoint to get the user's trophies directly
    console.log("Fetching user trophies with /api/v1/me/trophies endpoint");
    const trophiesResponse = await fetch('https://oauth.reddit.com/api/v1/me/trophies', {
      headers: {
        'Authorization': `Bearer ${token.accessToken}`,
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
    console.log("Successfully fetched user trophies");
    
    // Add static descriptions for common trophies
    if (trophiesData.data?.trophies) {
      const trophyDescriptions: { [key: string]: string } = {
        'verified email': 'User has a verified email address associated with their Reddit account',
        'one-year club': 'User has been a registered member of Reddit for 1 year',
        'two-year club': 'User has been a registered member of Reddit for 2 years',
        'three-year club': 'User has been a registered member of Reddit for 3 years',
        'four-year club': 'User has been a registered member of Reddit for 4 years',
        'five-year club': 'User has been a registered member of Reddit for 5 years',
        'six-year club': 'User has been a registered member of Reddit for 6 years',
        'seven-year club': 'User has been a registered member of Reddit for 7 years',
        'eight-year club': 'User has been a registered member of Reddit for 8 years',
        'nine-year club': 'User has been a registered member of Reddit for 9 years',
        'ten-year club': 'User has been a registered member of Reddit for 10 years',
        'eleven-year club': 'User has been a registered member of Reddit for 11 years',
        'twelve-year club': 'User has been a registered member of Reddit for 12 years',
        'gilding i': 'User has given gold to others on 1 or more occasions',
        'gilding ii': 'User has given gold to others on 3 or more occasions',
        'gilding iii': 'User has given gold to others on 10 or more occasions',
        'gilding iv': 'User has given gold to others on 20 or more occasions',
        'gilding v': 'User has given gold to others on 50 or more occasions',
        'gilding vi': 'User has given gold to others on 100 or more occasions',
        'gilding vii': 'User has given gold to others on 250 or more occasions',
        'gilding viii': 'User has given gold to others on 500 or more occasions',
        'gilding ix': 'User has given gold to others on 1000 or more occasions',
        'reddit gold': 'User has Reddit Premium membership',
        'reddit platinum': 'User has been awarded Reddit Platinum',
        'moderator': 'User is a moderator of one or more subreddits',
        'beta team': 'User participated in Reddit beta testing'
      };
      
      trophiesData.data.trophies.forEach((trophy: { data: { name?: string; detailed_description?: string } }) => {
        const trophyName = trophy.data?.name?.toLowerCase();
        if (trophyName && trophyDescriptions[trophyName]) {
          trophy.data.detailed_description = trophyDescriptions[trophyName];
        }
      });
    }
    
    // Get the user data too
    const userResponse = await fetch('https://oauth.reddit.com/api/v1/me', {
      headers: {
        'Authorization': `Bearer ${token.accessToken}`,
        'User-Agent': 'web:RedditProfileApp:v1.0.0'
      }
    });
    
    let username = "user";
    if (userResponse.ok) {
      const userData = await userResponse.json();
      username = userData.name || "user";
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