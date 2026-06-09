// ─────────────────────────────────────────────────────────────────────────────
// Role types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Full role universe including unauthenticated visitors.
 * - "guest" is never stored in the DB; it represents an absent session.
 */
export type Role = "super_admin" | "moderator" | "regular_user" | "guest";

/**
 * Roles that can actually be persisted on a User document.
 * (Excludes "guest", which is inferred from a missing session.)
 */
export type DbRole = Exclude<Role, "guest">;
// → "super_admin" | "moderator" | "regular_user"

// ─────────────────────────────────────────────────────────────────────────────
// Session / JWT payload
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The user shape stored in the NextAuth JWT and exposed on session.user.
 * All fields are plain strings so they survive serialisation over the wire.
 */
export interface SessionUser {
	/** MongoDB _id as a string */
	id: string;
	name: string;
	email: string;
	/** Includes "guest" for unauthenticated callers that build a synthetic object */
	role: Role;
}
