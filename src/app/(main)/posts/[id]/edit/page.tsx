import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { canEditPost } from "@/lib/permissions";
import PostForm from "@/components/posts/PostForm";
import { getPostById } from "@/lib/queries/post-queries";

interface EditPostPageProps {
	params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
	const { id } = await params;

	// Execute the exact data gathering pattern used by your functional detail page
	const [post, sessionUser] = await Promise.all([
		getPostById(id),
		getSession(),
	]);

	// 404 if post not found
	if (!post) notFound();

	// Not signed in → go to login
	if (!sessionUser) redirect("/login");

	// Signed in but not allowed to edit → go home
	if (!canEditPost(sessionUser, post)) redirect("/");

	return (
		<div className="max-w-3xl mx-auto">
			<div className="mb-8">
				<p className="text-xs font-mono tracking-[0.2em] uppercase text-zinc-500 mb-1">
					Editing post
				</p>
				<h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">
					Update your post
				</h1>
			</div>

			<div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 sm:p-8">
				<PostForm
					key={id}
					initialData={{
						postId: id,
						title: post.title,
						content: post.content,
					}}
				/>
			</div>
		</div>
	);
}
