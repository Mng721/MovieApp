"use client";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MoviesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [query, setQuery] = useState("");

    // Gọi API TMDB để tìm phim
    const { data: movies, refetch } = api.movies.searchMovies.useQuery(
        { query },
        { enabled: false }
    );

    // Lấy danh sách phim yêu thích
    const { data: favorites, refetch: refetchFavorites } =
        api.movies.getFavorites.useQuery(undefined, {
            enabled: !!session,
        });

    // Thêm phim yêu thích
    const addFavorite = api.movies.addFavorite.useMutation({
        onSuccess: () => refetchFavorites(),
    });

    // Xóa phim yêu thích
    const removeFavorite = api.movies.removeFavorite.useMutation({
        onSuccess: () => refetchFavorites(),
    });

    const handleSearch = () => {
        refetch();
    };

    // Xử lý redirect khi không có session
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    // Hiển thị loading khi đang kiểm tra session
    if (status === "loading") {
        return <div>Đang tải...</div>;
    }

    // Nếu không có session, không render gì (đã xử lý redirect trong useEffect)
    if (!session) {
        return null;
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl mb-4">Tìm kiếm phim</h1>
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Nhập tên phim..."
                    className="p-2 border w-64"
                />
                <button onClick={handleSearch} className="bg-blue-500 text-white p-2">
                    Tìm kiếm
                </button>
            </div>

            {/* Danh sách phim từ TMDB */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {movies?.map((movie: any) => (
                    <Link href={`/movie/${movie.id}`}>
                        <div key={movie.id} className="border p-4">
                            <img
                                src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                                alt={movie.title}
                                className="mb-2"
                            />
                            <h2 className="text-lg">{movie.title}</h2>
                            <button
                                onClick={() =>
                                    addFavorite.mutate({
                                        movieId: movie.id,
                                        title: movie.title,
                                        posterPath: movie.poster_path,
                                    })
                                }
                                className="bg-green-500 text-white p-2 mt-2"
                            >
                                Thêm vào yêu thích
                            </button>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Danh sách phim yêu thích */}
            <h1 className="text-2xl mb-4">Phim yêu thích</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {favorites?.map((fav) => (
                    <Link href={`/movie/${fav.movieId}`}>
                        <div key={fav.id} className="border p-4">
                            <img
                                src={`https://image.tmdb.org/t/p/w200${fav.posterPath}`}
                                alt={fav.title}
                                className="mb-2"
                            />
                            <h2 className="text-lg">{fav.title}</h2>
                            <button
                                onClick={() => removeFavorite.mutate({ id: fav.id })}
                                className="bg-red-500 text-white p-2 mt-2"
                            >
                                Xóa
                            </button>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}