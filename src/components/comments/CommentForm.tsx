// src/components/comments/CommentForm.tsx
"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createComment } from "@/lib/actions/comment.actions";
import toast from "react-hot-toast";

interface Props {
	postId: string;
}

interface ActionResult {
	success: boolean;
	error?: string;
}

const initialState: ActionResult = { success: false };
const MAX_CHARS = 1000;

export default function CommentForm({ postId }: Props) {
	// Bind postId into the action so useActionState gets the right signature:
	// createComment(postId, _prevState, formData)
	const boundAction = createComment.bind(null, postId);
	const [state, action, isPending] = useActionState(
		boundAction,
		initialState,
	);

	const [charCount, setCharCount] = useState(0);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const formRef = useRef<HTMLFormElement>(null);

	// Handle success / error feedback
	useEffect(() => {
		if (state.success) {
			toast.success("Comment posted!");
			formRef.current?.reset();
			setCharCount(0);
		}
		if (state.error) {
			toast.error(state.error);
		}
	}, [state]);

	const remaining = MAX_CHARS - charCount;
	const isNearLimit = remaining <= 100;
	const isOverLimit = remaining < 0;

	return (
		<form ref={formRef} action={action} className="space-y-3">
			<div className="relative">
				<textarea
					ref={textareaRef}
					name="content"
					placeholder="Write a comment…"
					rows={3}
					maxLength={MAX_CHARS}
					disabled={isPending}
					onChange={(e) => setCharCount(e.target.value.length)}
					className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-zinc-600 disabled:opacity-50 resize-none transition-colors"
				/>
				{/* Character counter */}
				<span
					className={`absolute bottom-3 right-3 text-xs tabular-nums transition-colors ${
						isOverLimit
							? "text-red-400"
							: isNearLimit
								? "text-amber-400"
								: "text-zinc-600"
					}`}
				>
					{remaining}
				</span>
			</div>

			<div className="flex justify-end">
				<button
					type="submit"
					disabled={isPending || isOverLimit || charCount === 0}
					className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400"
				>
					{isPending ? "Posting…" : "Post comment"}
				</button>
			</div>
		</form>
	);
}
