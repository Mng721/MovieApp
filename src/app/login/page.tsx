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
        console.log(res)
        // if (res?.ok) router.push("/");
    };

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="email" type="email" placeholder="Email" className="block w-64 p-2 border" />
                    <input name="password" type="password" placeholder="Password" className="block w-64 p-2 border" />
                    <button type="submit" className="bg-blue-500 text-white p-2">Login</button>
                </form>
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