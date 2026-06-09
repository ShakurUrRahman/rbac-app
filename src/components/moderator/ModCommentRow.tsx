// src/components/moderator/ModCommentRow.tsx
"use client";

import { useTransition, useState } from "react";
import { deleteCommentAsMod } from "@/lib/actions/moderator.actions";
import RoleBadge from "@/components/ui/RoleBadge";
import Link from "next/link";
import toast from "react-hot-toast";

interface Props {
	comment: {
		_id: string;
		content: string;
		author: { _id: string; name: string; role: string };
		post: { _id: string; title: string };
		createdAt: string;
	};
}

export default function ModCommentRow({ comment }: Props) {
	const [isPending, startTransition] = useTransition();
	const [deleted, setDeleted] = useState(false);

	if (deleted) return null;

	function handleDelete() {
		if (!confirm("Delete this comment? This cannot be undone.")) return;

		startTransition(async () => {
			const result = await deleteCommentAsMod(comment._id);
			if (result.success) {
				toast.success("Comment deleted.");
				setDeleted(true);
			} else {
				toast.error(result.error ?? "Failed to delete comment.");
			}
		});
	}

	// Truncate long comment content for table display
	const preview =
		comment.content.length > 80
			? comment.content.slice(0, 80).trimEnd() + "…"
			: comment.content;

	return (
		<tr className="hover:bg-zinc-800/40 transition-colors">
			{/* Comment preview */}
			<td className="px-5 py-3.5">
				<p className="text-zinc-300 text-sm">{preview}</p>
			</td>

			{/* Author */}
			<td className="px-5 py-3.5 hidden md:table-cell">
				<div className="flex items-center gap-2">
					<span className="text-zinc-400 text-sm">
						{comment.author.name}
					</span>
					<RoleBadge role={comment.author.role} />
				</div>
			</td>

			{/* Post it belongs to */}
			<td className="px-5 py-3.5 hidden lg:table-cell">
				<Link
					href={`/posts/${comment.post._id}`}
					className="text-xs text-zinc-500 hover:text-indigo-400 transition-colors line-clamp-1 max-w-[160px] block"
				>
					{comment.post.title}
				</Link>
			</td>

			{/* Date */}
			<td className="px-5 py-3.5 hidden sm:table-cell">
				<span className="text-zinc-500 text-xs">
					{new Date(comment.createdAt).toLocaleDateString("en-US", {
						month: "short",
						day: "numeric",
						year: "numeric",
					})}
				</span>
			</td>

			{/* Delete */}
			<td className="px-5 py-3.5 text-right">
				<button
					onClick={handleDelete}
					disabled={isPending}
					className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
				>
					{isPending ? (
						<svg
							className="w-3.5 h-3.5 animate-spin"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth={2}
						>
							<path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
						</svg>
					) : (
						<svg
							className="w-3.5 h-3.5"
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
					{isPending ? "Deleting…" : "Delete"}
				</button>
			</td>
		</tr>
	);
}
