"use client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Login() {
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const res = await signIn("credentials", {
            email: formData.get("email"),
            password: formData.get("password"),
            redirect: true,
            callbackUrl: "/"
        });
    };

    return (
        <div className="bg-gray-900 flex min-h-screen items-center justify-center">
            <div className="space-y-4 flex flex-col items-center shadow p-10 bg-gray-800 rounded-2xl">
                <div className="text-2xl text-white">Đăng nhập</div>
                <form onSubmit={handleSubmit} className="space-y-4 lex flex-col justify-center">
                    <input name="email" type="email" placeholder="Email" className="block w-64 p-2 border placeholder-amber-50" />
                    <input name="password" type="password" placeholder="Password" className="block w-64 p-2 border placeholder-amber-50" />
                    <button type="submit" className="bg-blue-500 text-white p-2 mx-auto rounded">Login</button>
                </form>
                <div className="text-sm text-white">Bạn chưa có tài khoản? <span onClick={() => router.push("/register")} className="cursor-pointer hover:opacity-70">Đăng kí ngay</span></div>
                <button
                    onClick={() => signIn("google", { callbackUrl: '/' })}
                    className="bg-red-500 text-white p-2"
                >
                    Login with Google
                </button>
            </div>
        </div>
    );
}