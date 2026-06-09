import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import type { Role, SessionUser } from "@/types";

/**
 * Returns the current session user, or null if unauthenticated (guest).
 */
export async function getServerSession(): Promise<SessionUser | null> {
	const session = await auth();

	if (!session?.email) return null;

	return {
		id: session.user.id as string,
		name: session.user.name ?? "",
		email: session.user.email,
		role: (session.user.role as Role) ?? "regular_user",
	};
}

/**
 * Guards a Server Component or Server Action.
 *
 * - No session → redirect to /login
 * - Wrong role  → redirect to /
 *
 * Returns the authenticated SessionUser so callers skip a second lookup.
 *
 * Usage:
 *   const user = await requireAuth();
 *   const user = await requireAuth(["super_admin", "moderator"]);
 */
export async function requireAuth(roles?: Role[]): Promise<SessionUser> {
	const user = await getServerSession();

	if (!user) redirect("/login");

	if (roles && roles.length > 0 && !roles.includes(user.role)) {
		redirect("/");
	}

	return user;
}
