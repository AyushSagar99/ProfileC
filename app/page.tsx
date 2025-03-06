// File: app/page.tsx
'use client';

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BorderBeam } from "@/components/magicui/border-beam";
import { Meteors } from "@/components/magicui/meteors";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Redirect to profile if already logged in
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/profile");
    }
  }, [status, router]);

  const handleRedditLogin = () => {
    signIn("reddit", { callbackUrl: "/profile" });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white">
      {status === "loading" ? (
        <div className="py-4 flex items-center">
          <div className="h-8 w-8 rounded-full border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent animate-spin mr-3"></div>
          <span>Loading...</span>
        </div>
      ) : !session ? (
        <div className="relative flex h-screen w-screen  flex-col items-center justify-center">
          {/* Position the meteors with absolute positioning */}
          <div className="absolute inset-0 w-full h-full">
            <Meteors number={30} />
          </div>
          
          {/* Position the card with z-index to appear above meteors */}
          <Card className="relative z-10 w-[350px] bg-gray-900/70 backdrop-blur-sm border-gray-700 text-white">
            <CardHeader>
              <CardTitle className="text-white">Login with Reddit</CardTitle>
              <CardDescription className="text-gray-300">
                Connect with your Reddit account to continue.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="w-16 h-16 mb-4">
                <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <circle fill="#FF4500" cx="10" cy="10" r="10"></circle>
                  <path fill="#FFF" d="M16.67,10A1.46,1.46,0,0,0,14.2,9a7.12,7.12,0,0,0-3.85-1.23L11,4.65,13.14,5.1a1,1,0,1,0,.13-0.61L10.82,4a0.31,0.31,0,0,0-.37.24L9.71,7.71a7.14,7.14,0,0,0-3.9,1.23A1.46,1.46,0,1,0,4.2,11.33a2.87,2.87,0,0,0,0,.44c0,2.24,2.61,4.06,5.83,4.06s5.83-1.82,5.83-4.06a2.87,2.87,0,0,0,0-.44A1.46,1.46,0,0,0,16.67,10Z"></path>
                </svg>
              </div>
              <p className="text-center text-sm text-gray-300 mb-4">
                No registration needed. One click to connect and you&apos;re ready to go.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button
                onClick={handleRedditLogin}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                Login with Reddit
              </Button>
            </CardFooter>
            <BorderBeam duration={8} size={100} className="opacity-60" />
          </Card>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent animate-spin mb-4"></div>
          <p>Redirecting to your profile...</p>
        </div>
      )}
    </div>
  );
}