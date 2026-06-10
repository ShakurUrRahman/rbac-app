// src/components/ui/ConfirmDialog.tsx
"use client";

import { useEffect } from "react";

interface Props {
	isOpen: boolean;
	message?: string;
	confirmLabel?: string;
	onConfirm: () => void;
	onCancel: () => void;
	isLoading?: boolean; // ← NEW: show spinner during async operations
	isDangerous?: boolean; // ← NEW: true = red icon + button (default), false = blue icon + button
}

export default function ConfirmDialog({
	isOpen,
	message = "Are you sure you want to delete this? This action cannot be undone.",
	confirmLabel = "Delete",
	onConfirm,
	onCancel,
	isLoading = false,
	isDangerous = true,
}: Props) {
	// Close on Escape key
	useEffect(() => {
		if (!isOpen) return;
		function handleKey(e: KeyboardEvent) {
			if (e.key === "Escape" && !isLoading) onCancel();
		}
		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [isOpen, onCancel, isLoading]);

	if (!isOpen) return null;

	const iconColor = isDangerous ? "text-red-400" : "text-blue-400";
	const iconBg = isDangerous
		? "bg-red-500/10 border-red-500/20"
		: "bg-blue-500/10 border-blue-500/20";
	const buttonColor = isDangerous
		? "bg-red-600 hover:bg-red-500"
		: "bg-blue-600 hover:bg-blue-500";

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4"
			aria-modal="true"
			role="alertdialog"
			aria-labelledby="dialog-title"
			aria-describedby="dialog-message"
		>
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/60 backdrop-blur-sm"
				onClick={() => !isLoading && onCancel()}
			/>

			{/* Dialog */}
			<div className="relative z-10 w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl">
				{/* Icon */}
				<div
					className={`w-11 h-11 rounded-full ${iconBg} border flex items-center justify-center mx-auto mb-4`}
				>
					{isDangerous ? (
						<svg
							className={`w-5 h-5 ${iconColor}`}
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
					) : (
						<svg
							className={`w-5 h-5 ${iconColor}`}
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2}
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					)}
				</div>

				<h3
					id="dialog-title"
					className="text-base font-semibold text-zinc-100 text-center mb-2"
				>
					{isDangerous ? "Confirm deletion" : "Confirm action"}
				</h3>
				<p
					id="dialog-message"
					className="text-sm text-zinc-400 text-center mb-6 leading-relaxed"
				>
					{message}
				</p>

				<div className="flex gap-3">
					<button
						onClick={onCancel}
						disabled={isLoading}
						className="flex-1 px-4 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Cancel
					</button>
					<button
						onClick={onConfirm}
						disabled={isLoading}
						className={`flex-1 px-4 py-2.5 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${buttonColor}`}
					>
						{isLoading && (
							<svg
								className="w-4 h-4 animate-spin"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth={2}
							>
								<circle cx="12" cy="12" r="1" />
								<path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
							</svg>
						)}
						{confirmLabel}
					</button>
				</div>
			</div>
		</div>
	);
}
