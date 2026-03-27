import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      piyo_user_id: string;
      provider: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    piyo_user_id: string;
    provider: string;
    provider_id: string;
  }
}
