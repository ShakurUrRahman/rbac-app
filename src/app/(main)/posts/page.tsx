import Link from "next/link";
import PostCard from "@/components/posts/PostCard";
import { getPosts } from "@/lib/queries/post-queries";
import { getSession } from "@/lib/auth/session";

export const metadata = {
	title: "Posts",
	description: "Browse all posts from our community",
};

export default async function PostsPage() {
	const session = await getSession();
	const { posts } = await getPosts(); // ← destructure here

	const canCreatePost =
		session &&
		["regular_user", "moderator", "super_admin"].includes(session.role);

	return (
		<main className="min-h-screen bg-[#0d0d0d]">
			<div className="bg-gradient-to-b from-zinc-900 to-zinc-900/50 border-b border-zinc-800 px-4 py-12">
				<div className="max-w-4xl mx-auto">
					<h1 className="text-4xl font-bold text-zinc-100 mb-3 tracking-tight">
						Community Posts
					</h1>
					<p className="text-zinc-400 mb-6">
						Read and share ideas with our community members
					</p>

					{canCreatePost ? (
						<Link
							href="/posts/new"
							className="inline-flex items-center px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400"
						>
							+ Create Post
						</Link>
					) : (
						!session && (
							<Link
								href="/login"
								className="inline-flex items-center px-4 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition-colors"
							>
								Sign in to create posts
							</Link>
						)
					)}
				</div>
			</div>

			<div className="max-w-4xl mx-auto px-4 py-12">
				{posts.length > 0 ? (
					<div className="space-y-4">
						{posts.map((post) => (
							<PostCard
								key={post._id}
								id={post._id}
								title={post.title}
								content={post.content}
								author={post.author}
								createdAt={post.createdAt}
							/>
						))}
					</div>
				) : (
					<div className="text-center py-16">
						<div className="mb-4 text-5xl">📝</div>
						<h2 className="text-xl font-semibold text-zinc-200 mb-2">
							No posts yet
						</h2>
						<p className="text-zinc-400 mb-6">
							Be the first to share your thoughts with the
							community
						</p>
						{canCreatePost && (
							<Link
								href="/posts/new"
								className="inline-flex items-center px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
							>
								Create the first post
							</Link>
						)}
					</div>
				)}
			</div>
		</main>
	);
}
