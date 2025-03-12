// app/api/reddit/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  
  console.log("User profile request for username:", username);
  
  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }
  
  try {
    // Fetch user's basic info with User-Agent header
    console.log("Fetching Reddit data for:", username);
    
    try {
      const userResponse = await fetch(`https://www.reddit.com/user/${username}/about.json`, {
        headers: {
          'User-Agent': 'web:reddit-dashboard:v1.0 (by /u/your-username)'
        }
      });
      
      if (!userResponse.ok) {
        const status = userResponse.status;
        console.error(`Reddit API error (${status})`);
        return NextResponse.json({ error: `Reddit API error: ${status}` }, { status });
      }
      
      const userData = await userResponse.json();
      
      // Fetch user's trophies
      const trophyResponse = await fetch(`https://www.reddit.com/user/${username}/trophies.json`, {
        headers: {
          'User-Agent': 'web:reddit-dashboard:v1.0 (by /u/your-username)'
        }
      });
      
      let trophyData;
      if (trophyResponse.ok) {
        trophyData = await trophyResponse.json();
      } else {
        console.warn("Failed to fetch trophies:", trophyResponse.status);
        trophyData = { data: { trophies: [] } };
      }
      
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
      
      return NextResponse.json(profileData);
    } catch (fetchError: unknown) {
      const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
      console.error("Error during API fetch:", errorMessage);
      return NextResponse.json({ error: `Fetch error: ${errorMessage}` }, { status: 500 });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error fetching profile:', errorMessage);
    return NextResponse.json({ error: 'Failed to fetch profile data: ' + errorMessage }, { status: 500 });
  }
}