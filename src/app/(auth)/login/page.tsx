"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function LoginPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const justRegistered = searchParams.get("registered") === "1";

	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError(null);

		const fd = new FormData(e.currentTarget);
		const email = fd.get("email") as string;
		const password = fd.get("password") as string;

		startTransition(async () => {
			const result = await signIn("credentials", {
				email,
				password,
				redirect: false, // we handle navigation ourselves
			});

			if (result?.error) {
				setError("Invalid email or password.");
			} else {
				router.push("/");
				router.refresh(); // flush the server-side session cache
			}
		});
	}

	return (
		<main className="min-h-screen bg-[#0d0d0d] flex items-center justify-center px-4">
			<div className="w-full max-w-md">
				{/* Wordmark */}
				<div className="mb-8 text-center">
					<span className="inline-block text-xs font-mono tracking-[0.3em] uppercase text-zinc-500 mb-3">
						RBAC Platform
					</span>
					<h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">
						Welcome back
					</h1>
				</div>

				{/* Card */}
				<div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-2xl">
					{/* Just-registered success banner */}
					{justRegistered && (
						<div className="mb-5 px-4 py-3 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-sm">
							Account created — sign in to continue.
						</div>
					)}

					{/* Error banner */}
					{error && (
						<div className="mb-5 px-4 py-3 rounded-lg bg-red-950/60 border border-red-800/60 text-red-300 text-sm">
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-5">
						{/* Email */}
						<div className="flex flex-col gap-1.5">
							<label
								htmlFor="email"
								className="text-xs font-medium text-zinc-400 uppercase tracking-wider"
							>
								Email
							</label>
							<input
								id="email"
								name="email"
								type="email"
								placeholder="you@example.com"
								autoComplete="email"
								required
								className="w-full rounded-lg bg-zinc-800 border border-zinc-700 hover:border-zinc-600 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
							/>
						</div>

						{/* Password */}
						<div className="flex flex-col gap-1.5">
							<label
								htmlFor="password"
								className="text-xs font-medium text-zinc-400 uppercase tracking-wider"
							>
								Password
							</label>
							<input
								id="password"
								name="password"
								type="password"
								placeholder="Your password"
								autoComplete="current-password"
								required
								className="w-full rounded-lg bg-zinc-800 border border-zinc-700 hover:border-zinc-600 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
							/>
						</div>

						<button
							type="submit"
							disabled={isPending}
							className="w-full mt-1 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium tracking-wide transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400"
						>
							{isPending ? "Signing in…" : "Sign in"}
						</button>
					</form>
				</div>

				{/* Footer link */}
				<p className="mt-5 text-center text-sm text-zinc-500">
					Don&apos;t have an account?{" "}
					<Link
						href="/register"
						className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 transition-colors"
					>
						Create one
					</Link>
				</p>
			</div>
		</main>
	);
}
