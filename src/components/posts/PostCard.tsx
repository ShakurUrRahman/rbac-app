import Link from "next/link";
import type { IUser } from "@/lib/db/models/User";

interface PostCardProps {
	id: string;
	title: string;
	content: string;
	/** When populated, author is IUser; when not, it's a string ObjectId */
	author: Pick<IUser, "_id" | "name" | "role">;
	createdAt: string;
}

function getRoleBadgeColor(role: string): string {
	switch (role) {
		case "super_admin":
			return "bg-red-900/30 text-red-300 border-red-800/50";
		case "moderator":
			return "bg-amber-900/30 text-amber-300 border-amber-800/50";
		case "regular_user":
			return "bg-blue-900/30 text-blue-300 border-blue-800/50";
		default:
			return "bg-zinc-700/30 text-zinc-300 border-zinc-700/50";
	}
}

function formatDate(dateString: string): string {
	const date = new Date(dateString);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMins = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMs / 3600000);
	const diffDays = Math.floor(diffMs / 86400000);

	if (diffMins < 1) return "just now";
	if (diffMins < 60) return `${diffMins}m ago`;
	if (diffHours < 24) return `${diffHours}h ago`;
	if (diffDays < 7) return `${diffDays}d ago`;

	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
	});
}

function truncateContent(content: string, maxLength: number = 150): string {
	if (content.length <= maxLength) return content;
	return content.substring(0, maxLength).trim() + "…";
}

export default function PostCard({
	id,
	title,
	content,
	author,
	createdAt,
}: PostCardProps) {
	return (
		<article className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors">
			{/* Header */}
			<div className="flex items-start justify-between gap-4 mb-3">
				<div className="flex-1 min-w-0">
					<h2 className="text-lg font-semibold text-zinc-100 truncate hover:text-indigo-400 transition-colors">
						<Link href={`/posts/${id}`}>{title}</Link>
					</h2>
				</div>
			</div>

			{/* Author & Meta */}
			<div className="flex items-center gap-3 mb-4 text-sm">
				<div className="flex items-center gap-2">
					<span className="text-zinc-400">{author.name}</span>
					<span
						className={`px-2 py-1 text-xs font-medium rounded border ${getRoleBadgeColor(author.role)}`}
					>
						{author.role.replace(/_/g, " ")}
					</span>
				</div>
				<span className="text-zinc-500">·</span>
				<time className="text-zinc-500">{formatDate(createdAt)}</time>
			</div>

			{/* Content Preview */}
			<p className="text-zinc-300 text-sm leading-relaxed mb-4">
				{truncateContent(content)}
			</p>

			{/* Read More Link */}
			<Link
				href={`/posts/${id}`}
				className="inline-flex items-center text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
			>
				Read more →
			</Link>
		</article>
	);
}
