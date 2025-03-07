// File: app/api/reddit/trending/route.ts
// Simplified API route that fetches trending subreddits with fallback mechanisms

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

interface RedditSubredditData {
  display_name: string;
  subscribers?: number;
  icon_img?: string;
  community_icon?: string;
  public_description?: string;
  url?: string;
  created_utc?: number;
  growth_percentage?: number;
  trending_rank?: number;
  recommended_because?: string;
}

export async function GET(req: NextRequest) {
  try {
    console.log("Reddit trending subreddits API route called");
    
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

    // Fetch popular subreddits directly - this endpoint generally has fewer permission issues
    console.log("Fetching popular subreddits");
    const popularResponse = await fetch('https://oauth.reddit.com/subreddits/popular?limit=30', {
      headers: {
        'Authorization': `Bearer ${token.accessToken}`,
        'User-Agent': 'web:RedditProfileApp:v1.0.0'
      },
    });

    if (!popularResponse.ok) {
      console.error("Failed to fetch popular subreddits:", popularResponse.status);
      // If we can't even get popular subreddits, return the error
      return NextResponse.json(
        { error: 'Could not access Reddit API' },
        { status: popularResponse.status }
      );
    }

    const popularData = await popularResponse.json();
    
    // Now fetch the user's subscribed subreddits to avoid recommending those
    console.log("Fetching subscribed subreddits");
    const subscribedResponse = await fetch('https://oauth.reddit.com/subreddits/mine/subscriber?limit=50', {
      headers: {
        'Authorization': `Bearer ${token.accessToken}`,
        'User-Agent': 'web:RedditProfileApp:v1.0.0'
      },
    });

    // Extract the names of subscribed subreddits (if available)
    const subscribedNames = new Set<string>();
    
    
    if (subscribedResponse.ok) {
      const subscribedData = await subscribedResponse.json();
      if (subscribedData.data && subscribedData.data.children) {
        subscribedData.data.children.forEach((item: { data: RedditSubredditData }) => {


          if (item.data && item.data.display_name) {
            subscribedNames.add(item.data.display_name.toLowerCase());
          }
        });
      }
    } else {
      console.warn("Could not fetch subscribed subreddits, proceeding without filtering");
    }

    // Filter and process data for trending subreddits
    const trendingSubreddits: RedditSubredditData[] = [];
    const recommendedSubreddits: RedditSubredditData[] = [];
    
    if (popularData.data && popularData.data.children) {
      // First pass to get trending subreddits (not subscribed to)
      for (const item of popularData.data.children) {
        if (item.data && item.data.display_name && 
            !subscribedNames.has(item.data.display_name.toLowerCase())) {
          
          // Add growth metrics (simulated for demonstration)
          item.data.growth_percentage = Math.floor(Math.random() * 30) + 5; // 5-35%
          item.data.trending_rank = trendingSubreddits.length + 1;
          
          trendingSubreddits.push(item.data);
          
          // Limit to 10 trending subreddits
          if (trendingSubreddits.length >= 10) break;
        }
      }
      
      // Second pass for recommended (different from trending)
      for (const item of popularData.data.children) {
        if (item.data && item.data.display_name && 
            !subscribedNames.has(item.data.display_name.toLowerCase()) &&
            !trendingSubreddits.some(sub => sub.display_name === item.data.display_name)) {
          
          // Add recommendation reason (simplified approach)
          const categories = [
            "Based on popular interests",
            "Growing community",
            "Active discussions",
            "Popular in your region",
            "Related to your interests"
          ];
          
          item.data.recommended_because = categories[Math.floor(Math.random() * categories.length)];
          recommendedSubreddits.push(item.data);
          
          // Limit to 5 recommendations
          if (recommendedSubreddits.length >= 5) break;
        }
      }
    }

    // Return both trending and recommended subreddits
    return NextResponse.json({
      trending: trendingSubreddits,
      recommended: recommendedSubreddits
    });
    
  } catch (error) {
    console.error('Error in Reddit trending subreddits API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending subreddits', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}