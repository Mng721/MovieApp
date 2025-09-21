"use client";
import { useState } from "react";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import MovieCard from "./movieCard";

// Define the Genre type if not imported from elsewhere
type Genre = {
    id: number;
    name: string;
};

export default function FavoritesList() {
    const { data: session } = useSession();
    const [genreId, setGenreId] = useState<number | undefined>(undefined);
    const [sortBy, setSortBy] = useState<"vote_average.desc" | "vote_average.asc" | undefined>(
        undefined
    );

    const { data, isLoading, error } = api.movies.getFavoritesWithDetails.useQuery(
        { genreId, sortBy },
        { enabled: !!session }
    );

    console.log(data, "genres: ", data?.genres);

    const genres: Genre[] = data?.genres || [];
    const movies = data?.movies || [];
    const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setGenreId(value ? parseInt(value) : undefined);
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value as "vote_average.desc" | "vote_average.asc" | "";
        setSortBy(value || undefined);
    };
    if (isLoading) {
        return <div className="bg-gray-900 text-white grid min-h-screen place-items-center text-4xl">Đang tải...</div>;
    }
    if (error) {
        return <div className="bg-gray-900 text-red-500 grid min-h-screen place-items-center text-4xl">Lỗi: {error.message}</div>;
    }
    if (!session) {
        return <div className="bg-gray-900 text-white grid min-h-screen place-items-center text-4xl">Vui lòng đăng nhập để xem danh sách yêu thích.</div>;
    }
    return (
        <div className="p-4 bg-gray-900 text-white flex flex-col min-h-screen">
            <h1 className="text-2xl font-bold mb-4 text-white">Danh Sách Yêu Thích</h1>
            <div className="mb-4 flex space-x-4">
                <div>
                    <label className="text-white mr-2">Lọc theo thể loại:</label>
                    <select
                        value={genreId || ""}
                        onChange={handleGenreChange}
                        className="p-2 rounded bg-gray-800 text-white"
                    >
                        <option value="">Tất cả</option>
                        {genres.map((genre) => (
                            <option key={genre.id} value={genre.id}>
                                {genre.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-white mr-2">Sắp xếp theo điểm:</label>
                    <select
                        value={sortBy || ""}
                        onChange={handleSortChange}
                        className="p-2 rounded bg-gray-800 text-white"
                    >
                        <option value="">Mặc định</option>
                        <option value="vote_average.desc">Cao đến Thấp</option>
                        <option value="vote_average.asc">Thấp đến Cao</option>
                    </select>
                </div>
            </div>
            {movies.length === 0 ? (
                <div className="text-white">Không có phim yêu thích nào.</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {movies.map((movie) => (
                        <MovieCard key={movie.id} movie={movie} />
                    ))}
                </div>
            )}
        </div>
    );
}