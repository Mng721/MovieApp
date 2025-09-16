"use client";
import { use, useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MoviesPage({
}: {
    }) {
    const { data: session, status } = useSession();
    const router = useRouter();


    // Lấy danh sách phim yêu thích
    const { data: favorites, refetch: refetchFavorites } =
        api.movies.getFavorites.useQuery(undefined, {
            enabled: !!session,
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
        <div className="p-4 bg-gray-900 min-h-screen">
            <div className="container mx-auto bg-gray-900">

                {/* Danh sách phim yêu thích */}
                <h1 className="text-2xl mb-4 text-white">Phim yêu thích</h1>
                <div className="flex flex-wrap gap-3">
                    {favorites?.map((fav, index: number) => (
                        <div className="relative w-44">
                            <Link href={`/movie/${fav.movieId}`} key={`fav-${index}`} className="w-full">
                                <div key={fav.id} className=" w-full overflow-hidden">
                                    <img
                                        src={`https://image.tmdb.org/t/p/w200${fav.posterPath}`}
                                        alt={fav.title}
                                        className="mb-2 hover:opacity-80 rounded"
                                    />
                                    <p className="text-lg text-white truncate text-center">{fav.title}</p>
                                </div>
                            </Link>
                            <button
                                onClick={() => removeFavorite.mutate({ id: fav.id })}
                                className="bg-gray-300/70 p-2 text-black top-1 right-1 rounded absolute aspect-square cursor-pointer hover:bg-white/70"
                            >
                                x
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}