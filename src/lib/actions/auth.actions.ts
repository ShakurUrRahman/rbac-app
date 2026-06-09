"use server";
import bcrypt from "bcryptjs";
import User from "@/lib/db/models/User";
import { RegisterSchema } from "@/lib/validations/auth.schema";
import { connectDB } from "../db/connection";

interface ActionResult {
	success: boolean;
	error?: string;
	fieldErrors?: Partial<Record<string, string>>;
}

export async function registerUser(
	_prevState: ActionResult,
	formData: FormData,
): Promise<ActionResult> {
	// 1. Parse raw FormData into a plain object for Zod
	const raw = {
		name: formData.get("name"),
		email: formData.get("email"),
		password: formData.get("password"),
		confirmPassword: formData.get("confirmPassword"),
	};

	// 2. Validate
	const parsed = RegisterSchema.safeParse(raw);
	if (!parsed.success) {
		const fieldErrors: Partial<Record<string, string>> = {};
		for (const [field, messages] of Object.entries(
			parsed.error.flatten().fieldErrors,
		)) {
			fieldErrors[field] = messages?.[0];
		}
		return {
			success: false,
			error: "Please fix the errors below.",
			fieldErrors,
		};
	}

	const { name, email, password } = parsed.data;

	try {
		await connectDB();

		// 3. Unique email guard
		const existing = await User.findOne({ email }).lean();
		if (existing) {
			return {
				success: false,
				error: "An account with that email already exists.",
				fieldErrors: { email: "Email already in use." },
			};
		}

		// 4. Hash — cost factor 12 is solid
		const hashed = await bcrypt.hash(password, 12);

		// 5. Persist
		await User.create({ name, email, password: hashed });

		return { success: true };
	} catch (err) {
		console.error("[registerUser]", err);
		return {
			success: false,
			error: "Something went wrong. Please try again.",
		};
	}
}
