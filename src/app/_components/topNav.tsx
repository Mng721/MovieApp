"use client";
import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { FaHeart, FaSignOutAlt, FaUser } from "react-icons/fa";

interface Movie {
    id: number;
    title: string;
    release_date: string;
    poster_path: string
}

interface Genre {
    id: number;
    name: string;
}


export default function Navbar() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false); // State cho menu mobile
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false); // State cho dropdown người dùng

    const dropdownRef = useRef<HTMLDivElement>(null);

    const isAdmin = session?.user?.roleId === 1;

    const { data: searchResults = [], refetch } = api.movies.searchMovies.useQuery(
        { query: searchQuery },
        { enabled: false }
    );

    // Lấy thông tin người dùng
    const { data: userData } = api.user.getUser.useQuery()

    // Lấy danh sách genres từ tRPC
    const { data: genres } = api.movies.getGenres.useQuery();

    // Đóng dropdown khi nhấp ra ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const searchRef = useRef<HTMLDivElement>(null);
    const userRef = useRef<HTMLDivElement>(null);

    // Đóng thanh tìm kiếm khi nhấp ra ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userRef.current && !userRef.current.contains(event.target as Node)) {
                setIsUserDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (searchQuery.length >= 2) {
            refetch();
            setIsSearchOpen(true);
        } else {
            setIsSearchOpen(false);
        }
    }, [searchQuery, refetch]);

    const handleSignOut = async () => {
        await signOut({ redirect: false });
        router.push("/")
        router.refresh();
    };

    const handleSelectMovie = (movieId: number) => {
        setSearchQuery("");
        setIsSearchOpen(false);
        router.push(`/movie/${movieId}`);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/movie?q=${encodeURIComponent(searchQuery)}`);
            setIsSearchOpen(false);
            setSearchQuery("");
        }
    };
    return (
        <nav className="top-0 left-0 w-full bg-gray-800 text-white p-4 z-50 sticky">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex flex-1 justify-between">
                    <Link href="/" className="text-2xl font-bold">
                        MovieApp
                    </Link>

                    <div className="relative mx-4"
                        ref={searchRef}
                    >
                        <form onSubmit={handleSearchSubmit}
                        >
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Tìm kiếm phim..."
                                className="w-full md:w-64 p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </form>
                        {isSearchOpen && searchQuery.length >= 2 && (
                            <div className="absolute top-full right-0 w-full md:w-64 bg-gray-700 rounded shadow-lg mt-1 z-50 max-h-64 overflow-y-auto">
                                {searchResults.length > 0 ? (
                                    searchResults.map((movie: Movie) => (
                                        <div
                                            key={movie.id}
                                            onClick={() => handleSelectMovie(movie.id)}
                                            className="p-2 hover:bg-gray-600 cursor-pointer flex items-center gap-2"
                                        >
                                            <img
                                                src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                                                alt={movie.title}
                                                className="w-10 h-14 object-cover rounded"
                                                onError={(e) => (e.currentTarget.src = "/assets/images/movie.jpg")}
                                            />
                                            <div>
                                                <p className="text-white">{movie.title}</p>
                                                <p className="text-gray-400 text-sm">{movie.release_date}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-2 text-gray-400">Không tìm thấy phim.</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="hidden md:flex space-x-4 items-center">
                    <Link href="/" className="hover:text-gray-300">
                        Trang Chủ
                    </Link>
                    <Link href="/ranking" className="hover:text-gray-300">
                        Top phim
                    </Link>
                    {/* Dropdown thể loại */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="hover:text-gray-300 flex items-center gap-1 cursor-pointer"
                        >
                            Thể loại
                            <svg
                                className={`w-4 h-4 transform ${isDropdownOpen ? "rotate-180" : ""}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </button>
                        {isDropdownOpen && (
                            <div className="absolute top-full right-0 bg-gray-700 rounded shadow-lg mt-2 z-50 w-48 max-h-64 overflow-y-auto">
                                {genres.map((genre: Genre) => (
                                    <Link
                                        key={genre.id}
                                        href={`/genres/${genre.id}`}
                                        onClick={() => setIsDropdownOpen(false)}
                                        className="block p-2 hover:bg-gray-600"
                                    >
                                        {genre.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {isAdmin && (
                        <Link href="/admin" className="hover:text-gray-300">
                            Admin
                        </Link>
                    )}
                    {status === "authenticated" ? (
                        <div className="relative" ref={userRef}>
                            <button
                                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                className="flex items-center gap-2 cursor-pointer"
                            >
                                {userData?.image ? (
                                    <img
                                        src={userData?.image}
                                        alt="Avatar"
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
                                        <span className="text-gray-400">N/A</span>
                                    </div>
                                )}
                            </button>
                            {isUserDropdownOpen && (
                                <div className="absolute top-full right-0 bg-gray-700 rounded shadow-lg mt-2 z-50 w-48">
                                    <div className="truncate p-2">
                                        Xin chào <span className="italic"> {" "}{userData?.name ?? userData?.email}</span>
                                    </div>
                                    <hr className="opacity-30"></hr>

                                    <Link
                                        href="/movie/favourite"
                                        onClick={() => setIsUserDropdownOpen(false)}
                                        className="flex hover:bg-gray-600 p-2 text-center items-center gap-3"
                                    >
                                        <FaHeart />
                                        Yêu thích
                                    </Link>
                                    <Link
                                        href="/user/account"
                                        onClick={() => setIsUserDropdownOpen(false)}
                                        className="flex hover:bg-gray-600 p-2 text-center items-center gap-3"

                                    >
                                        <FaUser />
                                        Quản lý tài khoản
                                    </Link>
                                    <button
                                        onClick={handleSignOut}
                                        className="flex hover:bg-gray-600 p-2 text-center items-center gap-3 w-full cursor-pointer"
                                    >
                                        <FaSignOutAlt />
                                        Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
                        >
                            Sign In
                        </Link>
                    )}
                </div>

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

            {isOpen && (
                <div className="md:hidden mt-2 space-y-2">
                    <Link href="/" className="block hover:text-gray-300">
                        Trang chủ
                    </Link>
                    <Link href="/ranking" className="block hover:text-gray-300">
                        Top Phim
                    </Link>
                    <div ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="block hover:text-gray-300 w-full text-left"
                        >
                            Thể loại
                        </button>
                        {isDropdownOpen && (
                            <div className="pl-4 space-y-1 py-2">
                                {genres.map((genre: Genre) => (
                                    <Link
                                        key={genre.id}
                                        href={`/genres/${genre.id}`}
                                        onClick={() => {
                                            setIsDropdownOpen(false);
                                            setIsOpen(false);
                                        }}
                                        className="block hover:text-gray-300"
                                    >
                                        {genre.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                    {isAdmin && (
                        <Link href="/admin" className="block hover:text-gray-300">
                            Admin
                        </Link>
                    )}
                    {status === "authenticated" ? (
                        <>

                            <Link
                                href="/movie/favourite"
                                onClick={() => setIsOpen(false)}
                                className="hover:text-gray-300 flex items-center gap-3"
                            >
                                <FaHeart />
                                Yêu thích
                            </Link>
                            <Link
                                href="/user/account"
                                onClick={() => setIsOpen(false)}
                                className="hover:text-gray-300 flex items-center gap-3"
                            >
                                <FaUser />
                                Quản lý tài khoản
                            </Link>
                            <button
                                onClick={handleSignOut}
                                className="hover:text-gray-300 flex items-center gap-3 w-full cursor-pointer"
                            >
                                <FaSignOutAlt />
                                Đăng xuất
                            </button>
                        </>
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