"use client";

import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

/* eslint-disable @next/next/no-img-element */

export type ModeratedSubreddit = {
  display_name: string;
  subscribers: number;
  icon_img?: string;
  primary_color?: string;
};

function decodeHtmlEntities(html: string | undefined) {
  if (!html) return "";
  const textArea = document.createElement("textarea");
  textArea.innerHTML = html;
  return textArea.value;
}

export default function ModeratedSubredditsCard({
  subs,
  className,
}: {
  subs: ModeratedSubreddit[];
  className?: string;
}) {
  if (subs.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg overflow-hidden",
        className
      )}
    >
      <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <Shield className="h-5 w-5 text-emerald-500 dark:text-emerald-400" aria-hidden />
          Communities you moderate
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {subs.length} subreddit{subs.length === 1 ? "" : "s"}
        </p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {subs.map((sub) => (
            <a
              key={sub.display_name}
              href={`https://www.reddit.com/r/${sub.display_name}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-3 transition-all hover:border-emerald-400/50 dark:hover:border-emerald-500/30 hover:shadow-md"
            >
              <div
                className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: sub.primary_color || "#059669" }}
              >
                {sub.icon_img ? (
                  <img
                    src={decodeHtmlEntities(sub.icon_img)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-bold text-white">
                    {sub.display_name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-800 dark:text-gray-200 truncate">
                  r/{sub.display_name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {sub.subscribers.toLocaleString()} members
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
