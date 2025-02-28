"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await signIn("credentials", {
            email,
            password,
            redirect: false
        });

        if (result?.error) {
            alert("Invalid credentials!");
        } else {
            router.push("/dashboard");
        }
    };

    return (
        <div className="flex justify-center items-center h-screen">
            <form onSubmit={handleLogin} className="p-6 shadow-lg rounded-lg w-96 bg-white">
                <h2 className="text-2xl font-bold mb-4">Login</h2>
                <input 
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border rounded mb-3"
                    required
                />
                <input 
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 border rounded mb-3"
                    required
                />
                <button type="submit" className="w-full p-2 bg-green-600 text-white rounded">
                    Sign In
                </button>
            </form>
        </div>
    );
}
