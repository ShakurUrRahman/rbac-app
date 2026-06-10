import Post from "@/lib/db/models/Post";
import type { IPost } from "@/lib/db/models/Post";
import type { IUser } from "@/lib/db/models/User";
import { connectDB } from "../db/connection";

// ─── Shared normaliser ────────────────────────────────────────────────────────

/**
 * Converts raw Mongoose lean output into a fully serialisable IPost.
 * Ensures _id and author._id are plain strings, safe for Server Components
 * and client props (no ObjectId instances crossing the boundary).
 */
function normalisePost(raw: Record<string, unknown>): IPost {
	const author = raw.author as Record<string, unknown>;
	return {
		...(raw as unknown as IPost),
		_id: String(raw._id),
		createdAt: raw.createdAt as Date,
		updatedAt: raw.updatedAt as Date,
		author:
			typeof author === "object" && author !== null
				? { ...(author as IUser), _id: String(author._id) }
				: String(raw.author),
	};
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export interface GetPostsOptions {
	/** Page number, 1-indexed. Defaults to 1. */
	page?: number;
	/** Posts per page. Defaults to 10. */
	limit?: number;
}

export interface PaginatedPosts {
	posts: IPost[];
	total: number;
	page: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPrevPage: boolean;
}

/**
 * Fetch a paginated list of posts, newest first, with author populated.
 * Safe to call directly from Server Components — returns plain objects only.
 */
export async function getPosts(
	options: GetPostsOptions = {},
): Promise<PaginatedPosts> {
	const page = Math.max(1, options.page ?? 1);
	const limit = Math.min(50, Math.max(1, options.limit ?? 10)); // clamp 1–50
	const skip = (page - 1) * limit;

	await connectDB();

	const [rawPosts, total] = await Promise.all([
		Post.find()
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.populate<{ author: IUser }>("author", "name email role")
			.lean(),
		Post.countDocuments(),
	]);

	const posts = rawPosts.map((p) =>
		normalisePost(p as unknown as Record<string, unknown>),
	);

	const totalPages = Math.ceil(total / limit);

	return {
		posts,
		total,
		page,
		totalPages,
		hasNextPage: page < totalPages,
		hasPrevPage: page > 1,
	};
}

/**
 * Fetch a single post by id with author populated.
 * Returns null if not found or if the id is not a valid ObjectId.
 */
export async function getPostById(id: string): Promise<IPost | null> {
	await connectDB();

	try {
		const raw = await Post.findById(id)
			.populate<{ author: IUser }>("author", "name email role")
			.lean();

		if (!raw) return null;

		return normalisePost(raw as unknown as Record<string, unknown>);
	} catch {
		// findById throws on a malformed id — treat as 404
		return null;
	}
}
