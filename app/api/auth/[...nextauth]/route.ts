// File: app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth";
import RedditProvider from "next-auth/providers/reddit";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    RedditProvider({
      clientId: process.env.REDDIT_CLIENT_ID || "",
      clientSecret: process.env.REDDIT_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async redirect({ baseUrl }) {
      // Redirect to /profile after sign in
      // We're not using the url parameter, so we can omit it
      return `${baseUrl}/profile`;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };