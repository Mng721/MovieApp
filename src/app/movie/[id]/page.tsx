import axios from "axios";

interface Genre {
    id: number;
    name: string;
}

interface CrewMember {
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

interface MoviePageProps {
    params: { id: string };
}

export default async function MoviePage({ params }: MoviePageProps) {
    const { id } = params;

    // Lấy thông tin chi tiết phim từ TMDB, bao gồm credits và videos
    const response = await axios.get(
        `https://api.themoviedb.org/3/movie/${id}`,
        {
            params: {
                api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY,
                append_to_response: "credits,videos", // Lấy thêm credits và videos
            },
        }
    );
    const movie: Movie = response.data;

    // Lấy đạo diễn từ credits
    const director = movie.credits.crew.find((member) => member.job === "Director");

    // Lấy 5 diễn viên đầu tiên
    const topCast = movie.credits.cast.slice(0, 5);

    // Lấy trailer (ưu tiên YouTube)
    const trailer = movie.videos.results.find(
        (video) => video.type === "Trailer" && video.site === "YouTube"
    );

    return (
        <div className="bg-gray-900 min-h-screen text-white">
            {/* Background với backdrop */}
            <div
                className="relative bg-cover bg-center h-96"
                style={{
                    backgroundImage: movie.backdrop_path
                        ? `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`
                        : "none",
                    backgroundColor: movie.backdrop_path ? "transparent" : "gray",
                }}
            >
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center">
                    <div className="container mx-auto px-4 flex flex-col md:flex-row gap-6">
                        {/* Poster */}
                        <img
                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                            alt={movie.title}
                            className="w-48 md:w-64 rounded-lg shadow-lg"
                        />
                        {/* Thông tin chính */}
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold">{movie.title}</h1>
                            <p className="text-gray-400 mt-2">
                                {movie.release_date} • {movie.runtime} phút •{" "}
                                {movie.genres.map((genre) => genre.name).join(", ")}
                            </p>
                            <p className="text-yellow-400 mt-2">
                                ⭐ {movie.vote_average.toFixed(1)}/10
                            </p>
                            <p className="mt-4">{movie.overview}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Thông tin chi tiết */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Cột bên trái: Đạo diễn và Trailer */}
                    <div className="md:col-span-1">
                        {/* Đạo diễn */}
                        {director && (
                            <div className="mb-6">
                                <h2 className="text-2xl font-semibold">Đạo diễn</h2>
                                <p className="text-gray-300 mt-2">{director.name}</p>
                            </div>
                        )}

                        {/* Trailer */}
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

                    {/* Cột bên phải: Diễn viên và Thông tin khác */}
                    <div className="md:col-span-2">
                        {/* Diễn viên */}
                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold">Diễn viên</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                                {topCast.map((actor) => (
                                    <div key={actor.id} className="flex items-center gap-3">
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
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}