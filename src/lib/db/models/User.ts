/**
 * src/lib/db/models/User.ts
 *
 * Two-layer type strategy
 * ───────────────────────
 * IUser        — plain serialisable object (_id as string). Use this in Server
 *                Actions, props, and any data passed to Client Components.
 *
 * IUserDoc     — internal Mongoose Document (_id as ObjectId). Use this only
 *                inside server-side DB operations; never send it to the client.
 *
 * This separation avoids the "Class contains both instance members and a type
 * with property '_id'" problem and makes lean() / toObject() usage explicit.
 */

import mongoose, { Document, Model, Schema, Types } from "mongoose";
import type { DbRole } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// Public serialisable interface
// ─────────────────────────────────────────────────────────────────────────────

export interface IUser {
	/** MongoDB ObjectId serialised to string — safe to pass to Client Components */
	_id: string;
	name: string;
	email: string;
	/**
	 * Only present when the query explicitly selects the password field:
	 *   User.findOne({ email }).select("+password")
	 * Omitted from all other queries because `select: false` is set on the schema.
	 */
	password?: string;
	/** Stored roles only — "guest" is never persisted */
	role: DbRole;
	createdAt: Date;
	updatedAt: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal Mongoose document type
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Replaces _id with ObjectId for internal Mongoose use.
 * Not exported — nothing outside this file should rely on the raw document shape.
 */
interface IUserDoc extends Omit<IUser, "_id">, Document {
	_id: Types.ObjectId;
}

// ─────────────────────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────────────────────

const UserSchema = new Schema<IUserDoc>(
	{
		name: {
			type: String,
			required: [true, "Name is required"],
			trim: true,
		},

		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true, // creates a unique index automatically
			lowercase: true, // stored and compared in lowercase
			trim: true,
		},

		password: {
			type: String,
			required: [true, "Password is required"],
			/**
			 * select: false — the password field is NEVER included in query results
			 * unless the caller explicitly requests it:
			 *   User.findOne({ email }).select("+password")
			 * This prevents accidental password exposure in any listing or session code.
			 */
			select: false,
		},

		role: {
			type: String,
			// Only DB-safe roles; "guest" is an in-app concept, never stored.
			enum: {
				values: [
					"super_admin",
					"moderator",
					"regular_user",
				] satisfies DbRole[],
				message: "{VALUE} is not a valid role",
			},
			default: "regular_user",
		},
	},
	{
		timestamps: true, // adds createdAt and updatedAt automatically
	},
);

// ─────────────────────────────────────────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────────────────────────────────────────

// email already has a unique index from `unique: true` above.
// Add a compound index for role-based admin queries (e.g. list all moderators).
UserSchema.index({ role: 1, createdAt: -1 });

// ─────────────────────────────────────────────────────────────────────────────
// Model (safe against Next.js hot-reload recompilation)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * `mongoose.models.User` is the cached model from a previous HMR cycle.
 * Without this guard, Next.js hot-reload throws:
 *   "Cannot overwrite `User` model once compiled."
 */
const User: Model<IUserDoc> =
	(mongoose.models.User as Model<IUserDoc>) ??
	mongoose.model<IUserDoc>("User", UserSchema);

export default User;
