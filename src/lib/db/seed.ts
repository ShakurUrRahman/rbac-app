/**
 * Seed script — run once manually:
 *   npm run seed
 *
 * Creates the super_admin account from env vars if it doesn't already exist.
 * Safe to re-run: skips creation if the email is already in use.
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ─── Minimal inline schema (avoids Next.js @/ alias issues in ts-node) ────────

const userSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		email: { type: String, required: true, unique: true, lowercase: true },
		password: { type: String, required: true, select: false },
		role: {
			type: String,
			enum: ["super_admin", "moderator", "regular_user"],
			default: "regular_user",
		},
	},
	{ timestamps: true },
);

// Singleton-safe model registration
const User = mongoose.models.User ?? mongoose.model("User", userSchema);

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
	const uri = process.env.MONGODB_URI;
	const email = process.env.SEED_SUPER_ADMIN_EMAIL;
	const password = process.env.SEED_SUPER_ADMIN_PASSWORD;

	if (!uri) {
		console.error("❌  MONGODB_URI is not set in your environment.");
		process.exit(1);
	}
	if (!email || !password) {
		console.error(
			"❌  SEED_SUPER_ADMIN_EMAIL and SEED_SUPER_ADMIN_PASSWORD must be set.",
		);
		process.exit(1);
	}

	await mongoose.connect(uri, { bufferCommands: false });
	console.log("✅  Connected to MongoDB");

	const existing = await User.findOne({ email }).lean();

	if (existing) {
		console.log(
			`ℹ️   Super admin already exists (${email}) — nothing to do.`,
		);
	} else {
		const hashed = await bcrypt.hash(password, 12);
		await User.create({
			name: "Super Admin",
			email,
			password: hashed,
			role: "super_admin",
		});
		console.log(`✅  Super admin seeded successfully (${email}).`);
	}

	await mongoose.disconnect();
	console.log("✅  Disconnected from MongoDB");
	process.exit(0);
}

seed().catch((err) => {
	console.error("❌  Seed failed:", err);
	process.exit(1);
});
