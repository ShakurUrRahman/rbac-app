// src/components/ui/ConfirmDialog.tsx
"use client";

import { useEffect } from "react";

interface Props {
	isOpen: boolean;
	message?: string;
	confirmLabel?: string;
	onConfirm: () => void;
	onCancel: () => void;
}

export default function ConfirmDialog({
	isOpen,
	message = "Are you sure you want to delete this? This action cannot be undone.",
	confirmLabel = "Delete",
	onConfirm,
	onCancel,
}: Props) {
	// Close on Escape key
	useEffect(() => {
		if (!isOpen) return;
		function handleKey(e: KeyboardEvent) {
			if (e.key === "Escape") onCancel();
		}
		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [isOpen, onCancel]);

	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4"
			aria-modal="true"
			role="dialog"
		>
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/60 backdrop-blur-sm"
				onClick={onCancel}
			/>

			{/* Dialog */}
			<div className="relative z-10 w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl">
				{/* Icon */}
				<div className="w-11 h-11 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
					<svg
						className="w-5 h-5 text-red-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={2}
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
						/>
					</svg>
				</div>

				<h3 className="text-base font-semibold text-zinc-100 text-center mb-2">
					Confirm deletion
				</h3>
				<p className="text-sm text-zinc-400 text-center mb-6 leading-relaxed">
					{message}
				</p>

				<div className="flex gap-3">
					<button
						onClick={onCancel}
						className="flex-1 px-4 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-sm font-medium transition-colors"
					>
						Cancel
					</button>
					<button
						onClick={onConfirm}
						className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors"
					>
						{confirmLabel}
					</button>
				</div>
			</div>
		</div>
	);
}
