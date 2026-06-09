import { z } from "zod";

export const PostSchema = z.object({
	title: z
		.string()
		.min(3, "Title must be at least 3 characters")
		.max(200, "Title cannot exceed 200 characters"),
	content: z
		.string()
		.min(10, "Content must be at least 10 characters")
		.max(5000, "Content cannot exceed 5000 characters"),
});

export type PostInput = z.infer<typeof PostSchema>;
