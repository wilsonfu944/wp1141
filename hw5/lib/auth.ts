import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;
      
      // Check if user has a userId set
      const existingUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      // If user doesn't have a userId, redirect to registration
      if (existingUser && !existingUser.userId) {
        return '/auth/register';
      }

      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { userId: true, bio: true, backgroundImage: true },
        });
        if (dbUser) {
          session.user.userId = dbUser.userId;
          session.user.bio = dbUser.bio;
          session.user.backgroundImage = dbUser.backgroundImage;
        }
      }
      return session;
    },
  },
  session: {
    strategy: "database",
  },
};




