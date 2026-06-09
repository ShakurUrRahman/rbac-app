// src/app/page.tsx

import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import RoleBadge from "@/components/ui/RoleBadge";

export default async function HomePage() {
	const session = await getSession();

	return (
		<main className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center px-4">
			{/* Subtle grid background */}
			<div
				className="fixed inset-0 pointer-events-none opacity-[0.03]"
				style={{
					backgroundImage:
						"linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
					backgroundSize: "48px 48px",
				}}
			/>

			<div className="relative z-10 w-full max-w-xl text-center space-y-8">
				{/* Badge */}
				<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs font-medium">
					<span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
					Role-based access control demo
				</div>

				{/* Heading */}
				<div className="space-y-4">
					<h1 className="text-5xl font-bold text-zinc-100 tracking-tight leading-tight">
						RBAC
						<span className="text-indigo-400">.</span>app
					</h1>
					<p className="text-zinc-400 text-lg leading-relaxed max-w-sm mx-auto">
						A full-stack permission system with four roles, posts,
						and threaded comments.
					</p>
				</div>

				{/* Logged-in state */}
				{session ? (
					<div className="space-y-4">
						<div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800">
							<div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
								<span className="text-indigo-300 text-xs font-semibold">
									{session.name?.charAt(0).toUpperCase() ??
										"?"}
								</span>
							</div>
							<span className="text-sm text-zinc-300 font-medium">
								{session.name}
							</span>
							<RoleBadge role={session.role} />
						</div>

						<div className="flex justify-center">
							<Link
								href="/posts"
								className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
							>
								Go to Posts
								<svg
									className="w-4 h-4"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									strokeWidth={2}
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
									/>
								</svg>
							</Link>
						</div>
					</div>
				) : (
					/* Guest state */
					<div className="flex flex-col sm:flex-row items-center justify-center gap-3">
						<Link
							href="/posts"
							className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-sm font-medium transition-colors"
						>
							Browse Posts
						</Link>
						<Link
							href="/register"
							className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
						>
							Get Started
							<svg
								className="w-4 h-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={2}
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
								/>
							</svg>
						</Link>
					</div>
				)}

				{/* Role overview */}
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4">
					{[
						{ role: "super_admin", desc: "Full access" },
						{ role: "moderator", desc: "Moderate content" },
						{ role: "regular_user", desc: "Post & comment" },
						{ role: "guest", desc: "Read only" },
					].map(({ role, desc }) => (
						<div
							key={role}
							className="flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl bg-zinc-900 border border-zinc-800"
						>
							<RoleBadge role={role} />
							<span className="text-xs text-zinc-600">
								{desc}
							</span>
						</div>
					))}
				</div>
			</div>
		</main>
	);
}
