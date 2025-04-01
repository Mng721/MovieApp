"use client";
import { useState, useEffect, use } from "react";
import axios from "axios";
import Link from "next/link";
import MovieCard from "~/app/_components/movieCard";

interface Actor {
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
    character: string;
}

interface ActorPageProps {
    params: { id: string };
}

export default function ActorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [actor, setActor] = useState<Actor | null>(null);
    const [credits, setCredits] = useState<MovieCredit[]>([]);

    // Lấy thông tin diễn viên và danh sách phim
    useEffect(() => {
        const fetchActorDetails = async () => {
            try {
                // Lấy thông tin chi tiết diễn viên
                const actorResponse = await axios.get(
                    `https://api.themoviedb.org/3/person/${id}`,
                    {
                        params: {
                            api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY,
                        },
                    }
                );
                setActor(actorResponse.data);

                // Lấy danh sách phim của diễn viên
                const creditsResponse = await axios.get(
                    `https://api.themoviedb.org/3/person/${id}/movie_credits`,
                    {
                        params: {
                            api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY,
                        },
                    }
                );
                // Lọc và sắp xếp phim theo ngày phát hành (mới nhất trước)
                const sortedCredits = creditsResponse.data.cast
                    .sort(
                        (a: MovieCredit, b: MovieCredit) =>
                            new Date(b.release_date).getTime() -
                            new Date(a.release_date).getTime()
                    )
                    .slice(0, 10); // Lấy 10 phim đầu tiên
                setCredits(sortedCredits);
            } catch (error) {
                console.error("Error fetching actor details:", error);
            }
        };
        fetchActorDetails();
    }, [id]);

    if (!actor) {
        return <div className="bg-gray-900 min-h-screen text-white p-4">Đang tải...</div>;
    }

    return (
        <div className="bg-gray-900 min-h-screen text-white">
            {/* Header với thông tin cơ bản */}
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Ảnh đại diện */}
                    <div className="flex-shrink-0">
                        {actor.profile_path ? (
                            <img
                                src={`https://image.tmdb.org/t/p/w300${actor.profile_path}`}
                                alt={actor.name}
                                className="w-48 md:w-64 rounded-lg shadow-lg"
                            />
                        ) : (
                            <div className="w-48 md:w-64 h-72 bg-gray-600 rounded-lg flex items-center justify-center">
                                <span className="text-gray-400">Không có ảnh</span>
                            </div>
                        )}
                    </div>

                    {/* Thông tin diễn viên */}
                    <div className="flex-1">
                        <h1 className="text-4xl font-bold">{actor.name}</h1>
                        <p className="text-gray-400 mt-2">
                            {actor.known_for_department} •{" "}
                            {actor.birthday && `Sinh: ${actor.birthday}`}
                            {actor.place_of_birth && ` • Nơi sinh: ${actor.place_of_birth}`}
                        </p>
                        <div className="mt-4">
                            <h2 className="text-2xl font-semibold">Tiểu sử</h2>
                            <p className="text-gray-300 mt-2">
                                {actor.biography || "Không có tiểu sử."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Danh sách phim nổi bật */}
            <div className="container mx-auto px-4 py-8">
                <h2 className="text-2xl font-semibold mb-4">Phim nổi bật</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {credits.map((credit) => (
                        <div key={credit.id}>
                            <MovieCard
                                movie={{
                                    id: credit.id,
                                    title: credit.title,
                                    poster_path: credit.poster_path || "",
                                    release_date: credit.release_date,
                                }}
                            />
                            <p className="text-gray-400 text-sm mt-2">
                                Vai: {credit.character || "Không xác định"}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}