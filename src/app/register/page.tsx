"use client";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { useState } from "react";

export default function Register() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null); // Thêm state để lưu lỗi

    const register = api.auth.register.useMutation({
        onSuccess: () => {
            router.push("/login");
        },
        onError: (err) => {
            setError(err.message); // Hiển thị lỗi từ server
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null); // Reset lỗi trước khi gửi
        const formData = new FormData(e.currentTarget);
        register.mutate({
            email: formData.get("email") as string,
            password: formData.get("password") as string,
            name: formData.get("name") as string,
        });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-900">
            <form onSubmit={handleSubmit} className="space-y-4 flex flex-col items-center shadow p-10 bg-gray-800 rounded-2xl">
                <div className="text-2xl text-white">Đăng ký</div>
                <input
                    name="name"
                    type="text"
                    placeholder="Name"
                    className="block w-64 p-2 border placeholder-amber-50 text-amber-50"
                />
                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    className="block w-64 p-2 border placeholder-amber-50 text-amber-50"
                />
                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    className="block w-64 p-2 border placeholder-amber-50 "
                />
                {error && <p className="text-red-500">{error}</p>} {/* Hiển thị lỗi */}
                <div className="text-sm text-white">Nếu bạn đã có tài khoản, <span onClick={() => router.push("/login")} className="cursor-pointer hover:opacity-70 text-[#ffd875]">đăng nhập</span></div>
                <button
                    type="submit"
                    className="bg-blue-500 text-white p-2 disabled:bg-gray-400"
                    disabled={register.isPending} // Vô hiệu hóa nút khi đang gửi
                >
                    {register.isPending ? "Đang xử lý..." : "Register"}
                </button>
            </form>
        </div>
    );
}