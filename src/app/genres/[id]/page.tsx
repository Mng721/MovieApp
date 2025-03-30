"use client";
import { useState, useEffect, use } from "react";
import { api } from "~/trpc/react";
import Link from "next/link";
import MovieCard from "~/app/_components/movieCard";
import { useRouter, useSearchParams } from "next/navigation";

interface Movie {
    id: number;
    title: string;
    poster_path: string;
    release_date: string;
    vote_count: number
}

interface GenrePageProps {
    params: { id: string };
}

export default function GenrePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const genreId = parseInt(id);

    const router = useRouter();
    const searchParams = useSearchParams();

    // Lấy số trang từ URL, mặc định là 1 nếu không có
    const initialPage = parseInt(searchParams.get("page") || "1");
    const [page, setPage] = useState(initialPage);

    // Lấy danh sách thể loại để lấy tên thể loại
    const { data: genres = [] } = api.movies.getGenres.useQuery();
    const genre = genres.find((g: any) => g.id === genreId);

    // Lấy danh sách phim theo thể loại
    const { data, isLoading } = api.movies.getMoviesByGenre.useQuery(
        { genreId, page },
    );


    // Cập nhật URL khi số trang thay đổi
    useEffect(() => {
        router.push(`/genres/${genreId}?page=${page}`, { scroll: false });
    }, [page, genreId, router]);

    const movies = data?.movies || [];
    const totalPages = data?.totalPages || 1;
    // Tạo danh sách số trang để hiển thị
    const pageNumbers = [];
    const maxPagesToShow = 5; // Số trang tối đa hiển thị trong pagination
    const startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    if (isLoading) {
        return (
            <div className="bg-gray-900 min-h-screen text-white pt-16 p-4">

                <h1 className="text-3xl font-bold mb-4">
                    Phim theo thể loại: {genre?.name || "Không xác định"}
                </h1>
                <div className="">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 min-h-screen text-white pt-16 p-4">
            <h1 className="text-3xl font-bold mb-4">
                Phim theo thể loại: {genre?.name || "Không xác định"}
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {movies.length > 0 ? (
                    movies.map((movie: Movie) => (
                        <div key={movie.id}>
                            <MovieCard movie={movie} />
                        </div>
                    ))
                ) : (
                    <p className="text-gray-400">Không có phim nào thuộc thể loại này.</p>
                )}
            </div>

            {/* Phân trang */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center mt-8 space-x-2">
                    {/* Nút Trang trước */}
                    <button
                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        disabled={page === 1}
                        className="p-2 bg-gray-700 text-white rounded disabled:opacity-50 hover:bg-gray-600 cursor-pointer"
                    >
                        Trang trước
                    </button>

                    {/* Số trang */}
                    {startPage > 1 && (
                        <>
                            <button
                                onClick={() => setPage(1)}
                                className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600 cursor-pointer"
                            >
                                1
                            </button>
                            {startPage > 2 && <span className="p-2 text-gray-400">...</span>}
                        </>
                    )}

                    {pageNumbers.map((pageNumber) => (
                        <button
                            key={pageNumber}
                            onClick={() => setPage(pageNumber)}
                            className={`p-2 rounded cursor-pointer ${page === pageNumber
                                ? "bg-blue-500 text-white"
                                : "bg-gray-700 text-white hover:bg-gray-600"
                                }`}
                        >
                            {pageNumber}
                        </button>
                    ))}

                    {endPage < totalPages && (
                        <>
                            {endPage < totalPages - 1 && <span className="p-2 text-gray-400">...</span>}
                            <button
                                onClick={() => setPage(totalPages - 1)}
                                className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600 cursor-pointer"
                            >
                                {totalPages - 1}
                            </button>
                        </>
                    )}

                    {/* Nút Trang sau */}
                    <button
                        onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={page === totalPages}
                        className="p-2 bg-gray-700 text-white rounded disabled:opacity-50 hover:bg-gray-600 cursor-pointer"
                    >
                        Trang sau
                    </button>
                </div>
            )}
        </div>
    );
}