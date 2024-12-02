import { createCookieSessionStorage } from "@remix-run/node";

type SessionData = {
  user_id: string;
};

type SessionFlashData = {
  error: string;
};

const { getSession, commitSession, destroySession }
  = createCookieSessionStorage<SessionData, SessionFlashData>(
    {
      // a Cookie from `createCookie` or the CookieOptions to create one
      cookie: {
        name: "__session",

        // all of these are optional
        ...process.env.NODE_ENV == "production" ? { domain: "aoc.dev.comp-soc.com" } : {},
        // Expires can also be set (although maxAge overrides it when used in combination).
        // Note that this method is NOT recommended as `new Date` creates only one date on each server deployment, not a dynamic date in the future!
        //
        // expires: new Date(Date.now() + 60_000),
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
        sameSite: "strict",
        secrets: [process.env.SESSION_SECRET || "s3cret1"],
        secure: true,
      },
    },
  );

export { getSession, commitSession, destroySession };

export async function requireUserSession(request: Request) {
  // get the session
  const cookie = request.headers.get("cookie");
  const session = await getSession(cookie);

  if (!session.has("user_id")) {
    return null;
  }

  return session;
}
