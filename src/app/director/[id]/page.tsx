"use client";
import { useState, useEffect, use } from "react";
import axios from "axios";
import Link from "next/link";
import MovieCard from "~/app/_components/movieCard";
import { api } from "~/trpc/react";

interface Director {
    id: number;
    name: string;
    profile_path: string | null;
    birthday: string | null;
    place_of_birth: string | null;
    biography: string;
    known_for_department: string;
}

interface MovieCredit {
    id: number;
    title: string;
    poster_path: string | null;
    release_date: string;
    vote_count: number;
    vote_average: number
}


export default function DirectorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [director, setDirector] = useState<Director | null>(null);
    const [credits, setCredits] = useState<MovieCredit[]>([]);
    const [awardsList, setAwardsList] = useState<any[]>([]);
    // Lấy thông tin đạo diễn và danh sách phim
    useEffect(() => {
        const fetchDirectorDetails = async () => {
            try {
                // Lấy thông tin chi tiết đạo diễn
                const directorResponse = await axios.get(
                    `https://api.themoviedb.org/3/person/${id}`,
                    {
                        params: {
                            api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY,
                            append_to_response: "movie_credits",
                        },
                    }
                );
                setDirector(directorResponse.data);

                // Lấy danh sách phim của đạo diễn
                const creditsResponse = await axios.get(
                    `https://api.themoviedb.org/3/person/${id}/movie_credits`,
                    {
                        params: {
                            api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY,
                        },
                    }
                );

                // Lọc các phim mà người này làm đạo diễn và sắp xếp theo ngày phát hành (mới nhất trước)
                const directedMovies = creditsResponse.data.crew
                    .filter((credit: any) => credit.job === "Director")
                    .sort(
                        (a: MovieCredit, b: MovieCredit) =>
                            new Date(b.release_date).getTime() -
                            new Date(a.release_date).getTime()
                    )
                    .slice(0, 10); // Lấy 10 phim đầu tiên
                setCredits(directedMovies);

                // setAwardsList(awards || []);
            } catch (error) {
                console.error("Error fetching director details:", error);
            }
        };
        fetchDirectorDetails();
    }, [id]);

    const { data: awards, refetch: refetchAwards } = api.awards.getAwardsByDirector.useQuery(
        { directorId: Number(525) },
        {
            enabled: !!director, // Chỉ chạy khi thông tin đạo diễn đã được tải
        }
    );

    useEffect(() => {
        if (awards) {
            setAwardsList(awards);
        }
    }, [awards]);

    if (!director) {
        return <div className="bg-gray-900 min-h-screen text-white pt-16 grid place-items-center text-4xl">Đang tải...</div>;
    }

    return (
        <div className="bg-gray-900 min-h-screen text-white pt-16">
            {/* Thêm pt-16 để tránh chồng lấn với navbar */}
            {/* Header với thông tin cơ bản */}
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Ảnh đại diện */}
                    <div className="flex-shrink-0">
                        {director.profile_path ? (
                            <img
                                src={`https://image.tmdb.org/t/p/w300${director.profile_path}`}
                                alt={director.name}
                                className="w-48 md:w-64 rounded-lg shadow-lg"
                            />
                        ) : (
                            <div className="w-48 md:w-64 h-72 bg-gray-600 rounded-lg flex items-center justify-center">
                                <span className="text-gray-400">Không có ảnh</span>
                            </div>
                        )}
                    </div>

                    {/* Thông tin đạo diễn */}
                    <div className="flex-1">
                        <h1 className="text-4xl font-bold">{director.name}</h1>
                        <p className="text-gray-400 mt-2">
                            {director.known_for_department} •{" "}
                            {director.birthday && `Sinh: ${director.birthday}`}
                            {director.place_of_birth && ` • Nơi sinh: ${director.place_of_birth}`}
                        </p>
                        <div className="mt-4">
                            <h2 className="text-2xl font-semibold">Tiểu sử</h2>
                            <p className="text-gray-300 mt-2">
                                {director.biography || "Không có tiểu sử."}
                            </p>
                        </div>
                        <div className="mt-4">
                            <h2 className="text-2xl font-semibold">Giải thưởng</h2>
                            {awardsList.length > 0 ? (
                                <ul className="list-disc list-inside mt-2">
                                    {awardsList.map((award) => (
                                        <li key={award.id}>
                                            {award.name} ({award.year}) - {award.category}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-400 mt-2">Không có dữ liệu giải thưởng.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Danh sách phim nổi bật */}
            <div className="container mx-auto px-4 py-8">
                <h2 className="text-2xl font-semibold mb-4">Phim nổi bật</h2>
                {credits.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        {credits.map((credit) => (
                            <div key={credit.id}>
                                <MovieCard
                                    movie={{
                                        vote_count: credit.vote_count,
                                        id: credit.id,
                                        title: credit.title,
                                        poster_path: credit.poster_path || "",
                                        release_date: credit.release_date,
                                        vote_average: credit.vote_average
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400">Không có phim nào để hiển thị.</p>
                )}
            </div>
        </div>
    );
}