// File: app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth/next";
import RedditProvider from "next-auth/providers/reddit";

// Configure the authentication providers
const handler = NextAuth({
  providers: [
    RedditProvider({
      clientId: process.env.REDDIT_CLIENT_ID || "",
      clientSecret: process.env.REDDIT_CLIENT_SECRET || "",
      authorization: {
        params: {
          // Request identity, mysubreddits and history scopes
          scope: "identity mysubreddits history"
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Save the access token from the account to the token
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      // Add access token to the session (to make it available on the client)
      session.accessToken = token.accessToken;
      return session;
    },
    async redirect({ baseUrl }) {
      // Redirect to profile after signing in
      return `${baseUrl}/profile`;
    },
  },
});

// Export the handlers with their proper names
export { handler as GET, handler as POST };