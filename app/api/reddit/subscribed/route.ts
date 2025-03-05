// File: app/api/reddit/subscribed/route.ts
// This is an alternative API route that fetches subscribed subreddits instead of history,
// which might have fewer permission issues

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(req: NextRequest) {
  try {
    console.log("Reddit subscribed API route called");
    
    // Get the session token from the request
    const token = await getToken({ 
      req,
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    console.log("Token retrieved:", token ? "Yes (with access token: " + (token.accessToken ? "Yes" : "No") + ")" : "No");
    
    if (!token || !token.accessToken) {
      console.log("Authentication required - no valid token or access token");
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Forward the request to Reddit's API for subscribed subreddits
    console.log("Fetching subscribed subreddits from Reddit API");
    const response = await fetch('https://oauth.reddit.com/subreddits/mine/subscriber?limit=25', {
      headers: {
        'Authorization': `Bearer ${token.accessToken}`,
        'User-Agent': 'web:RedditProfileApp:v1.0.0'
      },
    });

    console.log("Reddit API response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Reddit API error:", response.status, errorText);
      return NextResponse.json(
        { error: `Reddit API error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Successfully received subscribed subreddits data");
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error in Reddit subscribed API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscribed subreddits', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}