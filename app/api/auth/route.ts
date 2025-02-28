import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "email@example.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                try {
                    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
                        email: credentials?.email,
                        password: credentials?.password
                    });

                    if (response.data) return response.data;
                } catch (error) {
                    throw new Error("Invalid credentials");
                }
                return null;
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) token = user;
            return token;
        },
        async session({ session, token }) {
            session.user = token;
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: { signIn: "/login" }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
