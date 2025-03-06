// File: app/api/reddit/trophies/route.ts
// API route that fetches user's Reddit trophies

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

    // Fetch the user's trophies
    console.log(`Fetching trophies for user: ${username}`);
    const trophiesResponse = await fetch(`https://oauth.reddit.com/api/v1/user/${username}/trophies`, {
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
    
    return NextResponse.json({ 
      trophies: trophiesData.data?.trophies || []
    });
    
  } catch (error) {
    console.error('Error in Reddit trophies API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trophies', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}