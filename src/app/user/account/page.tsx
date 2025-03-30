"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

export default function AccountPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [name, setName] = useState("");
    const [avatar, setAvatar] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    // Lấy thông tin người dùng
    const { data: user, refetch } = api.user.getUser.useQuery(undefined, {
        enabled: !!session,
    });

    // Cập nhật thông tin người dùng
    const updateUser = api.user.updateUser.useMutation({
        onSuccess: () => {
            refetch();
            alert("Cập nhật thông tin thành công!");
        },
    });

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        if (user) {
            setName(user.name ?? user.email);
            setAvatar(user.image || null);
        }
    }, [user]);

    // Xử lý upload avatar
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Xử lý cập nhật thông tin
    // const handleSubmit = async (e: React.FormEvent) => {
    //     e.preventDefault();
    //     let avatarUrl = avatar;

    //     // Nếu có file avatar mới, upload lên (ở đây giả lập upload, bạn có thể dùng dịch vụ như Cloudinary)
    //     if (avatarFile) {
    //         // Giả lập upload: Trong thực tế, bạn sẽ gửi file lên server hoặc dịch vụ lưu trữ
    //         avatarUrl = `/images/avatars/${avatarFile.name}`; // Thay bằng URL thực tế sau khi upload
    //     }

    //     updateUser.mutate({
    //         name,
    //         image: avatarUrl,
    //     });
    // };

    if (status === "loading") {
        return <div>Đang tải...</div>;
    }

    if (!session) {
        return null;
    }

    return (
        <div className="bg-gray-900 min-h-screen text-white pt-16 p-4">
            <div className="container mx-auto max-w-md">
                <h1 className="text-3xl font-bold mb-6">Quản lý tài khoản</h1>
                <form onSubmit={() => { }} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Tên</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 bg-gray-700 text-white rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            value={user?.email}
                            disabled
                            className="w-full p-2 bg-gray-600 text-white rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Avatar</label>
                        <div className="flex items-center gap-4">
                            {avatar ? (
                                <img
                                    src={avatar}
                                    alt="Avatar"
                                    className="w-16 h-16 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center">
                                    <span className="text-gray-400">N/A</span>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="text-gray-300"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full p-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                    >
                        Cập nhật
                    </button>
                </form>
            </div>
        </div>
    );
}