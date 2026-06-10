// src/app/(auth)/login/page.tsx
import { Suspense } from "react";
import LoginPageContent from "@/components/auth/LoginPageContent";

export const metadata = {
	title: "Login",
};

// Fallback component
function LoginSkeleton() {
	return <div className="min-h-screen bg-[#0d0d0d]">Loading...</div>;
}

export default function LoginPage() {
	return (
		<Suspense fallback={<LoginSkeleton />}>
			<LoginPageContent />
		</Suspense>
	);
}
