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
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      {status === "loading" ? (
        <div className="py-4">Loading...</div>
      ) : !session ? (
        <Card className="relative w-[350px] overflow-hidden">
          <CardHeader>
            <CardTitle>Login with Reddit</CardTitle>
            <CardDescription>
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
            <p className="text-center text-sm text-gray-600 mb-4">
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
          <BorderBeam duration={8} size={100} />
        </Card>
      ) : (
        <p>Redirecting to your profile...</p>
      )}
    </div>
  );
}