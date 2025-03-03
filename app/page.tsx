// File: app/page.tsx (or page.jsx if not using TypeScript)
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
            
            <p className="text-center text-sm text-gray-600 mb-4">
              No registration needed. One click to connect and you're ready to go.
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
          <BorderBeam duration={8} size={150} />
        </Card>
      ) : (
        <p>Redirecting to your profile...</p>
      )}
    </div>
  );
}