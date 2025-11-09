import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      userId?: string | null;
      bio?: string | null;
      backgroundImage?: string | null;
    };
  }
}






