// app/api/reddit/create-share/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { createShareToken } from '@/lib/jwt';
import { nanoid } from 'nanoid';

export async function POST(request: Request) {
  try {
    // In App Router, getServerSession() will automatically use your configured auth
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { 
      expiryOption = '7days', 
      isAnonymous = false,
      baseUrl 
    } = body;
    
    // Map expiryOption to JWT expiry value
    let expiresIn: string;
    switch(expiryOption) {
      case '24h': expiresIn = '24h'; break;
      case '7days': expiresIn = '7d'; break;
      case '30days': expiresIn = '30d'; break;
      case 'never': expiresIn = '365d'; break; // 1 year as "never"
      default: expiresIn = '7d';
    }

    // Use session data to create an identifier
    const userId = session.user.name || nanoid(10);
    
    // Use optional chaining and nullish coalescing to handle potential null values
    const username = session.user?.name ?? undefined;

    // Create share token
    const shareToken = createShareToken(
      userId,
      username,
      isAnonymous,
      expiresIn
    );

    // Determine share URL
    const origin = baseUrl || 
                   request.headers.get('origin') || 
                   process.env.NEXTAUTH_URL || 
                   'http://localhost:3000';
    const shareUrl = `${origin}/shared/${shareToken}`;

    // Return response
    return NextResponse.json({
      shareToken,
      shareUrl,
      expiresIn,
      isAnonymous
    });
    
  } catch (error) {
    console.error('Error creating share link:', error);
    return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 });
  }
}