// src/lib/actions/moderator.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/connection";
import Post from "@/lib/db/models/Post";
import Comment from "@/lib/db/models/Comment";

interface ActionResult {
	success: boolean;
	error?: string;
}

// ─── Guard ────────────────────────────────────────────────────────────────────

async function requireMod() {
	const session = await auth();
	const role = session?.user?.role as string | undefined;
	if (
		!session?.user?.id ||
		!["moderator", "super_admin"].includes(role ?? "")
	) {
		throw new Error("Forbidden: moderator or super_admin only.");
	}
	return { id: session.user.id as string, role };
}

// ─── getAllPostsMod ───────────────────────────────────────────────────────────

export async function getAllPostsMod() {
	await requireMod();
	await connectDB();

	const posts = await Post.find()
		.populate("author", "name role")
		.sort({ createdAt: -1 })
		.lean();

	return JSON.parse(JSON.stringify(posts)) as {
		_id: string;
		title: string;
		content: string;
		author: { _id: string; name: string; role: string };
		createdAt: string;
	}[];
}

// ─── getAllCommentsMod ────────────────────────────────────────────────────────

export async function getAllCommentsMod() {
	await requireMod();
	await connectDB();

	const comments = await Comment.find()
		.populate("author", "name role")
		.populate("post", "title")
		.sort({ createdAt: -1 })
		.lean();

	return JSON.parse(JSON.stringify(comments)) as {
		_id: string;
		content: string;
		author: { _id: string; name: string; role: string };
		post: { _id: string; title: string };
		createdAt: string;
	}[];
}

// ─── deletePostAsMod ─────────────────────────────────────────────────────────

export async function deletePostAsMod(postId: string): Promise<ActionResult> {
	try {
		await requireMod();
	} catch {
		return { success: false, error: "Forbidden." };
	}

	try {
		await connectDB();

		const post = await Post.findById(postId).lean();
		if (!post) return { success: false, error: "Post not found." };

		// Cascade delete — remove post and all its comments
		await Promise.all([
			Post.findByIdAndDelete(postId),
			Comment.deleteMany({ post: postId }),
		]);

		revalidatePath("/moderator");
		revalidatePath("/posts");

		return { success: true };
	} catch (err) {
		console.error("[deletePostAsMod]", err);
		return { success: false, error: "Failed to delete post." };
	}
}

// ─── deleteCommentAsMod ───────────────────────────────────────────────────────

export async function deleteCommentAsMod(
	commentId: string,
): Promise<ActionResult> {
	try {
		await requireMod();
	} catch {
		return { success: false, error: "Forbidden." };
	}

	try {
		await connectDB();

		const comment = await Comment.findById(commentId).lean();
		if (!comment) return { success: false, error: "Comment not found." };

		await Comment.findByIdAndDelete(commentId);

		revalidatePath("/moderator");

		return { success: true };
	} catch (err) {
		console.error("[deleteCommentAsMod]", err);
		return { success: false, error: "Failed to delete comment." };
	}
}
