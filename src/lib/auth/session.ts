import { SessionUser } from "@/types";
import { auth } from "./auth";

export async function getSession(): Promise<SessionUser | null> {
	const session = await auth();
	if (!session) return null;

	return {
		id: session.user.id as string,
		name: session.user.name as string,
		email: session.user.email as string,
		role: session.user.role as SessionUser["role"],
	};
}
