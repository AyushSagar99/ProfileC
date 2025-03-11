// app/api/reddit/anonymous-profile/[userId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { verifyShareToken } from '@/lib/jwt';

export async function GET(
  request: NextRequest
): Promise<NextResponse> {
  const userId = request.nextUrl.pathname.split('/').pop();
  
  if (!userId) {
    return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
  }
  
  try {
    // Check for the token in the request headers
    const token = request.headers.get('x-share-token');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }
    
    // Verify the share token
    const tokenData = verifyShareToken(token);
    
    if (!tokenData || tokenData.userId !== userId) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    
    // Get the session to access the Reddit API token
    const session = await getServerSession();
    const accessToken = session?.accessToken;
    
    // For anonymous profiles, we need to get the actual username from the token
    // even though we'll keep it private in the response
    const username = tokenData.username;
    
    if (!username) {
      // If for some reason we don't have a username in the token,
      // use the current session's username if available
      if (session?.user?.name) {
        // Use the session user's data
        const userResponse = await fetch('https://oauth.reddit.com/api/v1/me', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'User-Agent': 'web:reddit-dashboard:v1.0.0',
          }
        });
        
        if (!userResponse.ok) {
          throw new Error(`Failed to fetch user data: ${userResponse.status}`);
        }
        
        const userData = await userResponse.json();
        
        // Fetch trophies
        const trophyResponse = await fetch('https://oauth.reddit.com/api/v1/me/trophies', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'User-Agent': 'web:reddit-dashboard:v1.0.0',
          }
        });
        
        const trophyData = await trophyResponse.json();
        
        // Calculate account age
        const createdDate = new Date(userData.created_utc * 1000);
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
        
        // Return anonymized profile data (real stats but no username or avatar)
        return NextResponse.json({
          karma: {
            post: userData.link_karma || 0,
            comment: userData.comment_karma || 0,
            total: userData.total_karma || (userData.link_karma + userData.comment_karma),
          },
          accountAge,
          trophies: trophyData.data?.trophies?.map((trophy: { data: { name: string } }) => trophy.data.name) || [],
        });
      } else {
        // Last resort - we don't have a username or session
        return NextResponse.json({
          error: 'Unable to fetch anonymous profile data - no username available'
        }, { status: 400 });
      }
    } else {
      // If we have a username, fetch their public data
      const userResponse = await fetch(`https://www.reddit.com/user/${username}/about.json`, {
        headers: {
          'User-Agent': 'web:reddit-dashboard:v1.0.0'
        }
      });
      
      if (!userResponse.ok) {
        throw new Error(`Failed to fetch user data: ${userResponse.status}`);
      }
      
      const userData = await userResponse.json();
      
      // Fetch trophies
      const trophyResponse = await fetch(`https://www.reddit.com/user/${username}/trophies.json`, {
        headers: {
          'User-Agent': 'web:reddit-dashboard:v1.0.0'
        }
      });
      
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
      
      // Return anonymized profile data (real stats but no username or avatar)
      return NextResponse.json({
        karma: {
          post: userData.data.link_karma || 0,
          comment: userData.data.comment_karma || 0,
          total: userData.data.total_karma || (userData.data.link_karma + userData.data.comment_karma),
        },
        accountAge,
        trophies: trophyData.data?.trophies?.map((trophy: { data: { name: string } }) => trophy.data.name) || [],
      });
    }
  } catch (error) {
    console.error('Error fetching anonymous profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile data' }, { status: 500 });
  }
}