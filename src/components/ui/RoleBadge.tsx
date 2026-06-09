// src/components/ui/RoleBadge.tsx

type Role = "super_admin" | "moderator" | "regular_user" | "guest";

interface Props {
	role: Role | string;
}

const config: Record<string, { label: string; className: string }> = {
	super_admin: {
		label: "Super Admin",
		className: "bg-rose-500/15 text-rose-400 border-rose-500/20",
	},
	moderator: {
		label: "Moderator",
		className: "bg-violet-500/15 text-violet-400 border-violet-500/20",
	},
	regular_user: {
		label: "User",
		className: "bg-blue-500/15 text-blue-400 border-blue-500/20",
	},
	guest: {
		label: "Guest",
		className: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
	},
};

export default function RoleBadge({ role }: Props) {
	const { label, className } = config[role] ?? config.guest;

	return (
		<span
			className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium border ${className}`}
		>
			{label}
		</span>
	);
}
