"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
    const router = useRouter()
    const [error, setError] = useState("")

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const form = e.currentTarget

        const result = await signIn("credentials", {
            email: (form.elements.namedItem("email") as HTMLInputElement).value,
            password: (form.elements.namedItem("password") as HTMLInputElement).value,
            redirect: false,
        })

        if (result?.ok) {
            router.push("/dashboard")
        } else {
            setError("Invalid email or password")
        }
    }

    return (
        <div className="max-w-sm mx-auto mt-20 p-6 border rounded-lg">
            <h1 className="text-2xl font-bold mb-6">Log in</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
            </div>
            <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit">Log in</Button>
            </form>
            <p className="mt-4 text-sm text-center">
            No account?{" "}
            <a href="/register" className="underline">Register</a>
            </p>
        </div>
    )
}