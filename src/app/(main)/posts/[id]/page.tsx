// src/app/(main)/posts/[id]/page.tsx

import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostById } from "@/lib/actions/post.actions";
import { getSession } from "@/lib/auth/session";
import { canEditPost, canDeletePost } from "@/lib/permissions";
import DeletePostButton from "@/components/posts/DeletePostButton";
import RoleBadge from "@/components/ui/RoleBadge";
import CommentSection from "@/components/comments/CommentSection";

interface Props {
	params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
	const { id } = await params;
	const post = await getPostById(id);
	if (!post) return { title: "Post not found" };
	return {
		title: post.title,
		description: post.content.slice(0, 150),
	};
}

export default async function PostDetailPage({ params }: Props) {
	const { id } = await params;
	const [post, session] = await Promise.all([getPostById(id), getSession()]);

	if (!post) notFound();

	const author =
		typeof post.author === "object"
			? post.author
			: { name: "Unknown", role: "regular_user", _id: "" };

	const showEdit = canEditPost(session, post);
	const showDelete = canDeletePost(session, post);

	const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	const formattedTime = new Date(post.createdAt).toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
	});

	return (
		<main className="min-h-screen bg-[#0d0d0d]">
			<div className="max-w-3xl mx-auto px-4 py-10">
				{/* Back Button */}
				<Link
					href="/posts"
					className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-8 group"
				>
					<svg
						className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={2}
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M15 19l-7-7 7-7"
						/>
					</svg>
					All posts
				</Link>

				{/* Post Card */}
				<article className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
					{/* Post Header */}
					<div className="px-8 pt-8 pb-6 border-b border-zinc-800">
						<h1 className="text-2xl font-bold text-zinc-100 leading-snug mb-5">
							{post.title}
						</h1>

						{/* Author Row */}
						<div className="flex items-center justify-between gap-4 flex-wrap">
							<div className="flex items-center gap-3">
								{/* Avatar */}
								<div className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
									<span className="text-indigo-300 text-sm font-semibold">
										{author.name?.charAt(0).toUpperCase() ??
											"?"}
									</span>
								</div>
								<div>
									<div className="flex items-center gap-2">
										<span className="text-sm font-medium text-zinc-200">
											{author.name}
										</span>
										{/* <RoleBadge role={author.role as any} /> */}
									</div>
									<p className="text-xs text-zinc-500 mt-0.5">
										{formattedDate} · {formattedTime}
									</p>
								</div>
							</div>

							{/* Action Buttons */}
							{(showEdit || showDelete) && (
								<div className="flex items-center gap-2">
									{showEdit && (
										<Link
											href={`/posts/${post._id}/edit`}
											className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors border border-zinc-700 hover:border-zinc-600"
										>
											<svg
												className="w-3.5 h-3.5"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
												strokeWidth={2}
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
												/>
											</svg>
											Edit
										</Link>
									)}
									{/* {showDelete && (
										<DeletePostButton
											postId={post._id.toString()}
										/>
									)} */}
								</div>
							)}
						</div>
					</div>

					{/* Post Content */}
					<div className="px-8 py-7">
						<div className="prose prose-invert prose-zinc max-w-none">
							<p className="text-zinc-300 text-base leading-relaxed whitespace-pre-wrap">
								{post.content}
							</p>
						</div>
					</div>
				</article>

				{/* Comments Section */}
				<div className="mt-8">
					<CommentSection
						postId={post._id.toString()}
						session={session}
						post={post}
					/>
				</div>
			</div>
		</main>
	);
}
