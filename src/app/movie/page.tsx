"use client";
import { use, useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MovieCard from "~/app/_components/movieCard";

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
        return <div className="flex min-h-svh flex-1 justify-center items-center bg-gray-900 text-4xl text-white">Đang tải...</div>;
    }

    if (!query) {
        return <div className="flex min-h-svh flex-1 justify-center items-center bg-gray-900 text-4xl text-white">Có phải bạn cần tìm gì không?</div>
    }
    // Nếu không có session, không render gì (đã xử lý redirect trong useEffect)
    if (!session) {
        return null;
    }

    return (
        <div className="p-4 bg-gray-900 min-h-screen">
            <h1 className="text-2xl mb-4 text-white">{`Phim với từ khóa "${query}"`}</h1>
            {/* Danh sách phim từ TMDB */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {movies?.map((movie: any, index: number) => (
                    <Link href={`/movie/${movie.id}`} key={`search-${index}`}>
                        <MovieCard movie={movie}></MovieCard>
                    </Link>
                ))}
            </div>
        </div>
    );
}