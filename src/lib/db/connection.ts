/**
 * src/lib/db/mongoose.ts
 *
 * Singleton Mongoose connection using the standard Next.js global-cache pattern.
 *
 * WHY globalThis._mongoose?
 * In development, Next.js hot-reloads modules on every change. Without caching,
 * each reload would open a new connection and exhaust the MongoDB connection pool.
 * Attaching the cache to `globalThis` (which persists across HMR cycles) prevents
 * that. In production the module is only ever evaluated once, so the cache is a
 * no-op safety net.
 */

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
	throw new Error(
		"Missing env: MONGODB_URI is not defined. Add it to .env.local.",
	);
}

// ─── Type augmentation ────────────────────────────────────────────────────────

/**
 * Extend the NodeJS global object so TypeScript knows about our cache property.
 * `var` is intentional here — TypeScript's global augmentation only works with
 * `var`, not `let`/`const`. ESLint's no-var rule should be disabled for this block.
 */
declare global {
	// eslint-disable-next-line no-var
	var _mongoose:
		| {
				conn: typeof mongoose | null;
				promise: Promise<typeof mongoose> | null;
		  }
		| undefined;
}

// ─── Initialise / reuse the global cache ─────────────────────────────────────

// `globalThis._mongoose` persists across hot-reloads in development.
// In production this is just a module-level singleton (initialised once).
const cached: {
	conn: typeof mongoose | null;
	promise: Promise<typeof mongoose> | null;
} = globalThis._mongoose ?? { conn: null, promise: null };

globalThis._mongoose = cached;

// ─── Connection helper ────────────────────────────────────────────────────────

/**
 * Connects to MongoDB and returns the mongoose instance.
 * Subsequent calls return the cached connection without opening a new socket.
 *
 * @example
 * import { connectDB } from "@/lib/db/mongoose";
 * await connectDB();
 */
export async function connectDB(): Promise<typeof mongoose> {
	// Return the existing connection if it's already open.
	if (cached.conn) {
		return cached.conn;
	}

	// Start a new connection promise if none is in flight.
	if (!cached.promise) {
		cached.promise = mongoose.connect(MONGODB_URI as string, {
			/**
			 * `bufferCommands: false` makes Mongoose throw immediately when a
			 * command is issued while the connection is down, rather than silently
			 * queuing it. Prefer explicit errors in a serverless environment.
			 */
			bufferCommands: false,
		});
	}

	// Await the in-flight promise. If it rejects, reset so the next call retries.
	try {
		cached.conn = await cached.promise;
	} catch (err) {
		cached.promise = null; // allow retry on next call
		throw err;
	}

	return cached.conn;
}
