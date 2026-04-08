"use client";

import {
  ExternalLink,
  Inbox,
  PlusCircle,
  Settings,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const linksFor = (username: string) =>
  [
    {
      label: "Reddit profile",
      description: "Public profile on reddit.com",
      href: `https://www.reddit.com/user/${encodeURIComponent(username)}/`,
      icon: UserCircle,
    },
    {
      label: "Create a post",
      description: "Open the submit flow",
      href: "https://www.reddit.com/submit",
      icon: PlusCircle,
    },
    {
      label: "Inbox",
      description: "Messages and replies",
      href: "https://www.reddit.com/message/inbox/",
      icon: Inbox,
    },
    {
      label: "Reddit settings",
      description: "Account & app permissions",
      href: "https://www.reddit.com/settings/",
      icon: Settings,
    },
  ] as const;

export default function RedditQuickLinks({
  username,
  className,
}: {
  username: string;
  className?: string;
}) {
  const links = linksFor(username);

  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg overflow-hidden h-full",
        className
      )}
    >
      <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Shortcuts
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Jump to Reddit in one click
        </p>
      </div>
      <ul className="divide-y divide-gray-100 dark:divide-gray-700 p-2">
        {links.map(({ label, description, href, icon: Icon }) => (
          <li key={label}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 group"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300 group-hover:bg-orange-500/15 group-hover:text-orange-600 dark:group-hover:text-orange-400">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1 font-medium text-gray-800 dark:text-gray-200">
                  {label}
                  <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" aria-hidden />
                </span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">
                  {description}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
