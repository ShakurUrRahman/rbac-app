// src/app/moderator/page.tsx

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import {
	getAllPostsMod,
	getAllCommentsMod,
} from "@/lib/actions/moderator.actions";
import ModPostRow from "@/components/moderator/ModPostRow";
import ModCommentRow from "@/components/moderator/ModCommentRow";
import Link from "next/link";

export const metadata = { title: "Moderator Panel" };

export default async function ModeratorPage() {
	const session = await getSession();

	if (!session || !["moderator", "super_admin"].includes(session.role)) {
		redirect("/");
	}

	const [posts, comments] = await Promise.all([
		getAllPostsMod(),
		getAllCommentsMod(),
	]);

	return (
		<main className="min-h-screen bg-[#0d0d0d]">
			<div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<p className="text-xs font-mono tracking-[0.2em] uppercase text-zinc-500 mb-1">
							Moderation panel
						</p>
						<h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
							Moderator Dashboard
						</h1>
						<p className="text-sm text-zinc-500 mt-1">
							Manage posts and comments across the platform.
						</p>
					</div>
					<Link
						href="/posts"
						className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
					>
						← Back to posts
					</Link>
				</div>

				{/* ── Posts Section ──────────────────────────────────────────── */}
				<section>
					<h2 className="text-base font-semibold text-zinc-200 mb-4 flex items-center gap-2">
						<svg
							className="w-4 h-4 text-zinc-500"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2}
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
							/>
						</svg>
						All Posts
						<span className="text-xs text-zinc-600 font-normal">
							({posts.length})
						</span>
					</h2>

					<div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
						{posts.length > 0 ? (
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b border-zinc-800">
										<th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
											Title
										</th>
										<th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden md:table-cell">
											Author
										</th>
										<th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden sm:table-cell">
											Date
										</th>
										<th className="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
											Action
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-zinc-800">
									{posts.map((post) => (
										<ModPostRow
											key={post._id}
											post={post}
										/>
									))}
								</tbody>
							</table>
						) : (
							<div className="py-12 text-center text-sm text-zinc-600">
								No posts found.
							</div>
						)}
					</div>
				</section>

				{/* ── Comments Section ───────────────────────────────────────── */}
				<section>
					<h2 className="text-base font-semibold text-zinc-200 mb-4 flex items-center gap-2">
						<svg
							className="w-4 h-4 text-zinc-500"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2}
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
							/>
						</svg>
						All Comments
						<span className="text-xs text-zinc-600 font-normal">
							({comments.length})
						</span>
					</h2>

					<div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
						{comments.length > 0 ? (
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b border-zinc-800">
										<th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
											Comment
										</th>
										<th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden md:table-cell">
											Author
										</th>
										<th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden lg:table-cell">
											On Post
										</th>
										<th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden sm:table-cell">
											Date
										</th>
										<th className="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
											Action
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-zinc-800">
									{comments.map((comment) => (
										<ModCommentRow
											key={comment._id}
											comment={comment}
										/>
									))}
								</tbody>
							</table>
						) : (
							<div className="py-12 text-center text-sm text-zinc-600">
								No comments found.
							</div>
						)}
					</div>
				</section>
			</div>
		</main>
	);
}
