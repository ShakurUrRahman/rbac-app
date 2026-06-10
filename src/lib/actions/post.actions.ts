"use server";

import { revalidatePath } from "next/cache";
import Post from "@/lib/db/models/Post";
import Comment from "@/lib/db/models/Comment";
import type { IPost } from "@/lib/db/models/Post";
import type { IUser } from "@/lib/db/models/User";
import { connectDB } from "@/lib/db/connection";
import { auth } from "../auth/auth";
import { PostSchema } from "../validations/post.schema";
import type { SessionUser } from "@/types";
import { canEditPost, canDeletePost } from "@/lib/permissions";

interface ActionResult {
	success: boolean;
	error?: string;
	postId?: string;
}

/** Post with author fully populated */
type PostWithAuthor = Omit<IPost, "author"> & {
	author: Pick<IUser, "_id" | "name" | "role">;
};

// ─── Shared helper ────────────────────────────────────────────────────────────

/** Map the auth() session to the flat SessionUser shape expected by permissions */
function toSessionUser(session: {
	user: { id?: unknown; role?: unknown; name?: unknown; email?: unknown };
}): SessionUser {
	return {
		id: session.user.id as string,
		role: session.user.role as string,
		name: session.user.name as string,
		email: session.user.email as string,
	};
}

// ─── Create ───────────────────────────────────────────────────────────────────

/**
 * Create a new post.
 * Only regular_user can create posts — moderators and super_admins cannot,
 * per the project spec: "Only regular_user can create posts."
 */
export async function createPost(
	_prevState: ActionResult,
	formData: FormData,
): Promise<ActionResult> {
	const session = await auth();

	if (!session?.user?.id) {
		return {
			success: false,
			error: "You must be logged in to create a post.",
		};
	}

	// Restricted to regular_user only — spec is explicit on this
	if (session.user.role !== "regular_user") {
		return {
			success: false,
			error: "Only regular users can create posts.",
		};
	}

	const raw = {
		title: formData.get("title"),
		content: formData.get("content"),
	};

	const parsed = PostSchema.safeParse(raw);
	if (!parsed.success) {
		const firstError = Object.values(
			parsed.error.flatten().fieldErrors,
		)[0]?.[0];
		return { success: false, error: firstError || "Validation failed." };
	}

	const { title, content } = parsed.data;

	try {
		await connectDB();
		const post = await Post.create({
			title,
			content,
			author: session.user.id,
		});
		revalidatePath("/posts");
		return { success: true, postId: post._id.toString() };
	} catch (err) {
		console.error("[createPost]", err);
		return {
			success: false,
			error: "Failed to create post. Please try again.",
		};
	}
}

// ─── Update ───────────────────────────────────────────────────────────────────

/**
 * Update an existing post.
 * Only the post owner (regular_user) may edit — moderators/super_admins can
 * delete but not edit others' posts.
 */
export async function updatePost(
	_prevState: ActionResult,
	formData: FormData,
): Promise<ActionResult> {
	const session = await auth();

	if (!session?.user?.id) {
		return {
			success: false,
			error: "You must be logged in to update a post.",
		};
	}

	const postId = formData.get("postId") as string;
	if (!postId) {
		return { success: false, error: "Missing post target identifier." };
	}

	const raw = {
		title: formData.get("title"),
		content: formData.get("content"),
	};

	const parsed = PostSchema.safeParse(raw);
	if (!parsed.success) {
		const firstError = Object.values(
			parsed.error.flatten().fieldErrors,
		)[0]?.[0];
		return { success: false, error: firstError || "Validation failed." };
	}

	const { title, content } = parsed.data;

	try {
		await connectDB();

		const post = await Post.findById(postId).lean();
		if (!post) {
			return {
				success: false,
				error: "The post you are trying to edit no longer exists.",
			};
		}

		if (!canEditPost(toSessionUser(session), post as IPost)) {
			return {
				success: false,
				error: "You do not have permission to edit this post.",
			};
		}

		await Post.findByIdAndUpdate(postId, { title, content });

		revalidatePath("/posts");
		revalidatePath(`/posts/${postId}`);

		return { success: true, postId };
	} catch (err) {
		console.error("[updatePost]", err);
		return {
			success: false,
			error: "Failed to update the post. Please try again.",
		};
	}
}

// ─── Delete ───────────────────────────────────────────────────────────────────

/**
 * Delete a post and cascade-delete all its comments.
 *
 * Who can delete:
 *  - super_admin  → any post
 *  - moderator    → any post
 *  - regular_user → only their own post
 *  - guest        → never
 */
export async function deletePost(postId: string): Promise<ActionResult> {
	const session = await auth();

	if (!session?.user?.id) {
		return {
			success: false,
			error: "You must be logged in to delete a post.",
		};
	}

	if (!postId) {
		return { success: false, error: "Missing post identifier." };
	}

	try {
		await connectDB();

		const post = await Post.findById(postId).lean();
		if (!post) {
			return {
				success: false,
				error: "Post not found or already deleted.",
			};
		}

		if (!canDeletePost(toSessionUser(session), post as IPost)) {
			return {
				success: false,
				error: "You do not have permission to delete this post.",
			};
		}

		// Cascade: remove the post and all comments in parallel
		await Promise.all([
			Post.findByIdAndDelete(postId),
			Comment.deleteMany({ post: postId }),
		]);

		revalidatePath("/posts");
		return { success: true };
	} catch (err) {
		console.error("[deletePost]", err);
		return {
			success: false,
			error: "Failed to delete the post. Please try again.",
		};
	}
}
