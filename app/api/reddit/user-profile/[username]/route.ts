// app/api/reddit/user-profile/[username]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest
) {
  // Extract username from the URL
  const username = request.nextUrl.pathname.split('/').pop();
  
  if (!username) {
    return NextResponse.json({ error: 'Invalid username' }, { status: 400 });
  }
  
  try {
    // Fetch user's basic info with User-Agent header
    const userResponse = await fetch(`https://www.reddit.com/user/${username}/about.json`, {
      headers: {
        'User-Agent': 'web:reddit-dashboard:v1.0 (by /u/your-username)'
      }
    });
    
    if (!userResponse.ok) {
      const status = userResponse.status;
      if (status === 404) {
        return NextResponse.json({ error: 'Reddit user not found' }, { status: 404 });
      } else if (status === 429) {
        return NextResponse.json({ error: 'Rate limit exceeded, please try again later' }, { status: 429 });
      }
      throw new Error(`Failed to fetch user data: ${status}`);
    }
    
    const userData = await userResponse.json();
    
    // Fetch user's trophies with User-Agent header
    const trophyResponse = await fetch(`https://www.reddit.com/user/${username}/trophies.json`, {
      headers: {
        'User-Agent': 'web:reddit-dashboard:v1.0 (by /u/your-username)'
      }
    });
    
    if (!trophyResponse.ok) {
      console.warn(`Failed to fetch trophies: ${trophyResponse.status}`);
    }
    
    const trophyData = await trophyResponse.json();
    
    // Calculate account age
    const createdDate = new Date(userData.data.created_utc * 1000);
    const now = new Date();
    const diffYears = now.getFullYear() - createdDate.getFullYear();
    const diffMonths = now.getMonth() - createdDate.getMonth();
    let accountAge = '';
    
    if (diffYears > 0) {
      accountAge = `${diffYears} year${diffYears !== 1 ? 's' : ''}`;
      if (diffMonths > 0) {
        accountAge += `, ${diffMonths} month${diffMonths !== 1 ? 's' : ''}`;
      }
    } else if (diffMonths > 0) {
      accountAge = `${diffMonths} month${diffMonths !== 1 ? 's' : ''}`;
    } else {
      const diffDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      accountAge = `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    }
    
    // Format the profile data
    const profileData = {
      username: userData.data.name,
      avatarUrl: userData.data.icon_img?.split('?')[0] || '', // Remove query params
      karma: {
        post: userData.data.link_karma || 0,
        comment: userData.data.comment_karma || 0,
        total: userData.data.total_karma || (userData.data.link_karma + userData.data.comment_karma),
      },
      accountAge,
      trophies: trophyData.data?.trophies?.map((trophy: { data: { name: string } }) => trophy.data.name) || [],
    };
    
    // Add some cache control headers to prevent frequent refetching
    return NextResponse.json(profileData, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile data' }, { status: 500 });
  }
}