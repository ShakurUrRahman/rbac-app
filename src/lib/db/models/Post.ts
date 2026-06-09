/**
 * src/lib/db/models/Post.ts
 *
 * author field union: IUser | string
 * ──────────────────────────────────
 *   string  → raw ObjectId (query without .populate("author"))
 *   IUser   → fully hydrated author document (query with .populate("author"))
 *
 * At the call site, narrow with:
 *   typeof post.author === "string"
 *     ? post.author          // ObjectId string
 *     : post.author.name     // populated IUser
 */

import mongoose, { Document, Model, Schema, Types } from "mongoose";
import type { IUser } from "./User";

// ─────────────────────────────────────────────────────────────────────────────
// Public serialisable interface
// ─────────────────────────────────────────────────────────────────────────────

export interface IPost {
	/** MongoDB ObjectId serialised to string */
	_id: string;
	title: string;
	content: string;
	/**
	 * `string`  — when the query does NOT populate the author field (raw ObjectId).
	 * `IUser`   — when the query uses .populate("author").
	 */
	author: IUser | string;
	createdAt: Date;
	updatedAt: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal Mongoose document type
// ─────────────────────────────────────────────────────────────────────────────

/**
 * author is always an ObjectId at the DB layer.
 * Mongoose replaces it with the referenced document only after .populate().
 */
interface IPostDoc extends Omit<IPost, "_id" | "author">, Document {
	_id: Types.ObjectId;
	author: Types.ObjectId;
}

// ─────────────────────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────────────────────

const PostSchema = new Schema<IPostDoc>(
	{
		title: {
			type: String,
			required: [true, "Title is required"],
			maxlength: [200, "Title cannot exceed 200 characters"],
			trim: true,
		},

		content: {
			type: String,
			required: [true, "Content is required"],
			maxlength: [5000, "Content cannot exceed 5000 characters"],
		},

		author: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Author is required"],
		},
	},
	{
		timestamps: true,
	},
);

// ─────────────────────────────────────────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────────────────────────────────────────

// Most common query pattern: posts by a specific user, newest first.
PostSchema.index({ author: 1, createdAt: -1 });

// Feed query: all posts sorted by newest.
PostSchema.index({ createdAt: -1 });

// ─────────────────────────────────────────────────────────────────────────────
// Model (safe against Next.js hot-reload recompilation)
// ─────────────────────────────────────────────────────────────────────────────

const Post: Model<IPostDoc> =
	(mongoose.models.Post as Model<IPostDoc>) ??
	mongoose.model<IPostDoc>("Post", PostSchema);

export default Post;
