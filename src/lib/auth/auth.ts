import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import User from "@/lib/db/models/User";
import { LoginSchema } from "@/lib/validations/auth.schema";
import { authConfig } from "@/lib/auth/auth.config";
import type { Role } from "@/types";
import { connectDB } from "../db/connection";

/**
 * Full auth instance — runs in Node.js runtime only.
 * Extends the Edge-safe authConfig with the Credentials provider
 * (which needs mongoose + bcryptjs).
 *
 * Import { auth, handlers, signIn, signOut } from here everywhere EXCEPT
 * middleware.ts, which must import from auth.config.ts.
 */
export const { auth, handlers, signIn, signOut } = NextAuth({
	...authConfig,
	providers: [
		Credentials({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				const parsed = LoginSchema.safeParse(credentials);
				if (!parsed.success) return null;

				const { email, password } = parsed.data;

				await connectDB();
				const user = await User.findOne({ email })
					.select("+password")
					.lean();

				if (!user || !user.password) return null;

				const isValid = await bcrypt.compare(password, user.password);
				if (!isValid) return null;

				return {
					id: user._id.toString(),
					name: user.name,
					email: user.email,
					role: user.role as Role,
				};
			},
		}),
	],
});
