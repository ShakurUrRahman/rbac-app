// src/components/comments/CommentItem.tsx
"use client";

import { useState, useTransition } from "react";
import { deleteComment } from "@/lib/actions/comment.actions";
import { canDeleteComment } from "@/lib/permissions";
import RoleBadge from "@/components/ui/RoleBadge";
import toast from "react-hot-toast";
import type { SessionUser } from "@/types";

interface CommentAuthor {
	_id: string;
	name: string;
	role: string;
}

interface PostAuthor {
	_id: string;
}

interface CommentData {
	_id: string;
	content: string;
	author: CommentAuthor;
	post: string;
	createdAt: string;
}

interface PostData {
	_id: string;
	author: PostAuthor | string;
}

interface Props {
	comment: CommentData;
	post: PostData;
	sessionUser: SessionUser | null;
}

export default function CommentItem({ comment, post, sessionUser }: Props) {
	const [isPending, startTransition] = useTransition();
	const [deleted, setDeleted] = useState(false);

	// ✅ Client-side check — controls button visibility only.
	// The server action runs canDeleteComment again independently.
	const showDelete = canDeleteComment(
		sessionUser,
		comment as any,
		post as any,
	);

	const formattedDate = new Date(comment.createdAt).toLocaleDateString(
		"en-US",
		{
			month: "short",
			day: "numeric",
			year: "numeric",
		},
	);

	const formattedTime = new Date(comment.createdAt).toLocaleTimeString(
		"en-US",
		{
			hour: "2-digit",
			minute: "2-digit",
		},
	);

	function handleDelete() {
		if (!confirm("Delete this comment?")) return;

		startTransition(async () => {
			const result = await deleteComment(comment._id, post._id as string);
			if (result.success) {
				toast.success("Comment deleted.");
				setDeleted(true);
			} else {
				toast.error(result.error ?? "Failed to delete comment.");
			}
		});
	}

	// Optimistic removal — hide the item immediately after delete
	if (deleted) return null;

	return (
		<div className="group flex gap-3 py-4">
			{/* Avatar */}
			<div className="w-8 h-8 rounded-full bg-zinc-700 border border-zinc-600 flex items-center justify-center flex-shrink-0 mt-0.5">
				<span className="text-zinc-300 text-xs font-semibold">
					{comment.author.name?.charAt(0).toUpperCase() ?? "?"}
				</span>
			</div>

			{/* Body */}
			<div className="flex-1 min-w-0">
				{/* Author row */}
				<div className="flex items-center gap-2 mb-1 flex-wrap">
					<span className="text-sm font-medium text-zinc-200">
						{comment.author.name}
					</span>
					<RoleBadge role={comment.author.role as any} />
					<span className="text-xs text-zinc-600">
						{formattedDate} · {formattedTime}
					</span>
				</div>

				{/* Content */}
				<p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap break-words">
					{comment.content}
				</p>
			</div>

			{/* Delete button — only rendered if allowed */}
			{showDelete && (
				<button
					onClick={handleDelete}
					disabled={isPending}
					aria-label="Delete comment"
					className="flex-shrink-0 self-start mt-0.5 p-1.5 rounded-md text-zinc-600 hover:text-red-400 hover:bg-red-400/10 disabled:opacity-40 opacity-0 group-hover:opacity-100 transition-all"
				>
					{isPending ? (
						<svg
							className="w-4 h-4 animate-spin"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth={2}
						>
							<path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
						</svg>
					) : (
						<svg
							className="w-4 h-4"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth={2}
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
							/>
						</svg>
					)}
				</button>
			)}
		</div>
	);
}
