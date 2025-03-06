// File: app/api/reddit/visited/route.ts
// Simplified API route that directly uses subscribed subreddits with simulated visit counts

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(req: NextRequest) {
  try {
    console.log("Simplified Reddit subreddits API route called");
    
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

    // Directly use subscribed subreddits as our data source
    console.log("Fetching subscribed subreddits");
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

    // Process the data
    const data = await response.json();
    
    if (!data.data || !data.data.children) {
      return NextResponse.json(
        { error: 'Invalid Reddit API response format' },
        { status: 500 }
      );
    }
    
    // Add simulated visit counts to the subreddits
    data.data.children.forEach((item: any) => {
      if (item.data) {
        // Generate random visit count between 5 and 30 for demonstration
        item.data.visit_count = Math.floor(Math.random() * 26) + 5;
      }
    });
    
    // Sort by the simulated visit count
    data.data.children.sort((a: any, b: any) => 
      b.data.visit_count - a.data.visit_count
    );
    
    console.log(`Successfully processed ${data.data.children.length} subreddits with simulated visit counts`);
    
    return NextResponse.json({
      data: data.data,
      source: 'simulated'
    });
    
  } catch (error) {
    console.error('Error in simplified Reddit API route:', error);
    return NextResponse.json(
      { error: 'Failed to process subreddits', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}