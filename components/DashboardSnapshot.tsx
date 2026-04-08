"use client";

import { CalendarDays, Crown, Shield, Sparkles, Users } from "lucide-react";
import { cn } from "@/lib/utils";

type DashboardSnapshotProps = {
  linkKarma: number;
  commentKarma: number;
  subscribedCount: number;
  trophyCount: number;
  moderatedCount: number;
  accountCreatedUtc: number;
  className?: string;
};

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toLocaleString();
}

function accountAgeLabel(createdUtc: number): string {
  const created = new Date(createdUtc * 1000);
  const now = new Date();
  const days = Math.floor((now.getTime() - created.getTime()) / (86400 * 1000));
  if (days >= 365) {
    const y = Math.floor(days / 365);
    return `${y} yr${y === 1 ? "" : "s"} on Reddit`;
  }
  if (days >= 30) {
    const m = Math.floor(days / 30);
    return `${m} mo${m === 1 ? "" : "s"} on Reddit`;
  }
  return `${Math.max(1, days)} day${days === 1 ? "" : "s"} on Reddit`;
}

export default function DashboardSnapshot({
  linkKarma,
  commentKarma,
  subscribedCount,
  trophyCount,
  moderatedCount,
  accountCreatedUtc,
  className,
}: DashboardSnapshotProps) {
  const total = Math.max(1, linkKarma + commentKarma);
  const postShare = Math.round((linkKarma / total) * 100);
  const commentShare = 100 - postShare;

  const tiles = [
    {
      label: "Subscriptions",
      value: formatCompact(subscribedCount),
      sub: "communities",
      icon: Users,
      tone: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-950/40",
    },
    {
      label: "Trophies",
      value: String(trophyCount),
      sub: "earned",
      icon: Sparkles,
      tone: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/40",
    },
    {
      label: "Moderating",
      value: String(moderatedCount),
      sub: moderatedCount === 1 ? "subreddit" : "subreddits",
      icon: Shield,
      tone: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
    },
    {
      label: "Total karma",
      value: formatCompact(linkKarma + commentKarma),
      sub: accountAgeLabel(accountCreatedUtc),
      icon: Crown,
      tone: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-950/40",
    },
  ];

  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 p-5 shadow-sm",
        className
      )}
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Dashboard snapshot
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            At-a-glance stats from your connected Reddit account
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <CalendarDays className="h-3.5 w-3.5" aria-hidden />
          Joined {new Date(accountCreatedUtc * 1000).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
        </div>
      </div>

      <div className="mb-5">
        <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-gray-600 dark:text-gray-300">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-blue-500" aria-hidden />
            Post karma {postShare}%
          </span>
          <span className="flex items-center gap-1">
            Comment karma {commentShare}%
            <span className="inline-block h-2 w-2 rounded-full bg-purple-500" aria-hidden />
          </span>
        </div>
        <div className="flex h-2.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-900">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-400 transition-all"
            style={{ width: `${postShare}%` }}
          />
          <div
            className="bg-gradient-to-r from-purple-500 to-fuchsia-500 transition-all"
            style={{ width: `${commentShare}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{formatCompact(linkKarma)} post</span>
          <span>{formatCompact(commentKarma)} comment</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map(({ label, value, sub, icon: Icon, tone, bg }) => (
          <div
            key={label}
            className={cn(
              "rounded-lg border border-gray-100 dark:border-gray-700/80 p-3.5",
              bg
            )}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                {label}
              </span>
              <Icon className={cn("h-4 w-4 shrink-0 opacity-90", tone)} aria-hidden />
            </div>
            <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
              {value}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
