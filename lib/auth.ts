import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { db } from "./db"

export const { handlers, signIn, signOut, auth } = NextAuth({
adapter: PrismaAdapter(db),
session: { strategy: "jwt" },
pages: {
    signIn: "/login",
},
providers: [
    Credentials({
    credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await db.user.findUnique({
            where: { email: credentials.email as string },
        })

        if (!user || !user.passwordHash) return null

        const valid = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash
        )

        if (!valid) return null

        return user
    },
    }),
],
callbacks: {
    async jwt({ token, user }) {
    if (user) {
        token.id = user.id ?? ""
        token.plan = (user as any).plan
    }
    return token
    },
    async session({ session, token }) {
        session.user.id = token.id as string
        session.user.plan = token.plan as string
    return session
    },
},
})