"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createPost, updatePost } from "@/lib/actions/post.actions"; // Assuming you have or will add updatePost

interface FormState {
	success: boolean;
	error?: string;
	postId?: string;
}

// 1. Define the structural shape for editing mode
interface PostFormProps {
	initialData?: {
		postId: string;
		title: string;
		content: string;
	};
}

const initialState: FormState = { success: false, error: undefined };

export default function PostForm({ initialData }: PostFormProps) {
	const router = useRouter();
	const isEditing = !!initialData;

	// 2. Decide dynamically which Server Action handler to fire on submit
	const formActionHandler = isEditing ? updatePost : createPost;
	const [state, action, isPending] = useActionState(
		formActionHandler,
		initialState,
	);

	const [showSuccessToast, setShowSuccessToast] = useState(false);

	// Redirect to post page on success
	useEffect(() => {
		if (state.success && state.postId) {
			setShowSuccessToast(true);
			const timer = setTimeout(() => {
				router.push(`/posts/${state.postId}`);
			}, 1000);
			return () => clearTimeout(timer);
		}
	}, [state.success, state.postId, router]);

	return (
		<>
			{/* Error Banner */}
			{state.error && (
				<div className="mb-6 px-4 py-3 rounded-lg bg-red-950/60 border border-red-800/60 text-red-300 text-sm">
					{state.error}
				</div>
			)}

			{/* Success Toast */}
			{showSuccessToast && (
				<div className="fixed bottom-4 right-4 px-4 py-3 rounded-lg bg-green-950/90 border border-green-800/60 text-green-300 text-sm backdrop-blur-sm z-50">
					✓ Post {isEditing ? "updated" : "created"} successfully.
					Redirecting…
				</div>
			)}

			<form action={action} className="space-y-6">
				{/* 3. Hidden input sends the database post ID along with the submission payload safely */}
				{isEditing && (
					<input
						type="hidden"
						name="postId"
						value={initialData.postId}
					/>
				)}

				{/* Title Field */}
				<div className="flex flex-col gap-2">
					<label
						htmlFor="title"
						className="text-sm font-medium text-zinc-400 uppercase tracking-wider"
					>
						Title
					</label>
					<input
						id="title"
						name="title"
						type="text"
						placeholder="What's on your mind?"
						maxLength={200}
						required
						defaultValue={initialData?.title || ""} // 4. Use defaultValue to preload text securely
						className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-3 text-zinc-100 placeholder-zinc-600 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors hover:border-zinc-600 disabled:opacity-50"
						disabled={isPending}
					/>
					<p className="text-xs text-zinc-500">
						Min 3, max 200 characters
					</p>
				</div>

				{/* Content Field */}
				<div className="flex flex-col gap-2">
					<label
						htmlFor="content"
						className="text-sm font-medium text-zinc-400 uppercase tracking-wider"
					>
						Content
					</label>
					<textarea
						id="content"
						name="content"
						placeholder="Share your thoughts, ideas, and experiences…"
						maxLength={5000}
						required
						rows={10}
						defaultValue={initialData?.content || ""} // 4. Use defaultValue here too
						className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-3 text-zinc-100 placeholder-zinc-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors hover:border-zinc-600 disabled:opacity-50 resize-none font-mono"
						disabled={isPending}
					/>
					<p className="text-xs text-zinc-500">
						Min 10, max 5000 characters
					</p>
				</div>

				{/* Submit Button */}
				<div className="flex gap-3 pt-4">
					<button
						type="submit"
						disabled={isPending}
						className="flex-1 py-3 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium tracking-wide transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400"
					>
						{isPending
							? isEditing
								? "Saving changes…"
								: "Publishing…"
							: isEditing
								? "Save Changes"
								: "Publish Post"}
					</button>

					<button
						type="button" // Set type="button" for edit route so it can cancel/go back cleanly
						onClick={() =>
							isEditing ? router.back() : router.push("/posts")
						}
						disabled={isPending}
						className="py-3 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-300 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-zinc-500"
					>
						Cancel
					</button>
				</div>
			</form>
		</>
	);
}
