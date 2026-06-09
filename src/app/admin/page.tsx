// src/app/admin/page.tsx

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import {
	getAllUsers,
	getAllPostsAdmin,
	getSystemStats,
	deleteAnyPost,
} from "@/lib/actions/admin.actions";
import StatsCard from "@/components/admin/StatsCard";
import UserRoleChanger from "@/components/admin/UserRoleChanger";
import AdminDeleteButton from "@/components/admin/AdminDeleteButton";
import RoleBadge from "@/components/ui/RoleBadge";
import Link from "next/link";

export const metadata = { title: "Admin Panel" };

export default async function AdminPage() {
	const session = await getSession();

	if (!session || session.role !== "super_admin") {
		redirect("/");
	}

	const [stats, users, posts] = await Promise.all([
		getSystemStats(),
		getAllUsers(),
		getAllPostsAdmin(),
	]);

	return (
		<main className="min-h-screen bg-[#0d0d0d]">
			<div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<p className="text-xs font-mono tracking-[0.2em] uppercase text-zinc-500 mb-1">
							Control panel
						</p>
						<h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
							Admin Dashboard
						</h1>
					</div>
					<Link
						href="/posts"
						className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
					>
						← Back to posts
					</Link>
				</div>

				{/* Stats Row */}
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<StatsCard
						icon="users"
						label="Total Users"
						count={stats.totalUsers}
					/>
					<StatsCard
						icon="posts"
						label="Total Posts"
						count={stats.totalPosts}
					/>
					<StatsCard
						icon="comments"
						label="Total Comments"
						count={stats.totalComments}
					/>
				</div>

				{/* ── Users Section ─────────────────────────────────────────── */}
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
								d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
							/>
						</svg>
						Users
						<span className="text-xs text-zinc-600 font-normal">
							({users.length})
						</span>
					</h2>

					<div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b border-zinc-800">
									<th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
										Name
									</th>
									<th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden sm:table-cell">
										Email
									</th>
									<th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
										Role
									</th>
									<th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
										Change Role
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-zinc-800">
								{users.map((user) => (
									<tr
										key={user._id}
										className="hover:bg-zinc-800/40 transition-colors"
									>
										<td className="px-5 py-3.5">
											<div className="flex items-center gap-2.5">
												<div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0">
													<span className="text-zinc-300 text-xs font-semibold">
														{user.name
															.charAt(0)
															.toUpperCase()}
													</span>
												</div>
												<span className="text-zinc-200 font-medium truncate max-w-[120px]">
													{user.name}
												</span>
												{user._id === session.id && (
													<span className="text-xs text-zinc-600">
														(you)
													</span>
												)}
											</div>
										</td>
										<td className="px-5 py-3.5 text-zinc-400 hidden sm:table-cell">
											{user.email}
										</td>
										<td className="px-5 py-3.5">
											<RoleBadge role={user.role} />
										</td>
										<td className="px-5 py-3.5">
											<UserRoleChanger
												userId={user._id}
												currentRole={user.role}
												isSuperAdmin={
													user.role === "super_admin"
												}
											/>
										</td>
									</tr>
								))}
							</tbody>
						</table>

						{users.length === 0 && (
							<div className="py-12 text-center text-sm text-zinc-600">
								No users found.
							</div>
						)}
					</div>
				</section>

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
									<tr
										key={post._id}
										className="hover:bg-zinc-800/40 transition-colors"
									>
										<td className="px-5 py-3.5">
											<Link
												href={`/posts/${post._id}`}
												className="text-zinc-200 hover:text-indigo-400 transition-colors font-medium line-clamp-1"
											>
												{post.title}
											</Link>
										</td>
										<td className="px-5 py-3.5 hidden md:table-cell">
											<div className="flex items-center gap-2">
												<span className="text-zinc-400">
													{post.author.name}
												</span>
												<RoleBadge
													role={post.author.role}
												/>
											</div>
										</td>
										<td className="px-5 py-3.5 text-zinc-500 text-xs hidden sm:table-cell">
											{new Date(
												post.createdAt,
											).toLocaleDateString("en-US", {
												month: "short",
												day: "numeric",
												year: "numeric",
											})}
										</td>
										<td className="px-5 py-3.5 text-right">
											<AdminDeleteButton
												label="Post"
												onDelete={deleteAnyPost.bind(
													null,
													post._id,
												)}
											/>
										</td>
									</tr>
								))}
							</tbody>
						</table>

						{posts.length === 0 && (
							<div className="py-12 text-center text-sm text-zinc-600">
								No posts found.
							</div>
						)}
					</div>
				</section>
			</div>
		</main>
	);
}
