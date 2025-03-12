// lib/jwt.ts
import * as jwt from 'jsonwebtoken';

// Use a safer typing approach
const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-change-this';
console.log("JWT_SECRET available:", !!JWT_SECRET, "Length:", JWT_SECRET?.length || 0);

export interface SharePayload {
  userId: string;
  username?: string; // Optional - may be excluded if anonymized
  created: number; // timestamp
  isAnonymous: boolean;
}

export function createShareToken(
  userId: string, 
  username: string | undefined, 
  isAnonymous: boolean = false,
  expiresIn: string = '7d'
): string {
  const payload: SharePayload = { 
    userId,
    created: Date.now(),
    isAnonymous
  };
  
  // Always include username in the token if it exists
  // This allows us to fetch the correct user data while still respecting privacy
  if (username) {
    payload.username = username;
  }
  
  // Fix the type error by explicitly typing JWT_SECRET and options
  return jwt.sign(
    payload, 
    JWT_SECRET, 
    { expiresIn } as jwt.SignOptions
  );
}

// lib/jwt.ts
export function verifyShareToken(token: string): SharePayload | null {
  try {
    // Add environment check
    if (process.env.NODE_ENV === 'production') {
      console.log('Verifying in production with secret length:', JWT_SECRET?.length || 0);
    }
    
    return jwt.verify(token, JWT_SECRET) as SharePayload;
  } catch (error) {
    console.error('Invalid share token:', error, 
      process.env.NODE_ENV === 'production' ? 'In production' : 'In development');
    return null;
  }
}