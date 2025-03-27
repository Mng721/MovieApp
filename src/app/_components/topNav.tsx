"use client";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TopNav() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false); // State cho menu mobile

    // Kiểm tra nếu user là admin
    const isAdmin = session?.user?.roleId === 2; // Giả sử roleId = 2 là admin

    const handleSignOut = async () => {
        await signOut({ redirect: false });
        router.refresh()
    };

    return (
        <nav className="bg-gray-800 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="text-2xl font-bold">
                    MovieApp
                </Link>

                {/* Menu cho desktop */}
                <div className="hidden md:flex space-x-4 items-center">
                    <Link href="/" className="hover:text-gray-300">
                        Home
                    </Link>
                    <Link href="/movies" className="hover:text-gray-300">
                        Movies
                    </Link>
                    <Link href="/movie" className="block hover:text-gray-300">
                        Favourite
                    </Link>
                    {isAdmin && (
                        <Link href="/admin" className="hover:text-gray-300">
                            Admin
                        </Link>
                    )}
                    {status === "authenticated" ? (
                        <button
                            onClick={handleSignOut}
                            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded cursor-pointer"
                        >
                            Sign Out
                        </button>
                    ) : (
                        <Link
                            href="/login"
                            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded cursor-pointer"
                        >
                            Sign In
                        </Link>
                    )}
                </div>

                {/* Nút menu cho mobile */}
                <button
                    className="md:hidden focus:outline-none"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                        />
                    </svg>
                </button>
            </div>

            {/* Menu cho mobile */}
            {isOpen && (
                <div className="md:hidden mt-2 space-y-2">
                    <Link href="/" className="block hover:text-gray-300">
                        Home
                    </Link>
                    <Link href="/movies" className="block hover:text-gray-300">
                        Movies
                    </Link>
                    <Link href="/movie" className="block hover:text-gray-300">
                        Favourite
                    </Link>
                    {isAdmin && (
                        <Link href="/admin" className="block hover:text-gray-300">
                            Admin
                        </Link>
                    )}
                    {status === "authenticated" ? (
                        <button
                            onClick={handleSignOut}
                            className="block w-full text-left bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
                        >
                            Sign Out
                        </button>
                    ) : (
                        <Link
                            href="/login"
                            className="block w-full text-left bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
                        >
                            Sign In
                        </Link>
                    )}
                </div>
            )}
        </nav>
    );
}