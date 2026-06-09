"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/lib/actions/auth.actions";

// ── useActionState requires an initial state that matches the return type ──
const initialState = { success: false, error: undefined, fieldErrors: {} };

export default function RegisterPage() {
	const router = useRouter();
	const [state, action, isPending] = useActionState(
		registerUser,
		initialState,
	);

	// Redirect to login on success
	useEffect(() => {
		if (state.success) {
			router.push("/login?registered=1");
		}
	}, [state.success, router]);

	return (
		<main className="min-h-screen bg-[#0d0d0d] flex items-center justify-center px-4">
			<div className="w-full max-w-md">
				{/* Wordmark */}
				<div className="mb-8 text-center">
					<span className="inline-block text-xs font-mono tracking-[0.3em] uppercase text-zinc-500 mb-3">
						RBAC Platform
					</span>
					<h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">
						Create an account
					</h1>
				</div>

				{/* Card */}
				<div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-2xl">
					{/* Global error banner */}
					{state.error && !state.success && (
						<div className="mb-5 px-4 py-3 rounded-lg bg-red-950/60 border border-red-800/60 text-red-300 text-sm">
							{state.error}
						</div>
					)}

					<form action={action} className="space-y-5">
						{/* Name */}
						<Field
							label="Full name"
							name="name"
							type="text"
							placeholder="Jordan Lee"
							autoComplete="name"
							error={state.fieldErrors?.name}
						/>

						{/* Email */}
						<Field
							label="Email"
							name="email"
							type="email"
							placeholder="you@example.com"
							autoComplete="email"
							error={state.fieldErrors?.email}
						/>

						{/* Password */}
						<Field
							label="Password"
							name="password"
							type="password"
							placeholder="Min. 6 characters"
							autoComplete="new-password"
							error={state.fieldErrors?.password}
						/>

						{/* Confirm password */}
						<Field
							label="Confirm password"
							name="confirmPassword"
							type="password"
							placeholder="Repeat your password"
							autoComplete="new-password"
							error={state.fieldErrors?.confirmPassword}
						/>

						<button
							type="submit"
							disabled={isPending}
							className="w-full mt-1 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium tracking-wide transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400"
						>
							{isPending ? "Creating account…" : "Create account"}
						</button>
					</form>
				</div>

				{/* Footer link */}
				<p className="mt-5 text-center text-sm text-zinc-500">
					Already have an account?{" "}
					<Link
						href="/login"
						className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 transition-colors"
					>
						Sign in
					</Link>
				</p>
			</div>
		</main>
	);
}

// ── Reusable field component (file-local) ─────────────────────────────────────
interface FieldProps {
	label: string;
	name: string;
	type: string;
	placeholder?: string;
	autoComplete?: string;
	error?: string;
}

function Field({
	label,
	name,
	type,
	placeholder,
	autoComplete,
	error,
}: FieldProps) {
	return (
		<div className="flex flex-col gap-1.5">
			<label
				htmlFor={name}
				className="text-xs font-medium text-zinc-400 uppercase tracking-wider"
			>
				{label}
			</label>
			<input
				id={name}
				name={name}
				type={type}
				placeholder={placeholder}
				autoComplete={autoComplete}
				className={[
					"w-full rounded-lg bg-zinc-800 border px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600",
					"focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
					"transition-colors",
					error
						? "border-red-700 focus:ring-red-600"
						: "border-zinc-700 hover:border-zinc-600",
				].join(" ")}
			/>
			{error && <p className="text-xs text-red-400 mt-0.5">{error}</p>}
		</div>
	);
}
