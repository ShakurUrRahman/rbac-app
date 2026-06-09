import { z } from "zod";

export const RegisterSchema = z
	.object({
		name: z
			.string()
			.min(2, "Name must be at least 2 characters")
			.max(60, "Name cannot exceed 60 characters")
			.trim(),
		email: z
			.string()
			.email("Enter a valid email address")
			.toLowerCase()
			.trim(),
		password: z
			.string()
			.min(6, "Password must be at least 6 characters")
			.max(100, "Password cannot exceed 100 characters"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"], // error lands on confirmPassword field
	});

export const LoginSchema = z.object({
	email: z.string().email("Enter a valid email address").toLowerCase().trim(),
	password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
