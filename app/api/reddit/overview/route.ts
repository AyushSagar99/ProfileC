import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const UA = "web:RedditProfileApp:v1.0.0";

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

async function resolveUsername(
  token: { accessToken?: string; name?: string | null }
): Promise<string | null> {
  if (typeof token.name === "string" && token.name.length > 0) {
    return token.name;
  }
  const res = await fetch("https://oauth.reddit.com/api/v1/me", {
    headers: {
      Authorization: `Bearer ${token.accessToken}`,
      "User-Agent": UA,
    },
  });
  if (!res.ok) return null;
  const me = await res.json();
  return typeof me?.name === "string" ? me.name : null;
}

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.accessToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const username = await resolveUsername(token);
    if (!username) {
      return NextResponse.json(
        { error: "Could not resolve Reddit username" },
        { status: 400 }
      );
    }

    const url = new URL(
      `https://oauth.reddit.com/user/${encodeURIComponent(username)}/overview`
    );
    url.searchParams.set("limit", "10");
    url.searchParams.set("raw_json", "1");

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
        "User-Agent": UA,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Reddit overview error:", res.status, text);
      return NextResponse.json(
        { error: "Could not load recent activity", status: res.status },
        { status: res.status }
      );
    }

    const json = await res.json();
    const children = json?.data?.children ?? [];

    type OverviewItem =
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

    const items: OverviewItem[] = [];

    for (const child of children) {
      const k = child?.kind;
      const d = child?.data;
      if (!d) continue;

      if (k === "t3") {
        items.push({
          kind: "post",
          title: (d.title as string) || "Post",
          subreddit: (d.subreddit as string) || "",
          permalink: (d.permalink as string) || "",
          score: typeof d.score === "number" ? d.score : 0,
          createdUtc: typeof d.created_utc === "number" ? d.created_utc : 0,
        });
      } else if (k === "t1") {
        const body = stripHtml(String(d.body || ""));
        const linkTitle = (d.link_title as string) || "Thread";
        items.push({
          kind: "comment",
          title:
            body.length > 100 ? `${body.slice(0, 100)}…` : body || "Comment",
          linkTitle,
          subreddit: (d.subreddit as string) || "",
          permalink: (d.permalink as string) || "",
          score: typeof d.score === "number" ? d.score : 0,
          createdUtc: typeof d.created_utc === "number" ? d.created_utc : 0,
        });
      }
    }

    return NextResponse.json({ items });
  } catch (e) {
    console.error("overview route:", e);
    return NextResponse.json(
      { error: "Failed to fetch overview" },
      { status: 500 }
    );
  }
}
