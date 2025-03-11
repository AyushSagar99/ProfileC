// lib/jwt.ts
import * as jwt from 'jsonwebtoken';

// Use a safer typing approach
const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-change-this';

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

export function verifyShareToken(token: string): SharePayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SharePayload;
  } catch (error) {
    console.error('Invalid share token:', error);
    return null;
  }
}