// src/components/admin/UserRoleChanger.tsx
"use client";

import { useTransition } from "react";
import { changeUserRole } from "@/lib/actions/admin.actions";
import toast from "react-hot-toast";

interface Props {
	userId: string;
	currentRole: string;
	isSuperAdmin: boolean; // true = this row is a super_admin, lock it
}

export default function UserRoleChanger({
	userId,
	currentRole,
	isSuperAdmin,
}: Props) {
	const [isPending, startTransition] = useTransition();

	if (isSuperAdmin) {
		return (
			<span className="inline-flex items-center px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium cursor-not-allowed">
				Super Admin — protected
			</span>
		);
	}

	function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
		const newRole = e.target.value as "moderator" | "regular_user";
		if (newRole === currentRole) return;

		startTransition(async () => {
			const result = await changeUserRole(userId, newRole);
			if (result.success) {
				toast.success(`Role updated to ${newRole.replace("_", " ")}.`);
			} else {
				toast.error(result.error ?? "Failed to update role.");
				// Reset select to current role visually by forcing re-render
				e.target.value = currentRole;
			}
		});
	}

	return (
		<select
			defaultValue={currentRole}
			onChange={handleChange}
			disabled={isPending}
			className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:border-zinc-600 cursor-pointer"
		>
			<option value="regular_user">User</option>
			<option value="moderator">Moderator</option>
		</select>
	);
}
