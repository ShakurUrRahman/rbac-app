import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { Role } from "@/types";

// ─── Route protection map ─────────────────────────────────────────────────────

/**
 * Routes that require authentication AND a specific set of roles.
 * Matched with startsWith — order matters for more specific prefixes first.
 */
const ROLE_RULES: { prefix: string; allowed: Role[] }[] = [
	{
		prefix: "/admin",
		allowed: ["super_admin"],
	},
	{
		prefix: "/moderator",
		allowed: ["super_admin", "moderator"],
	},
	{
		prefix: "/posts/new",
		allowed: ["super_admin", "moderator", "regular_user"],
	},
];

export async function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl;

	// ── Always public: NextAuth's own API routes ────────────────────────────────
	if (pathname.startsWith("/api/auth")) {
		return NextResponse.next();
	}

	// ── NEW: Guest-Only Routes Guard ──────────────────────────────────────────
	// 1. Check if the user is visiting a route they shouldn't see if logged in
	const isGuestOnlyRoute = pathname === "/login" || pathname === "/register";

	// 2. Fetch token early so we can evaluate it for guest paths too
	const token = await getToken({
		req,
		secret: process.env.NEXTAUTH_SECRET,
	});

	// 3. If token exists and they are on /login or /register, redirect them away
	if (token && isGuestOnlyRoute) {
		const redirectUrl = req.nextUrl.clone();
		redirectUrl.pathname = "/posts"; // Redirect authenticated users here
		redirectUrl.searchParams.delete("callbackUrl"); // Clean up old query params
		return NextResponse.redirect(redirectUrl);
	}

	// 4. If they are an unauthenticated guest on a guest-only route, let them pass
	if (isGuestOnlyRoute) {
		return NextResponse.next();
	}

	// ── Check if the current path matches any protected rule ───────────────────
	const rule = ROLE_RULES.find((r) => pathname.startsWith(r.prefix));

	// No rule → fully public route (guests can view)
	if (!rule) {
		return NextResponse.next();
	}

	// ── Protected route: check the token we already fetched ───────────────────
	// No token → not authenticated → send to login
	if (!token) {
		const loginUrl = req.nextUrl.clone();
		loginUrl.pathname = "/login";
		loginUrl.searchParams.set("callbackUrl", pathname);
		return NextResponse.redirect(loginUrl);
	}

	const userRole = token.role as Role | undefined;

	// Token present but role not in the allowed list → redirect home with error
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
		/*
		 * Run middleware on all paths except:
		 * - _next/static / _next/image (build assets)
		 * - favicon.ico and common static file extensions
		 * api/auth is handled explicitly inside the middleware function above.
		 */
		"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
	],
};
