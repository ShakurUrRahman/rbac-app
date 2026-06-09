/**
 * src/lib/db/models/Comment.ts
 *
 * author field union: IUser | string
 * post   field union: IPost | string
 * ─────────────────────────────────────
 * Both fields are stored as ObjectIds in MongoDB.
 * The union types reflect that either field may be populated in a query.
 *
 * Common query patterns:
 *
 *   // Comments for a post — only author populated
 *   Comment.find({ post: postId }).populate("author")
 *   → post is string, author is IUser
 *
 *   // Full hydration (rare — e.g. admin tooling)
 *   Comment.find({}).populate("author").populate("post")
 *   → both are their respective interfaces
 */

import mongoose, { Document, Model, Schema, Types } from "mongoose";
import type { IUser } from "./User";
import type { IPost } from "./Post";

// ─────────────────────────────────────────────────────────────────────────────
// Public serialisable interface
// ─────────────────────────────────────────────────────────────────────────────

export interface IComment {
	/** MongoDB ObjectId serialised to string */
	_id: string;
	content: string;
	/**
	 * `string`  — raw ObjectId when author is NOT populated.
	 * `IUser`   — hydrated user document when populated.
	 */
	author: IUser | string;
	/**
	 * `string`  — raw ObjectId when post is NOT populated.
	 * `IPost`   — hydrated post document when populated.
	 *
	 * The typical comments-on-a-post query never needs to re-fetch the post
	 * from a comment (it's already in context), so this is kept as `string`
	 * in most query results. Populate only when you genuinely need post data
	 * from the comment document.
	 */
	post: IPost | string;
	createdAt: Date;
	updatedAt: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal Mongoose document type
// ─────────────────────────────────────────────────────────────────────────────

interface ICommentDoc
	extends Omit<IComment, "_id" | "author" | "post">, Document {
	_id: Types.ObjectId;
	author: Types.ObjectId;
	post: Types.ObjectId;
}

// ─────────────────────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────────────────────

const CommentSchema = new Schema<ICommentDoc>(
	{
		content: {
			type: String,
			required: [true, "Content is required"],
			maxlength: [1000, "Comment cannot exceed 1000 characters"],
		},

		author: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Author is required"],
		},

		post: {
			type: Schema.Types.ObjectId,
			ref: "Post",
			required: [true, "Post reference is required"],
		},
	},
	{
		timestamps: true,
	},
);

// ─────────────────────────────────────────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Primary access pattern: fetch all comments for a given post, newest first.
 * This index covers the `post` filter and the `createdAt` sort in one scan.
 */
CommentSchema.index({ post: 1, createdAt: 1 });

/**
 * Needed for: "delete all comments by this user" (account deletion / moderation).
 * Also useful for the moderator dashboard listing a user's comment activity.
 */
CommentSchema.index({ author: 1 });

// ─────────────────────────────────────────────────────────────────────────────
// Model (safe against Next.js hot-reload recompilation)
// ─────────────────────────────────────────────────────────────────────────────

const Comment: Model<ICommentDoc> =
	(mongoose.models.Comment as Model<ICommentDoc>) ??
	mongoose.model<ICommentDoc>("Comment", CommentSchema);

export default Comment;
