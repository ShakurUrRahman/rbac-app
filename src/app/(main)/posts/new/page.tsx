import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import PostForm from "@/components/posts/PostForm";

export const metadata = {
	title: "Create Post",
	description: "Share your thoughts with the community",
};

export default async function CreatePostPage() {
	const session = await getSession();

	// Redirect unauthenticated users
	if (!session) {
		redirect("/login?callbackUrl=/posts/new");
	}

	// Check if user has permission to create posts
	const allowedRoles = ["regular_user", "moderator", "super_admin"];
	if (!allowedRoles.includes(session.role)) {
		redirect("/posts?error=unauthorized");
	}

	return (
		<main className="min-h-screen bg-[#0d0d0d] flex items-center justify-center px-4 py-12">
			<div className="w-full max-w-2xl">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-zinc-100 mb-2 tracking-tight">
						Create a new post
					</h1>
					<p className="text-zinc-400">
						Share your thoughts and ideas with the community
					</p>
				</div>

				{/* Form Card */}
				<div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-2xl">
					<PostForm />
				</div>
			</div>
		</main>
	);
}
