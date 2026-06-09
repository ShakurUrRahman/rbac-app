// src/lib/actions/comment.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/connection";
import Comment from "@/lib/db/models/Comment";
import Post from "@/lib/db/models/Post";
import { CommentSchema } from "@/lib/validations/comment.schema";
import { canDeleteComment } from "@/lib/permissions";
import type { SessionUser } from "@/types";
import type { IPost } from "@/lib/db/models/Post";
import type { IComment } from "@/lib/db/models/Comment";
import type { IUser } from "@/lib/db/models/User";

interface ActionResult {
	success: boolean;
	error?: string;
}

type CommentWithAuthor = Omit<IComment, "author"> & {
	author: Pick<IUser, "_id" | "name" | "role">;
};

// ─── Helper: map auth() → flat SessionUser ───────────────────────────────────
// Must be called inside every server action that uses permission helpers,
// because auth() returns { user: { id, role } } but permission helpers
// expect the flat SessionUser shape { id, role }.

function toSessionUser(
	session: Awaited<ReturnType<typeof auth>>,
): SessionUser | null {
	if (!session?.user?.id) return null;
	return {
		id: session.user.id as string,
		role: session.user.role as string,
		name: session.user.name ?? "",
		email: session.user.email ?? "",
	};
}

// ─── createComment ────────────────────────────────────────────────────────────
// postId is bound via .bind(null, postId) in the client component.
// Signature: (postId, _prevState, formData)

export async function createComment(
	postId: string,
	_prevState: ActionResult,
	formData: FormData,
): Promise<ActionResult> {
	const session = await auth();
	const sessionUser = toSessionUser(session);

	if (!sessionUser) {
		return { success: false, error: "You must be logged in to comment." };
	}

	const allowedRoles = ["regular_user", "moderator", "super_admin"];
	if (!allowedRoles.includes(sessionUser.role)) {
		return { success: false, error: "Guests cannot post comments." };
	}

	const raw = { content: formData.get("content") };

	const parsed = CommentSchema.safeParse(raw);
	if (!parsed.success) {
		const firstError = Object.values(
			parsed.error.flatten().fieldErrors,
		)[0]?.[0];
		return { success: false, error: firstError || "Validation failed." };
	}

	try {
		await connectDB();

		// Verify the post exists before saving
		const post = await Post.findById(postId).lean();
		if (!post) return { success: false, error: "Post not found." };

		await Comment.create({
			content: parsed.data.content,
			author: sessionUser.id,
			post: postId,
		});

		revalidatePath(`/posts/${postId}`);
		return { success: true };
	} catch (err) {
		console.error("[createComment]", err);
		return {
			success: false,
			error: "Failed to post comment. Please try again.",
		};
	}
}

// ─── deleteComment ────────────────────────────────────────────────────────────

export async function deleteComment(
	commentId: string,
	postId: string,
): Promise<ActionResult> {
	const session = await auth();
	const sessionUser = toSessionUser(session);

	if (!sessionUser) {
		return { success: false, error: "You must be logged in." };
	}

	try {
		await connectDB();

		// Fetch both comment and post — both are required for the 3-party permission check
		const [comment, post] = await Promise.all([
			Comment.findById(commentId).lean(),
			Post.findById(postId).lean(),
		]);

		if (!comment) return { success: false, error: "Comment not found." };
		if (!post) return { success: false, error: "Post not found." };

		// ✅ Server-side permission check — never rely on client alone
		if (
			!canDeleteComment(sessionUser, comment as IComment, post as IPost)
		) {
			return {
				success: false,
				error: "You are not authorized to delete this comment.",
			};
		}

		await Comment.findByIdAndDelete(commentId);

		revalidatePath(`/posts/${postId}`);
		return { success: true };
	} catch (err) {
		console.error("[deleteComment]", err);
		return {
			success: false,
			error: "Failed to delete comment. Please try again.",
		};
	}
}

// ─── getCommentsByPost ────────────────────────────────────────────────────────

export async function getCommentsByPost(
	postId: string,
): Promise<CommentWithAuthor[]> {
	try {
		await connectDB();

		const comments = await Comment.find({ post: postId })
			.populate("author", "name role") // only name + role, never password
			.sort({ createdAt: 1 }) // oldest first
			.lean();

		return JSON.parse(JSON.stringify(comments)) as CommentWithAuthor[];
	} catch (err) {
		console.error("[getCommentsByPost]", err);
		return [];
	}
}
