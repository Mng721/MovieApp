"use client";
import { signIn, useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    const { data: session } = useSession();

    if (session) {
        redirect("/");
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        // Reset error state before submission
        setError(null);
        let email = formData.get("email");
        let password = formData.get("password");
        if (!email || !password) {
            setError("Email and password are required.");
            return;
        }

        const res = await signIn("credentials", {
            email: email,
            password: password,
            redirect: false,
            callbackUrl: "/",
        });
        if (res?.error === "CredentialsSignin") {
            setError("Tài khoản hoặc mật khẩu không đúng.");
        } else if (res?.error) {
            setError("An unexpected error occurred. Please try again.");
        } else {
            setError(null);
        }
    };

    return (
        <div className="bg-gray-900 flex min-h-screen items-center justify-center">
            <div className="space-y-4 flex flex-col items-center shadow p-10 bg-gray-800 rounded-2xl">
                <div className="text-2xl text-white">Đăng nhập</div>
                <form onSubmit={handleSubmit} className="space-y-4 flex flex-col justify-center">
                    <input name="email" type="email" placeholder="Email" className="block w-64 p-2 border placeholder-amber-50" />
                    <input name="password" type="password" placeholder="Password" className="block w-64 p-2 border placeholder-amber-50" />
                    <button type="submit" className="bg-blue-500 text-white p-2 rounded cursor-pointer hover:opacity-70">Login</button>
                    {error && <div className="text-red-500 text-sm">{error}</div>}
                </form>
                <div className="text-sm text-white">Bạn chưa có tài khoản? <span onClick={() => router.push("/register")} className="cursor-pointer hover:opacity-70 text-[#ffd875]">Đăng kí ngay</span></div>
                <button
                    onClick={() => signIn("google", { callbackUrl: '/' })}
                    className="bg-red-500 text-white p-2 w-full rounded cursor-pointer hover:opacity-70"
                >
                    Login with Google
                </button>
            </div>
        </div>
    );
}