import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { signOut } from "@/lib/auth/auth";
import type { Role } from "@/types";

// ─── Role badge colours ───────────────────────────────────────────────────────

const ROLE_STYLES: Record<Exclude<Role, "guest">, string> = {
	super_admin: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
	moderator: "bg-violet-500/15 text-violet-400 border border-violet-500/30",
	regular_user: "bg-zinc-700/60 text-zinc-400 border border-zinc-600/40",
};

const ROLE_LABELS: Record<Exclude<Role, "guest">, string> = {
	super_admin: "super admin",
	moderator: "moderator",
	regular_user: "user",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default async function Navbar() {
	const session = await auth();
	const user = session?.user;
	const role = user?.role as Exclude<Role, "guest"> | undefined;

	return (
		<header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm">
			<nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
				{/* ── Brand ── */}
				<Link
					href="/"
					className="text-sm font-semibold tracking-tight text-zinc-100 hover:text-white transition-colors"
				>
					RBAC<span className="text-indigo-400">.</span>app
				</Link>

				{/* ── Right side ── */}
				<div className="flex items-center gap-2 sm:gap-3">
					{user ? (
						<>
							{/* Role-gated panel links */}
							{(role === "super_admin" ||
								role === "moderator") && (
								<Link
									href="/moderator"
									className="hidden sm:inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium text-violet-300 hover:bg-violet-500/10 transition-colors"
								>
									Mod Panel
								</Link>
							)}
							{role === "super_admin" && (
								<Link
									href="/admin"
									className="hidden sm:inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-500/10 transition-colors"
								>
									Admin Panel
								</Link>
							)}

							{/* Username + role badge */}
							<div className="flex items-center gap-2">
								<span className="hidden sm:block text-sm text-zinc-300 max-w-[120px] truncate">
									{user.name}
								</span>
								{role && (
									<span
										className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium leading-none ${ROLE_STYLES[role]}`}
									>
										{ROLE_LABELS[role]}
									</span>
								)}
							</div>

							{/* Sign out — Server Action inline */}
							<form
								action={async () => {
									"use server";
									await signOut({ redirectTo: "/" });
								}}
							>
								<button
									type="submit"
									className="rounded-md px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
								>
									Logout
								</button>
							</form>
						</>
					) : (
						<>
							<Link
								href="/login"
								className="rounded-md px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
							>
								Login
							</Link>
							<Link
								href="/register"
								className="rounded-md px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
							>
								Register
							</Link>
						</>
					)}
				</div>
			</nav>
		</header>
	);
}
