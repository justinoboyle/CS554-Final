// this file is a wrapper with defaults to be used in both API routes and `getServerSideProps` functions
// sourced from https://github.com/vercel/next.js/blob/canary/examples/with-iron-session/lib/session.ts
import type { IronSessionOptions } from "iron-session";
import type { UserSession } from "../helpers/userHelper";

export const sessionOptions: IronSessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD as string,
  cookieName: "haptickrill-session-cookie",
  // secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

// This is where we specify the typings of req.session.*
declare module "iron-session" {
  interface IronSessionData {
    user?: UserSession;
  }
}
