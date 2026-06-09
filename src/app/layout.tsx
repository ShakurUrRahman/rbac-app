// src/app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: {
		default: "RBAC App",
		template: "%s · RBAC App",
	},
	description: "A role-based access control system with posts and comments.",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className="dark">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0f0f0f] text-zinc-100`}
			>
				<Navbar />
				{children}

				{/* Global toast notifications */}
				<Toaster
					position="bottom-right"
					toastOptions={{
						duration: 3500,
						style: {
							background: "#18181b", // zinc-900
							color: "#f4f4f5", // zinc-100
							border: "1px solid #3f3f46", // zinc-700
							borderRadius: "10px",
							fontSize: "14px",
							padding: "12px 16px",
						},
						success: {
							iconTheme: {
								primary: "#22c55e", // green-500
								secondary: "#18181b",
							},
						},
						error: {
							iconTheme: {
								primary: "#f97316", // orange-500
								secondary: "#18181b",
							},
						},
					}}
				/>
			</body>
		</html>
	);
}
