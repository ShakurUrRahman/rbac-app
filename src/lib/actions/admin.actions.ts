// src/lib/actions/admin.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/connection";
import User from "@/lib/db/models/User";
import Post from "@/lib/db/models/Post";
import Comment from "@/lib/db/models/Comment";

interface ActionResult {
	success: boolean;
	error?: string;
}

// ─── Guard ────────────────────────────────────────────────────────────────────

async function requireSuperAdmin() {
	const session = await auth();
	if (!session?.user?.id || session.user.role !== "super_admin") {
		throw new Error("Forbidden: super_admin only.");
	}
	return session.user.id as string;
}

// ─── getAllUsers ──────────────────────────────────────────────────────────────

export async function getAllUsers() {
	await requireSuperAdmin();
	await connectDB();

	const users = await User.find()
		.select("-password")
		.sort({ createdAt: -1 })
		.lean();

	return JSON.parse(JSON.stringify(users)) as {
		_id: string;
		name: string;
		email: string;
		role: string;
		createdAt: string;
	}[];
}

// ─── changeUserRole ───────────────────────────────────────────────────────────

export async function changeUserRole(
	userId: string,
	newRole: "moderator" | "regular_user",
): Promise<ActionResult> {
	let callerId: string;

	try {
		callerId = await requireSuperAdmin();
	} catch {
		return { success: false, error: "Forbidden." };
	}

	if (userId === callerId) {
		return { success: false, error: "You cannot change your own role." };
	}

	try {
		await connectDB();

		const target = await User.findById(userId).select("role").lean();
		if (!target) return { success: false, error: "User not found." };
		if (target.role === "super_admin") {
			return {
				success: false,
				error: "Cannot change another super admin's role.",
			};
		}

		await User.findByIdAndUpdate(userId, { role: newRole });
		revalidatePath("/admin");

		return { success: true };
	} catch (err) {
		console.error("[changeUserRole]", err);
		return { success: false, error: "Failed to update role." };
	}
}

// ─── getSystemStats ───────────────────────────────────────────────────────────

export async function getSystemStats() {
	await requireSuperAdmin();
	await connectDB();

	const [totalUsers, totalPosts, totalComments] = await Promise.all([
		User.countDocuments(),
		Post.countDocuments(),
		Comment.countDocuments(),
	]);

	return { totalUsers, totalPosts, totalComments };
}

// ─── getAllPostsAdmin ─────────────────────────────────────────────────────────

export async function getAllPostsAdmin() {
	await requireSuperAdmin();
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

// ─── deleteAnyPost ────────────────────────────────────────────────────────────

export async function deleteAnyPost(postId: string): Promise<ActionResult> {
	try {
		await requireSuperAdmin();
	} catch {
		return { success: false, error: "Forbidden." };
	}

	try {
		await connectDB();

		const post = await Post.findById(postId).lean();
		if (!post) return { success: false, error: "Post not found." };

		// Cascade: delete post + all its comments
		await Promise.all([
			Post.findByIdAndDelete(postId),
			Comment.deleteMany({ post: postId }),
		]);

		revalidatePath("/admin");
		revalidatePath("/posts");

		return { success: true };
	} catch (err) {
		console.error("[deleteAnyPost]", err);
		return { success: false, error: "Failed to delete post." };
	}
}

// ─── deleteAnyComment ─────────────────────────────────────────────────────────

export async function deleteAnyComment(
	commentId: string,
): Promise<ActionResult> {
	try {
		await requireSuperAdmin();
	} catch {
		return { success: false, error: "Forbidden." };
	}

	try {
		await connectDB();

		const comment = await Comment.findById(commentId).lean();
		if (!comment) return { success: false, error: "Comment not found." };

		await Comment.findByIdAndDelete(commentId);

		revalidatePath("/admin");

		return { success: true };
	} catch (err) {
		console.error("[deleteAnyComment]", err);
		return { success: false, error: "Failed to delete comment." };
	}
}
