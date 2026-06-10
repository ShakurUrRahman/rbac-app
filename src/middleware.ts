import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { Role } from "@/types";

const ROLE_RULES: { prefix: string; allowed: Role[] }[] = [
	{ prefix: "/admin", allowed: ["super_admin"] },
	{ prefix: "/moderator", allowed: ["super_admin", "moderator"] },
	{
		prefix: "/posts/new",
		allowed: ["super_admin", "moderator", "regular_user"],
	},
];

export async function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl;

	if (pathname.startsWith("/api/auth")) {
		return NextResponse.next();
	}

	const rule = ROLE_RULES.find((r) => pathname.startsWith(r.prefix));
	if (!rule) {
		return NextResponse.next();
	}

	// NextAuth v5 uses different cookie names depending on the environment:
	//   development : "authjs.session-token"
	//   production  : "__Secure-authjs.session-token"  (HTTPS-only, __Secure prefix)
	// Without an explicit cookieName, getToken() only checks one name and
	// returns null in production even when the user is logged in.
	const cookieName =
		process.env.NODE_ENV === "production"
			? "__Secure-authjs.session-token"
			: "authjs.session-token";

	const token = await getToken({
		req,
		secret: process.env.NEXTAUTH_SECRET,
		cookieName,
	});

	if (!token) {
		const loginUrl = req.nextUrl.clone();
		loginUrl.pathname = "/login";
		loginUrl.searchParams.set("callbackUrl", pathname);
		return NextResponse.redirect(loginUrl);
	}

	const userRole = token.role as Role | undefined;

	if (!userRole || !rule.allowed.includes(userRole)) {
		const homeUrl = req.nextUrl.clone();
		homeUrl.pathname = "/";
		homeUrl.searchParams.set("error", "unauthorized");
		return NextResponse.redirect(homeUrl);
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
	],
};
