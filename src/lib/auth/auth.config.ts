import type { NextAuthConfig } from "next-auth";
import type { Role } from "@/types";

/**
 * Edge-safe auth config — NO Node.js-only imports (mongoose, bcryptjs, etc.).
 * Used by middleware.ts which runs on the Edge runtime.
 *
 * The Credentials provider's `authorize` function lives in auth.ts instead,
 * which runs only in the Node.js runtime (API routes, Server Actions).
 */
export const authConfig: NextAuthConfig = {
	providers: [], // Credentials provider is added in auth.ts

	session: { strategy: "jwt" },

	pages: {
		signIn: "/login",
	},

	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id as string;
				token.role = (user as { role: Role }).role;
			}
			return token;
		},

		async session({ session, token }) {
			if (token && session.user) {
				session.user.id = token.id as string;
				session.user.role = token.role as Role;
			}
			return session;
		},
	},
};
