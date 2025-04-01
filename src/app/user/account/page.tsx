"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import axios from "axios";
import { Bounce, ToastContainer, toast } from 'react-toastify';

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
            toast("Cập nhật thành công!", {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            })
            refetch();
        },
        onError: (e) => {
            toast(`Xảy ra lỗi: ${e}`, {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            })
        }
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
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let avatarUrl = avatar;

        // Nếu có file avatar mới, upload lên (ở đây giả lập upload, bạn có thể dùng dịch vụ như Cloudinary)
        if (avatarFile) {
            // Tạo FormData
            const formData = new FormData();
            formData.append('file', avatarFile);
            formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "");
            formData.append('folder', 'avatars');

            await axios.post(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                formData).then(
                    (res) => {
                        // Giả lập upload: Trong thực tế, bạn sẽ gửi file lên server hoặc dịch vụ lưu trữ
                        avatarUrl = res.data.secure_url; // Thay bằng URL thực tế sau khi upload
                    }
                ).catch((e) => {
                    console.log(e)
                })
        }

        updateUser.mutate({
            name,
            image: avatarUrl ?? "",
        });
    };

    if (status === "loading") {
        return <div>Đang tải...</div>;
    }

    if (!session) {
        return null;
    }

    return (
        <div className="bg-gray-900 min-h-screen text-white pt-16 p-4">
            <ToastContainer />
            <div className="container mx-auto max-w-md">
                <h1 className="text-3xl font-bold mb-6">Quản lý tài khoản</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                        <div className="flex items-center gap-4 ">
                            {avatar ? (
                                <img
                                    src={avatar}
                                    alt="Avatar"
                                    className="w-32 h-32 rounded-full object-cover bg-white"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center">
                                    <span className="text-gray-400">N/A</span>
                                </div>
                            )}
                            <label htmlFor="uploadFile1"
                                className="flex bg-gray-800 hover:bg-gray-700 text-white text-base font-medium px-4 py-2.5 outline-none rounded w-max cursor-pointer ">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 mr-2 fill-white inline" viewBox="0 0 32 32">
                                    <path
                                        d="M23.75 11.044a7.99 7.99 0 0 0-15.5-.009A8 8 0 0 0 9 27h3a1 1 0 0 0 0-2H9a6 6 0 0 1-.035-12 1.038 1.038 0 0 0 1.1-.854 5.991 5.991 0 0 1 11.862 0A1.08 1.08 0 0 0 23 13a6 6 0 0 1 0 12h-3a1 1 0 0 0 0 2h3a8 8 0 0 0 .75-15.956z"
                                        data-original="#000000" />
                                    <path
                                        d="M20.293 19.707a1 1 0 0 0 1.414-1.414l-5-5a1 1 0 0 0-1.414 0l-5 5a1 1 0 0 0 1.414 1.414L15 16.414V29a1 1 0 0 0 2 0V16.414z"
                                        data-original="#000000" />
                                </svg>
                                Upload
                                <input
                                    type="file"
                                    id="uploadFile1"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="text-gray-300 hidden"
                                />
                            </label>

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