import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
    const session = await auth()

    return (
        <div className="max-w-lg mx-auto mt-20 p-6">
        <h1 className="text-2xl font-bold">Welcome, {session.user?.name}!</h1>
        <p className="text-gray-500 mt-2">Your dashboard is ready.</p>
        </div>
    )
}