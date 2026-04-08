"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Loader2, MessageSquare, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export type OverviewItem =
  | {
      kind: "post";
      title: string;
      subreddit: string;
      permalink: string;
      score: number;
      createdUtc: number;
    }
  | {
      kind: "comment";
      title: string;
      linkTitle: string;
      subreddit: string;
      permalink: string;
      score: number;
      createdUtc: number;
    };

function redditHref(permalink: string): string {
  if (!permalink) return "https://www.reddit.com";
  if (permalink.startsWith("http")) return permalink;
  return `https://www.reddit.com${permalink}`;
}

function timeAgo(utc: number): string {
  const s = Math.floor(Date.now() / 1000 - utc);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(utc * 1000).toLocaleDateString();
}

export default function RecentActivityCard({ className }: { className?: string }) {
  const [items, setItems] = useState<OverviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch("/api/reddit/overview")
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
        return data;
      })
      .then((data) => {
        if (!cancelled) {
          setItems(Array.isArray(data.items) ? data.items : []);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load activity");
          setItems([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg overflow-hidden",
        className
      )}
    >
      <div className="shrink-0 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-violet-500 dark:text-violet-400" aria-hidden />
          Recent on Reddit
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Latest posts and comments from your public overview
        </p>
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-4 sm:p-6 pt-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
            <Loader2 className="h-8 w-8 animate-spin mb-2 opacity-70" />
            <span className="text-sm">Loading activity…</span>
          </div>
        ) : error ? (
          <p className="text-sm text-red-600 dark:text-red-400 py-4 text-center">{error}</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
            No recent posts or comments found.
          </p>
        ) : (
          <div
            role="region"
            aria-label="Scrollable recent activity list"
            className={cn(
              // Fixed viewport height so content overflows *inside* this box (not the page).
              // Do not use lg:max-h-none — it lets the column grow with content and kills scrolling.
              "h-[min(26rem,calc(100dvh-14rem))] min-h-[14rem] w-full shrink-0",
              // scroll = always reserve scrollbar track; stable gutter avoids layout shift
              "overflow-y-scroll overscroll-y-contain rounded-lg border border-gray-200/90 dark:border-gray-600/60 bg-gray-50/40 dark:bg-gray-900/35 py-1 pl-1 pr-0.5",
              "[scrollbar-gutter:stable]",
              "[scrollbar-width:thin]",
              "[scrollbar-color:rgb(156_163_175)_rgb(243_244_246)]",
              "dark:[scrollbar-color:rgb(107_114_128)_rgb(23_23_23)]",
              "[&::-webkit-scrollbar]:w-2.5",
              "[&::-webkit-scrollbar-track]:my-1 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-200/80 dark:[&::-webkit-scrollbar-track]:bg-gray-800",
              "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-thumb]:bg-gray-400/90 dark:[&::-webkit-scrollbar-thumb]:bg-gray-500",
              "[&::-webkit-scrollbar-thumb]:min-h-[3rem]"
            )}
          >
            <ul className="space-y-3 px-2 py-1 pb-2">
              {items.map((item, i) => (
                <li key={`${item.permalink}-${i}`}>
                  <a
                    href={redditHref(item.permalink)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex gap-3 rounded-lg border border-gray-100 dark:border-gray-700/80 bg-gray-50/80 dark:bg-gray-900/40 p-3 transition-colors hover:border-violet-300 dark:hover:border-violet-500/40 hover:bg-white dark:hover:bg-gray-800/80"
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                        item.kind === "post"
                          ? "bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
                          : "bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400"
                      )}
                    >
                      {item.kind === "post" ? (
                        <FileText className="h-5 w-5" aria-hidden />
                      ) : (
                        <MessageSquare className="h-5 w-5" aria-hidden />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-violet-600 dark:group-hover:text-violet-300">
                          {item.kind === "post" ? item.title : item.linkTitle}
                        </p>
                        <ExternalLink className="h-4 w-4 shrink-0 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                      </div>
                      {item.kind === "comment" && (
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                          {item.title}
                        </p>
                      )}
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-medium text-indigo-600 dark:text-indigo-400">
                          r/{item.subreddit}
                        </span>
                        <span>·</span>
                        <span>{item.score} pts</span>
                        <span>·</span>
                        <span>{timeAgo(item.createdUtc)}</span>
                        <span>·</span>
                        <span className="capitalize">{item.kind}</span>
                      </div>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
