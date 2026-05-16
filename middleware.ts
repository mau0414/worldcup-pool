import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const isAuthPage = req.nextUrl.pathname.startsWith("/login") ||
                        req.nextUrl.pathname.startsWith("/register")

    if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", req.url))
    }
    })

    export const config = {
    matcher: ["/dashboard/:path*", "/pools/:path*"]
}