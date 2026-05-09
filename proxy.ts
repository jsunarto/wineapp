import { NextRequest, NextResponse } from "next/server";

const AUTH_REALM = "Wine Learning App";

function unauthorizedResponse(message = "Authentication required.") {
  return new NextResponse(message, {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${AUTH_REALM}", charset="UTF-8"`,
    },
  });
}

function parseBasicAuth(header: string | null) {
  if (!header?.startsWith("Basic ")) {
    return null;
  }

  const encoded = header.slice("Basic ".length).trim();
  let decoded = "";

  try {
    decoded = atob(encoded);
  } catch {
    return null;
  }

  const separatorIndex = decoded.indexOf(":");
  if (separatorIndex === -1) {
    return null;
  }

  return {
    username: decoded.slice(0, separatorIndex),
    password: decoded.slice(separatorIndex + 1),
  };
}

export function proxy(request: NextRequest) {
  const expectedUsername = process.env.BASIC_AUTH_USER;
  const expectedPassword = process.env.BASIC_AUTH_PASSWORD;

  if (!expectedUsername || !expectedPassword) {
    return unauthorizedResponse("Basic Auth is not configured.");
  }

  const credentials = parseBasicAuth(request.headers.get("authorization"));

  if (
    credentials?.username !== expectedUsername ||
    credentials?.password !== expectedPassword
  ) {
    return unauthorizedResponse();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml|json)$).*)",
  ],
};
