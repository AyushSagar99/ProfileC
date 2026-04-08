// File: app/page.tsx
"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Activity, Share2, Sparkles, TrendingUp, Users } from "lucide-react";
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
import { ModeToggle } from "@/components/toggle-theme";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Activity,
    title: "Karma & activity",
    description: "See your profile stats in a clean dashboard built for scanning.",
  },
  {
    icon: TrendingUp,
    title: "Trending communities",
    description: "Discover popular subreddits tailored around what you already follow.",
  },
  {
    icon: Share2,
    title: "Shareable profile",
    description: "Generate links so friends can view a curated snapshot of your Reddit presence.",
  },
] as const;

function RedditMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <circle fill="#FF4500" cx="10" cy="10" r="10" />
      <path
        fill="#FFF"
        d="M16.67,10A1.46,1.46,0,0,0,14.2,9a7.12,7.12,0,0,0-3.85-1.23L11,4.65,13.14,5.1a1,1,0,1,0,.13-0.61L10.82,4a0.31,0.31,0,0,0-.37.24L9.71,7.71a7.14,7.14,0,0,0-3.9,1.23A1.46,1.46,0,1,0,4.2,11.33a2.87,2.87,0,0,0,0,.44c0,2.24,2.61,4.06,5.83,4.06s5.83-1.82,5.83-4.06a2.87,2.87,0,0,0,0-.44A1.46,1.46,0,0,0,16.67,10Z"
      />
    </svg>
  );
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/profile");
    }
  }, [status, router]);

  const handleRedditLogin = () => {
    signIn("reddit", { callbackUrl: "/profile" });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-zinc-950 to-black text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.25),transparent)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_100%_100%,rgba(249,115,22,0.08),transparent)]" />

      <div className="absolute inset-0">
        <Meteors number={36} />
      </div>

      <header className="relative z-20 flex items-center justify-between border-b border-white/10 bg-black/20 px-4 py-4 backdrop-blur-md sm:px-8">
        <div className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/15 ring-1 ring-orange-500/30">
            <Sparkles className="h-4 w-4 text-orange-400" aria-hidden />
          </span>
          <span className="text-lg">RedditVerse</span>
        </div>
        <div
          className="[&_button]:border-white/20 [&_button]:bg-white/5 [&_button]:text-white [&_button]:hover:bg-white/10"
        >
          <ModeToggle />
        </div>
      </header>

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-73px)] max-w-6xl flex-col justify-center gap-12 px-4 py-12 sm:px-8 lg:flex-row lg:items-center lg:gap-16 lg:py-16">
        {status === "loading" ? (
          <div className="flex w-full flex-col items-center justify-center gap-4 py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
            <p className="text-sm text-zinc-400">Checking your session…</p>
          </div>
        ) : !session ? (
          <>
            <section className="flex flex-1 flex-col gap-8 lg:max-w-xl">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300 backdrop-blur-sm">
                <Users className="h-3.5 w-3.5 text-orange-400" aria-hidden />
                OAuth via Reddit — no extra account
              </div>

              <div className="space-y-4">
                <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-[2.75rem] lg:leading-[1.1]">
                  Your Reddit life,{" "}
                  <span className="bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">
                    in one calm dashboard
                  </span>
                </h1>
                <p className="max-w-lg text-pretty text-lg leading-relaxed text-zinc-400">
                  Track karma, browse communities, and surface trending subreddits in a focused
                  layout—without the endless scroll of the main feed.
                </p>
              </div>

              <ul className="grid gap-4 sm:grid-cols-1">
                {features.map(({ icon: Icon, title, description }) => (
                  <li
                    key={title}
                    className="flex gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm transition-colors hover:bg-white/[0.07]"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-orange-500/15 ring-1 ring-orange-500/25">
                      <Icon className="h-5 w-5 text-orange-400" aria-hidden />
                    </span>
                    <div>
                      <p className="font-medium text-zinc-100">{title}</p>
                      <p className="mt-0.5 text-sm leading-snug text-zinc-500">{description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="flex w-full shrink-0 justify-center lg:w-auto lg:justify-end">
              <Card className="relative w-full max-w-md overflow-hidden border-white/15 bg-zinc-900/75 text-white shadow-2xl shadow-black/40 backdrop-blur-md">
                <CardHeader className="space-y-3 pb-2 text-center sm:text-left">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/15 ring-1 ring-orange-500/30 sm:mx-0">
                    <RedditMark className="h-10 w-10" />
                  </div>
                  <CardTitle className="text-2xl">Sign in with Reddit</CardTitle>
                  <CardDescription className="text-base text-zinc-400">
                    We only use OAuth to read what you allow—then you get trophies, subs, and
                    trending picks in one place.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 pb-2">
                  <ul className="space-y-2 text-sm text-zinc-500">
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                      One click to connect; no separate RedditVerse password.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                      Revoke access anytime from your Reddit app settings.
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 pt-2">
                  <Button
                    type="button"
                    onClick={handleRedditLogin}
                    className="h-11 w-full bg-orange-500 text-base font-semibold text-white hover:bg-orange-600"
                  >
                    <RedditMark className="h-5 w-5" />
                    Continue with Reddit
                  </Button>
                  <p className="text-center text-xs text-zinc-500">
                    By continuing, you agree to Reddit&apos;s terms for connected apps.
                  </p>
                </CardFooter>
                <BorderBeam duration={8} size={100} className="opacity-50" />
              </Card>
            </section>
          </>
        ) : (
          <div className="flex w-full flex-col items-center justify-center gap-4 py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
            <p className="text-zinc-400">Redirecting to your profile…</p>
          </div>
        )}
      </main>

      <footer className="relative z-10 border-t border-white/10 bg-black/20 px-4 py-6 text-center text-xs text-zinc-500 backdrop-blur-sm sm:px-8">
        <p>
          RedditVerse is an independent project and is not affiliated with or endorsed by Reddit
          Inc.
        </p>
      </footer>
    </div>
  );
}
