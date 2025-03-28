"use client";
import { use, useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MovieCard from "../_components/movieCard";

export default function MoviesPage({
    searchParams,
}: {
    searchParams: { q?: string };
}) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const query = searchParams.q || "";

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
        <div className="p-4 bg-gray-900">
            <h1 className="text-2xl mb-4 text-white">Tìm kiếm phim</h1>
            {/* Danh sách phim từ TMDB */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {movies?.map((movie: any, index: number) => (
                    <Link href={`/movie/${movie.id}`} key={`search-${index}`}>
                        <MovieCard movie={movie}></MovieCard>
                    </Link>
                ))}
            </div>

            {/* Danh sách phim yêu thích */}
            <h1 className="text-2xl mb-4">Phim yêu thích</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {favorites?.map((fav, index: number) => (
                    <Link href={`/movie/${fav.movieId}`} key={`fav-${index}`}>
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