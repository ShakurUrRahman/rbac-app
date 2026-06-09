"use server";

import { revalidatePath } from "next/cache";
import Post from "@/lib/db/models/Post";
import type { IPost } from "@/lib/db/models/Post";
import type { IUser } from "@/lib/db/models/User";
import { connectDB } from "@/lib/db/connection";
import { auth } from "../auth/auth";
import { PostSchema } from "../validations/post.schema";
import type { SessionUser } from "@/types";
import { canEditPost } from "@/lib/permissions";

interface ActionResult {
	success: boolean;
	error?: string;
	postId?: string;
}

/** Post with author fully populated */
type PostWithAuthor = Omit<IPost, "author"> & {
	author: Pick<IUser, "_id" | "name" | "role">;
};

/**
 * Create a new post (server action)
 * Only regular_user, moderator, and super_admin can create posts
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

	const allowedRoles = ["regular_user", "moderator", "super_admin"];
	if (!allowedRoles.includes(session.user.role as string)) {
		return {
			success: false,
			error: "You do not have permission to create posts.",
		};
	}

	const raw = {
		title: formData.get("title"),
		content: formData.get("content"),
	};

	const parsed = PostSchema.safeParse(raw);
	if (!parsed.success) {
		const fieldErrors = parsed.error.flatten().fieldErrors;
		const firstError = Object.values(fieldErrors)[0]?.[0];
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

/**
 * Update an existing post (server action)
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

		// ✅ Map auth() result to flat SessionUser before passing to permission helper
		const sessionUser: SessionUser = {
			id: session.user.id as string,
			role: session.user.role as string,
			name: session.user.name as string,
			email: session.user.email as string,
		};

		if (!canEditPost(sessionUser, post as IPost)) {
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

/**
 * Get all posts with author information
 * Sorted by most recent first
 */
export async function getPosts(): Promise<PostWithAuthor[]> {
	try {
		await connectDB();

		const posts = await Post.find()
			.populate("author", "name role")
			.sort({ createdAt: -1 })
			.lean();

		return JSON.parse(JSON.stringify(posts)) as PostWithAuthor[];
	} catch (err) {
		console.error("[getPosts]", err);
		return [];
	}
}

/**
 * Get a single post by ID with author information
 */
export async function getPostById(id: string): Promise<PostWithAuthor | null> {
	try {
		await connectDB();

		const post = await Post.findById(id)
			.populate("author", "name role")
			.lean();

		if (!post) return null;

		return JSON.parse(JSON.stringify(post)) as PostWithAuthor;
	} catch (err) {
		console.error("[getPostById]", err);
		return null;
	}
}
