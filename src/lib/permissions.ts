import type { SessionUser } from "@/types";
import type { IPost } from "@/lib/db/models/Post";
import type { IUser } from "@/lib/db/models/User";
import type { IComment } from "@/lib/db/models/Comment";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Resolves the author id regardless of whether the relation has been populated.
 * Before .populate(): author is a raw ObjectId string.
 * After  .populate(): author is an IUser object.
 */
function authorId(author: any): string {
	if (typeof author === "string") return author;
	// Populated IUser object (has ._id)
	if (author?._id !== undefined) return author._id.toString();
	// Raw ObjectId instance from .lean() — no ._id, but .toString() works
	return author.toString();
}

// ─── Post permissions ────────────────────────────────────────────────────────

/**
 * Only a regular_user who owns the post may edit it.
 * Moderators and super_admins can delete but NOT edit others' posts.
 */
export function canEditPost(
	sessionUser: SessionUser | null,
	post: IPost,
): boolean {
	if (!sessionUser) return false;
	if (sessionUser.role !== "regular_user") return false;
	return sessionUser.id === authorId(post.author);
}

/**
 * super_admin  → always
 * moderator    → always
 * regular_user → only their own post
 * guest        → never
 */
export function canDeletePost(
	sessionUser: SessionUser | null,
	post: IPost,
): boolean {
	if (!sessionUser) return false;
	if (sessionUser.role === "super_admin") return true;
	if (sessionUser.role === "moderator") return true;
	if (sessionUser.role === "regular_user") {
		return sessionUser.id === authorId(post.author);
	}
	return false;
}

// ─── Comment permissions ─────────────────────────────────────────────────────

/**
 * regular_user may create comments on any post (guests cannot).
 */
export function canCreateComment(sessionUser: SessionUser | null): boolean {
	if (!sessionUser) return false;
	return sessionUser.role === "regular_user";
}

/**
 * Who can delete a comment:
 *  - super_admin / moderator: always
 *  - post owner: can delete any comment on their post
 *  - comment owner: can delete their own comment
 *  - anyone else: no
 */
export function canDeleteComment(
	sessionUser: SessionUser | null,
	comment: IComment,
	post: IPost,
): boolean {
	if (!sessionUser) return false;
	if (sessionUser.role === "super_admin") return true;
	if (sessionUser.role === "moderator") return true;
	// Post owner can remove any comment on their post
	if (sessionUser.id === authorId(post.author)) return true;
	// Comment owner can remove their own comment
	if (sessionUser.id === authorId(comment.author)) return true;
	return false;
}
