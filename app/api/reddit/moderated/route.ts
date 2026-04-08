import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const UA = "web:RedditProfileApp:v1.0.0";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.accessToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const res = await fetch(
      "https://oauth.reddit.com/subreddits/mine/moderator?limit=50",
      {
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
          "User-Agent": UA,
        },
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("Reddit moderated subs error:", res.status, text);
      return NextResponse.json(
        { error: "Could not load moderated communities", status: res.status },
        { status: res.status }
      );
    }

    const json = await res.json();
    const children = json?.data?.children ?? [];

    const subreddits = children.map(
      (c: { data: Record<string, unknown> }) => ({
        display_name: c.data?.display_name as string,
        subscribers: (c.data?.subscribers as number) ?? 0,
        icon_img: c.data?.icon_img as string | undefined,
        primary_color: c.data?.primary_color as string | undefined,
        public_description: c.data?.public_description as string | undefined,
      })
    );

    return NextResponse.json({ subreddits });
  } catch (e) {
    console.error("moderated route:", e);
    return NextResponse.json(
      { error: "Failed to fetch moderated subreddits" },
      { status: 500 }
    );
  }
}
