// app/api/reddit/verify-token/route.ts
import { NextResponse } from 'next/server';
import { verifyShareToken } from '@/lib/jwt';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  console.log("Verify token request received, token:", token ? `${token.substring(0, 10)}...` : 'null');
  
  
  if (!token) {
    return NextResponse.json({ isValid: false, error: 'No token provided' }, { status: 400 });
  }
  
  try {
    const tokenData = verifyShareToken(token);
    
    if (!tokenData) {
      return NextResponse.json({ isValid: false, error: 'Invalid token' }, { status: 401 });
    }
    
    // For debugging, log the token data
    console.log('Token data:', tokenData);
    
    return NextResponse.json({ 
      isValid: true,
      tokenData
    });
  } catch (error) {
    console.error('Error verifying token:', error, error);
    return NextResponse.json({ isValid: false, error: 'Token verification failed' }, { status: 500 });
  }
}