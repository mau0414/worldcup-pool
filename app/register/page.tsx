"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegisterPage() {
    const router = useRouter()
    const [error, setError] = useState("")

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const form = e.currentTarget
        const data = {
            name: (form.elements.namedItem("name") as HTMLInputElement).value,
            email: (form.elements.namedItem("email") as HTMLInputElement).value,
            password: (form.elements.namedItem("password") as HTMLInputElement).value,
    }

    const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })

    if (res.ok) {
        router.push("/login")
    } else {
        const body = await res.json()
        setError(body.error)
    }
    }

    return (
        <div className="max-w-sm mx-auto mt-20 p-6 border rounded-lg">
            <h1 className="text-2xl font-bold mb-6">Create account</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required />
            </div>
            <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
            </div>
            <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit">Register</Button>
            </form>
            <p className="mt-4 text-sm text-center">
                Already have an account?{" "}
            <a href="/login" className="underline">Log in</a>
            </p>
        </div>
    )
}