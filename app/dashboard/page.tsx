"use client";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
    const { data: session } = useSession();
    const router = useRouter();

    if (!session) {
        router.push("/login");
        return null;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-3xl font-bold text-primary">Hello, {session.user.name}!</h1>
            <button onClick={() => signOut()} className="mt-4 px-6 py-2 bg-red-500 text-white rounded">
                Logout
            </button>
        </div>
    );
}
