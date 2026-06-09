// src/components/comments/CommentSection.tsx

import { getCommentsByPost } from "@/lib/actions/comment.actions";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";
import Link from "next/link";
import type { SessionUser } from "@/types";

interface PostData {
	_id: string;
	author: { _id: string } | string;
}

interface Props {
	postId: string;
	post: PostData;
	session: SessionUser | null;
}

export default async function CommentSection({ postId, post, session }: Props) {
	const comments = await getCommentsByPost(postId);

	const canComment =
		session &&
		["regular_user", "moderator", "super_admin"].includes(session.role);

	return (
		<section className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
			{/* Header */}
			<div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-2">
				<svg
					className="w-4 h-4 text-zinc-500"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth={2}
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
					/>
				</svg>
				<h2 className="text-sm font-semibold text-zinc-300">
					{comments.length === 0
						? "No comments yet"
						: `${comments.length} comment${comments.length !== 1 ? "s" : ""}`}
				</h2>
			</div>

			{/* Comment list */}
			<div className="px-6">
				{comments.length === 0 ? (
					<div className="py-10 text-center">
						<p className="text-sm text-zinc-600">
							{canComment
								? "Be the first to leave a comment."
								: "No comments on this post yet."}
						</p>
					</div>
				) : (
					<div className="divide-y divide-zinc-800">
						{comments.map((comment) => (
							<CommentItem
								key={comment._id as string}
								comment={{
									_id: comment._id as string,
									content: comment.content,
									author: comment.author as any,
									post: postId,
									createdAt:
										comment.createdAt as unknown as string,
								}}
								post={post}
								sessionUser={session}
							/>
						))}
					</div>
				)}
			</div>

			{/* Comment form or guest prompt */}
			<div className="px-6 py-5 border-t border-zinc-800">
				{canComment ? (
					<CommentForm postId={postId} />
				) : (
					<p className="text-sm text-zinc-600 text-center">
						<Link
							href="/login"
							className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
						>
							Sign in
						</Link>{" "}
						to join the conversation.
					</p>
				)}
			</div>
		</section>
	);
}
