// File: app/profile/page.tsx
'use client';

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Redirect to home if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);
  
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }
  
  if (!session) {
    return null; // Will redirect in the useEffect
  }
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Your Reddit Profile</h1>
        
        <div className="space-y-4">
          <div>
            <p className="text-gray-600">Username:</p>
            <p className="font-medium">{session.user?.name}</p>
          </div>
          
          {session.user?.image && (
            <div className="flex justify-center my-4">
              <div className="relative h-20 w-20 rounded-full overflow-hidden">
                <Image 
                  src={session.user.image}
                  alt="Profile"
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
            </div>
          )}
          
          <div className="pt-6">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}