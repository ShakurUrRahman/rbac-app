# RBAC App

A full-stack Role-Based Access Control system built with Next.js 15 App Router. Users can create posts and comments with fine-grained permissions enforced at both the UI and server layers.

## Tech Stack

- **Framework** — Next.js 15 (App Router, Server Components, Server Actions)
- **Auth** — NextAuth v5 with Credentials provider, JWT strategy
- **Database** — MongoDB with Mongoose ODM
- **Validation** — Zod
- **Styling** — Tailwind CSS (dark theme)
- **Language** — TypeScript

---

## Roles

| Role           | Capabilities                                                          |
| -------------- | --------------------------------------------------------------------- |
| `super_admin`  | Delete any post or comment, access Admin Panel and Mod Panel          |
| `moderator`    | Delete any post or comment, access Mod Panel                          |
| `regular_user` | Create posts and comments, update/delete their own posts and comments |
| `guest`        | Read-only access, no session required                                 |

---

## Permission Rules

**Posts**

- Only `regular_user` can create posts
- A user can only update their own posts
- `moderator` and `super_admin` can delete any post
- `regular_user` can only delete their own posts

**Comments**

- Any authenticated user can comment on any post
- Comment owner can delete their own comment
- Post owner can delete any comment on their post
- `moderator` and `super_admin` can delete any comment

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx          # Login form (NextAuth signIn)
│   │   └── register/
│   │       └── page.tsx          # Register form (Server Action)
│   ├── (main)/
│   │   ├── layout.tsx            # Shared layout with Navbar
│   │   └── posts/
│   │       └── [id]/
│   │           ├── page.tsx      # Post detail + edit/delete buttons
│   │           └── edit/
│   │               └── page.tsx  # Edit post form (owner only)
│   └── api/
│       └── auth/
│           └── [...nextauth]/
│               └── route.ts      # NextAuth route handler
├── components/
│   ├── Navbar.tsx                # Server Component, role-aware nav
│   └── posts/
│       ├── DeletePostButton.tsx  # Client Component, confirm dialog
│       └── PostForm.tsx          # Shared create/edit form
├── lib/
│   ├── actions/
│   │   ├── auth.actions.ts       # registerUser Server Action
│   │   └── post.actions.ts       # createPost, updatePost, deletePost
│   ├── auth/
│   │   ├── auth.config.ts        # Edge-safe NextAuth config (middleware)
│   │   ├── auth.ts               # Full auth instance (Node.js only)
│   │   └── helpers.ts            # getServerSession, requireAuth
│   ├── db/
│   │   ├── models/
│   │   │   ├── Comment.ts        # Comment model + IComment interface
│   │   │   ├── Post.ts           # Post model + IPost interface
│   │   │   └── User.ts           # User model + IUser interface
│   │   ├── queries/
│   │   │   └── post.queries.ts   # getPosts (paginated), getPostById
│   │   ├── mongoose.ts           # Singleton MongoDB connection
│   │   └── seed.ts               # Super admin seed script
│   ├── validations/
│   │   ├── auth.ts               # RegisterSchema, LoginSchema (Zod)
│   │   └── post.ts               # PostSchema (Zod)
│   └── permissions.ts            # Pure permission functions
├── middleware.ts                  # Route protection with getToken()
└── types/
    └── index.ts                  # Role, SessionUser types
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB connection string (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Clone and install

```bash
git clone <your-repo-url>
cd rbac-app
npm install
```

### 2. Environment variables

Create a `.env.local` file in the project root:

```env
# MongoDB
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/rbac-app

# NextAuth — generate a secret with: openssl rand -base64 32
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# Seed script
SEED_SUPER_ADMIN_EMAIL=admin@rbac.dev
SEED_SUPER_ADMIN_PASSWORD=ChangeMe123!
```

### 3. Seed the database

Creates the initial `super_admin` account. Safe to re-run — skips if the email already exists.

```bash
npm run seed
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Available Scripts

| Script          | Description                             |
| --------------- | --------------------------------------- |
| `npm run dev`   | Start development server with Turbopack |
| `npm run build` | Production build                        |
| `npm run start` | Start production server                 |
| `npm run lint`  | Run ESLint                              |
| `npm run seed`  | Seed super_admin account                |

---

## Auth Architecture

NextAuth v5 is split into two files to respect the Edge/Node.js runtime boundary:

**`auth.config.ts`** — Edge-safe. Contains only JWT and session callbacks with no Node.js imports. Used by `middleware.ts`.

**`auth.ts`** — Node.js only. Extends the base config with the Credentials provider, which needs `mongoose` and `bcryptjs`. Used by Server Components, Server Actions, and the API route handler.

```
middleware.ts      → imports auth.config.ts   (Edge runtime ✓)
helpers.ts         → imports auth.ts          (Node.js runtime ✓)
api/auth/route.ts  → imports auth.ts          (Node.js runtime ✓)
```

The JWT stores `id` and `role` so every request can be authorised without a database lookup.

---

## Permission System

All permission logic lives in `src/lib/permissions.ts` as pure functions with zero framework dependencies:

```ts
canEditPost(sessionUser, post); // only post owner (regular_user)
canDeletePost(sessionUser, post); // owner, moderator, super_admin
canCreateComment(sessionUser); // any authenticated user
canDeleteComment(sessionUser, comment, post); // owner, post owner, mod, super_admin
```

These are called in two places:

- **Server Actions** — enforced server-side regardless of what the client sends
- **Server Components** — drive conditional rendering of edit/delete buttons

---

## Route Protection

`middleware.ts` uses `getToken()` (Edge-compatible) to read the JWT and enforce role rules before a page renders:

| Route           | Required role              |
| --------------- | -------------------------- |
| `/admin/*`      | `super_admin`              |
| `/moderator/*`  | `super_admin`, `moderator` |
| `/posts/new`    | any authenticated user     |
| `api/auth/*`    | always public              |
| everything else | public (guests welcome)    |

Unauthenticated access redirects to `/login?callbackUrl=<path>`. Wrong-role access redirects to `/?error=unauthorized`.

---

## Data Models

### User

| Field      | Type   | Notes                                                                  |
| ---------- | ------ | ---------------------------------------------------------------------- |
| `name`     | String | required                                                               |
| `email`    | String | required, unique, lowercase                                            |
| `password` | String | `select: false` — never returned in queries                            |
| `role`     | Enum   | `super_admin` \| `moderator` \| `regular_user`, default `regular_user` |

### Post

| Field     | Type     | Notes                    |
| --------- | -------- | ------------------------ |
| `title`   | String   | required, max 200 chars  |
| `content` | String   | required, max 5000 chars |
| `author`  | ObjectId | ref User, required       |

### Comment

| Field     | Type     | Notes                    |
| --------- | -------- | ------------------------ |
| `content` | String   | required, max 1000 chars |
| `author`  | ObjectId | ref User, required       |
| `post`    | ObjectId | ref Post, required       |

All models include `createdAt` and `updatedAt` via `timestamps: true`.

---

## Key Implementation Notes

**ObjectId serialisation** — Mongoose's `.lean()` returns `ObjectId` instances which Next.js cannot serialise across the Server/Client boundary. Every query normalises `_id` fields to strings before returning data.

**`password` field** — marked `select: false` on the User schema. It only appears in queries that explicitly call `.select("+password")`, which is only the login `authorize` function.

**Cascade delete** — deleting a post also deletes all its comments via `Promise.all([Post.findByIdAndDelete, Comment.deleteMany])`, running both operations in parallel.

**`useActionState` signature** — Server Actions bound to `useActionState` receive `(prevState, formData)`, not just `(formData)`. All actions declare `_prevState` as the first parameter to avoid the `formData.get is not a function` runtime error.
