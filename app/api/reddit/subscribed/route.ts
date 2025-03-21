// File: app/api/reddit/subscribed/route.ts
// Enhanced version that adds simulated visit counts to subscribed subreddits

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
    
    // Enhanced: Add simulated visit counts for each subreddit
    if (data.data && data.data.children) {
      data.data.children.forEach((item: { data: { visit_count: number; }; }) => {
        if (item.data) {
          // Generate random visit count between 5 and 30 for demonstration
          item.data.visit_count = Math.floor(Math.random() * 26) + 5;
        }
      });
      
      // Sort by the simulated visit count (highest first)
      data.data.children.sort((a: { data: { visit_count: number; }; }, b: { data: { visit_count: number; }; }) => 
        b.data.visit_count - a.data.visit_count
      );
    }
    
    console.log("Successfully received and enhanced subscribed subreddits data");
    
    return NextResponse.json({
      data: data.data,
      source: 'simulated'
    });
    
  } catch (error) {
    console.error('Error in Reddit subscribed API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscribed subreddits', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}