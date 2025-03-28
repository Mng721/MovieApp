"use client";
import { useState, useEffect, use } from "react";
import axios from "axios";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Genre {
    id: number;
    name: string;
}

interface CrewMember {
    profile_path: any;
    id: number;
    name: string;
    job: string;
}

interface CastMember {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
}

interface Video {
    key: string;
    type: string;
    site: string;
}

interface Movie {
    vote_count: number;
    id: number;
    title: string;
    poster_path: string;
    backdrop_path: string | null;
    overview: string;
    release_date: string;
    genres: Genre[];
    runtime: number;
    vote_average: number;
    credits: {
        crew: CrewMember[];
        cast: CastMember[];
    };
    videos: {
        results: Video[];
    };
}

export default function MoviePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: session, status } = useSession();
    const router = useRouter();
    const [movie, setMovie] = useState<Movie | null>(null);

    useEffect(() => {
        const fetchMovie = async () => {
            const response = await axios.get(
                `https://api.themoviedb.org/3/movie/${id}`,
                {
                    params: {
                        api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY,
                        append_to_response: "credits,videos",
                    },
                }
            );
            setMovie(response.data);
        };
        fetchMovie();
    }, [id]);

    const { data: favorites, refetch: refetchFavorites } =
        api.movies.getFavorites.useQuery(undefined, {
            enabled: !!session,
        });

    const isFavorite = favorites?.some((fav) => fav.movieId === parseInt(id));

    const addFavorite = api.movies.addFavorite.useMutation({
        onSuccess: () => {
            refetchFavorites();
            alert("Đã thêm vào yêu thích!");
        },
    });

    const removeFavorite = api.movies.removeFavorite.useMutation({
        onSuccess: () => {
            refetchFavorites();
            alert("Đã xóa khỏi yêu thích!");
        },
    });

    if (!movie) {
        return <div>Đang tải...</div>;
    }

    const director = movie.credits.crew.find((member) => member.job === "Director");
    const topCast = movie.credits.cast.slice(0, 5);
    const trailer = movie.videos.results.find(
        (video) => video.type === "Trailer" && video.site === "YouTube"
    );

    return (
        <div className="bg-gray-900 text-white flex flex-col min-h-screen">
            {/* Thêm pt-16 (padding-top) để bù đắp chiều cao của navbar */}
            <div
                className="bg-cover bg-center h-[440px] max-md:h-fit"
                style={{
                    backgroundImage: movie.backdrop_path
                        ? `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`
                        : "none",
                    backgroundColor: movie.backdrop_path ? "transparent" : "gray",
                }}
            >
                <div className="bg-gray-900/50 flex items-center h-full max-md:py-6">
                    <div className="container mx-auto px-4 flex flex-col md:flex-row gap-6">
                        <img
                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                            alt={movie.title}
                            className="w-48 md:w-64 rounded-lg shadow-lg"
                        />
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold">{movie.title}</h1>
                            <p className="text-gray-400 mt-2">
                                {movie.release_date} • {movie.runtime} phút •{" "}
                                {movie.genres.map((genre, index) => (
                                    <span key={genre.id}>
                                        <Link href={`/genres/${genre.id}`} className="hover:text-blue-500">
                                            {genre.name}
                                        </Link>
                                        {index < movie.genres.length - 1 && ", "}
                                    </span>
                                ))}
                            </p>
                            <p className="text-yellow-400 mt-2">
                                ⭐ {movie.vote_average.toFixed(1)}/10 <span className="text-gray-400">{`(${movie.vote_count})`}</span>
                            </p>
                            <p className="mt-4">{movie.overview}</p>
                            {session && (
                                <div className="mt-4">
                                    {isFavorite ? (
                                        <button
                                            onClick={() => {
                                                const favorite = favorites?.find(
                                                    (fav) => fav.movieId === parseInt(id)
                                                );
                                                if (favorite) {
                                                    removeFavorite.mutate({ id: favorite.id });
                                                }
                                            }}
                                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                                        >
                                            Xóa khỏi yêu thích
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() =>
                                                addFavorite.mutate({
                                                    movieId: movie.id,
                                                    title: movie.title,
                                                    posterPath: movie.poster_path,
                                                })
                                            }
                                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                                        >
                                            Thêm vào yêu thích
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="md:grid max-md:flex max-md:flex-col md:grid-cols-3 gap-8">
                    <div className="md:col-span-1">
                        {director && (
                            <div className="mb-6">
                                <h2 className="text-2xl font-semibold mb-4">Đạo diễn</h2>
                                <Link href={`/director/${director.id}`} className="flex items-center gap-4 hover:bg-gray-800 p-2 rounded">
                                    {director.profile_path ? (
                                        <img
                                            src={`https://image.tmdb.org/t/p/w200${director.profile_path}`}
                                            alt={director.name}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center">
                                            <span className="text-gray-400">N/A</span>
                                        </div>
                                    )}
                                    <p className="text-gray-300 mt-2">
                                        {director.name}
                                    </p>
                                </Link>
                            </div>
                        )}
                        {trailer && (
                            <div>
                                <h2 className="text-2xl font-semibold">Trailer</h2>
                                <div className="mt-4">
                                    <iframe
                                        width="100%"
                                        height="200"
                                        src={`https://www.youtube.com/embed/${trailer.key}`}
                                        title="Trailer"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="md:col-span-2">
                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold">Diễn viên</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                                {topCast.map((actor) => (
                                    <Link href={`/actor/${actor.id}`} key={actor.id}>
                                        <div className="flex items-center gap-3 hover:bg-gray-800 p-2 rounded">
                                            {actor.profile_path ? (
                                                <img
                                                    src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                                                    alt={actor.name}
                                                    className="w-12 h-12 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center">
                                                    <span className="text-gray-400">N/A</span>
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-gray-300">{actor.name}</p>
                                                <p className="text-gray-500 text-sm">{actor.character}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}