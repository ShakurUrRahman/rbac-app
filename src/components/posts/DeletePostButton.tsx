"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePost } from "@/lib/actions/post.actions";

interface DeletePostButtonProps {
	postId: string;
}

export default function DeletePostButton({ postId }: DeletePostButtonProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [showConfirm, setShowConfirm] = useState(false);
	const [error, setError] = useState<string | null>(null);

	function handleDeleteClick() {
		setError(null);
		setShowConfirm(true);
	}

	function handleCancel() {
		setShowConfirm(false);
	}

	function handleConfirm() {
		startTransition(async () => {
			const result = await deletePost(postId);
			if (result.success) {
				router.push("/posts");
			} else {
				setShowConfirm(false);
				setError(result.error ?? "Failed to delete post.");
			}
		});
	}

	return (
		<>
			{/* Trigger button */}
			<button
				onClick={handleDeleteClick}
				disabled={isPending}
				className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-800/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{isPending ? (
					<>
						<Spinner />
						Deleting…
					</>
				) : (
					"Delete"
				)}
			</button>

			{/* Inline error */}
			{error && <p className="mt-1 text-xs text-red-400">{error}</p>}

			{/* Confirm dialog overlay */}
			{showConfirm && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
					onClick={handleCancel}
				>
					<div
						className="w-full max-w-sm rounded-xl bg-zinc-900 border border-zinc-700 p-6 shadow-2xl"
						onClick={(e) => e.stopPropagation()}
					>
						<h2 className="text-base font-semibold text-zinc-100 mb-1">
							Delete post?
						</h2>
						<p className="text-sm text-zinc-400 mb-6">
							This will permanently delete the post and all its
							comments. This action cannot be undone.
						</p>

						<div className="flex justify-end gap-3">
							<button
								onClick={handleCancel}
								disabled={isPending}
								className="rounded-md px-4 py-2 text-sm font-medium text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors disabled:opacity-50"
							>
								Cancel
							</button>
							<button
								onClick={handleConfirm}
								disabled={isPending}
								className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isPending ? (
									<>
										<Spinner />
										Deleting…
									</>
								) : (
									"Yes, delete"
								)}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

function Spinner() {
	return (
		<svg
			className="h-3.5 w-3.5 animate-spin"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
		>
			<circle
				className="opacity-25"
				cx="12"
				cy="12"
				r="10"
				stroke="currentColor"
				strokeWidth="4"
			/>
			<path
				className="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
			/>
		</svg>
	);
}
