"use client";
import { useState, useEffect, use } from "react";
import axios from "axios";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
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

interface Comment {
    id: number;
    content: string;
    createdAt: Date;
    userId: string;
    userName: string | null;
    userEmail: string | null;
    userAvatar: string | null;
    replies: Reply[]
}

interface Reply {
    id: number;
    content: string;
    createdAt: Date;
    userId: string;
    userName: string | null;
    userEmail: string | null;
    userAvatar: string | null;
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
    const [movie, setMovie] = useState<Movie | null>(null);
    const [commentContent, setCommentContent] = useState("");
    const [replyContent, setReplyContent] = useState("");
    const [replyingTo, setReplyingTo] = useState<number | null>(null);

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


    const { data: comments, refetch: refetchComments } =
        api.comments.getCommentsByMovie.useQuery(
            { movieId: parseInt(id) },
            { enabled: !!movie }
        );

    console.log(comments)
    const addComment = api.comments.addComment.useMutation({
        onSuccess: () => {
            setCommentContent("");
            refetchComments();
        },
    });

    const addReply = api.comments.addReply.useMutation({
        onSuccess: () => {
            setReplyContent("");
            setReplyingTo(null);
            refetchComments();
        },
    });

    const deleteComment = api.comments.deleteComment.useMutation({
        onSuccess: () => {
            refetchComments();
        },
    });

    const deleteReply = api.comments.deleteReply.useMutation({
        onSuccess: () => {
            refetchComments();
        },
    });

    const isFavorite = favorites?.some((fav) => fav.movieId === parseInt(id));

    const addFavorite = api.movies.addFavorite.useMutation({
        onSuccess: () => {
            refetchFavorites();
        },
    });

    const removeFavorite = api.movies.removeFavorite.useMutation({
        onSuccess: () => {
            refetchFavorites();
            alert("Đã xóa khỏi yêu thích!");
        },
    });

    const handleAddComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentContent.trim()) return;
        addComment.mutate({
            movieId: parseInt(id),
            content: commentContent,
        });
    };

    const handleAddReply = (e: React.FormEvent, commentId: number) => {
        e.preventDefault();
        if (!replyContent.trim()) return;
        addReply.mutate({
            commentId,
            content: replyContent,
        });
    };

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
                                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded cursor-pointer"
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

                        {/* Phần bình luận */}
                        <div className="mt-8">
                            <h2 className="text-2xl font-semibold mb-4">Bình luận</h2>
                            {/* Form thêm bình luận */}
                            {session ? (
                                <form onSubmit={handleAddComment} className="mb-6">
                                    <textarea
                                        value={commentContent}
                                        onChange={(e) => setCommentContent(e.target.value)}
                                        placeholder="Viết bình luận của bạn..."
                                        className="w-full p-3 bg-gray-700 text-white rounded resize-y min-h-[100px]"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        className="mt-2 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                                    >
                                        Gửi bình luận
                                    </button>
                                </form>
                            ) : (
                                <p className="text-gray-400 mb-4">
                                    Vui lòng <Link href="/login" className="text-blue-500">đăng nhập</Link> để bình luận.
                                </p>
                            )}

                            {/* Danh sách bình luận */}
                            {comments?.length ? (
                                <div className="space-y-4">
                                    {comments.map((comment: Comment) => (
                                        // <div></div>
                                        <div key={comment.id} className="p-3 bg-gray-800 rounded">
                                            <div className="flex gap-3">
                                                <div>
                                                    {comment.userAvatar ? (
                                                        <img
                                                            src={comment.userAvatar}
                                                            alt={comment.userName ?? "image-user"}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                            onError={(e) => (e.currentTarget.src = "/assets/images/account.png")}
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                                                            <span className="text-gray-400">N/A</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-semibold">{comment.userName ?? comment.userEmail}</p>
                                                        <p className="text-gray-400 text-sm">
                                                            {formatDistanceToNow(new Date(comment.createdAt.getTime() - (7 * 60 * 60 * 1000)), {
                                                                addSuffix: true,
                                                                locale: vi,
                                                            })}
                                                        </p>
                                                    </div>
                                                    <p className="text-gray-300">{comment.content}</p>
                                                    <div className="flex gap-2 mt-1">
                                                        {session && (
                                                            <button
                                                                onClick={() => setReplyingTo(comment.id)}
                                                                className="text-blue-500 hover:text-blue-600 text-sm"
                                                            >
                                                                Trả lời
                                                            </button>
                                                        )}
                                                        {session &&
                                                            (session.user.id === comment.userId.toString() ||
                                                                session.user.roleId === 2) && (
                                                                <button
                                                                    onClick={() => deleteComment.mutate({ commentId: comment.id })}
                                                                    className="text-red-500 hover:text-red-600 text-sm"
                                                                >
                                                                    Xóa
                                                                </button>
                                                            )}
                                                    </div>

                                                    {/* Form trả lời */}
                                                    {replyingTo === comment.id && (
                                                        <form
                                                            onSubmit={(e) => handleAddReply(e, comment.id)}
                                                            className="mt-3"
                                                        >
                                                            <textarea
                                                                value={replyContent}
                                                                onChange={(e) => setReplyContent(e.target.value)}
                                                                placeholder="Viết trả lời của bạn..."
                                                                className="w-full p-2 bg-gray-700 text-white rounded resize-y min-h-[80px]"
                                                                required
                                                            />
                                                            <div className="flex gap-2 mt-2">
                                                                <button
                                                                    type="submit"
                                                                    className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                                                                >
                                                                    Gửi
                                                                </button>
                                                                <button
                                                                    onClick={() => setReplyingTo(null)}
                                                                    className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
                                                                >
                                                                    Hủy
                                                                </button>
                                                            </div>
                                                        </form>
                                                    )}

                                                    {/* Danh sách trả lời */}
                                                    {comment.replies?.length > 0 && (
                                                        <div className="mt-3 space-y-2 pl-6 border-l-2 border-gray-600">
                                                            {comment.replies.map((reply: Reply) => (
                                                                <div key={reply.id} className="flex gap-3">
                                                                    <div>
                                                                        {reply.userAvatar ? (
                                                                            <img
                                                                                src={reply.userAvatar}
                                                                                alt={reply.userName ?? "image-user"}
                                                                                className="w-8 h-8 rounded-full object-cover"
                                                                                onError={(e) => (e.currentTarget.src = "/assets/images/account.png")}
                                                                            />
                                                                        ) : (
                                                                            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
                                                                                <span className="text-gray-400">N/A</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-2">
                                                                            <p className="font-semibold text-sm">{reply.userName ?? reply.userEmail}</p>
                                                                            <p className="text-gray-400 text-xs">
                                                                                {formatDistanceToNow(new Date(reply.createdAt.getTime() - (7 * 60 * 60 * 1000)), {
                                                                                    addSuffix: true,
                                                                                    locale: vi,
                                                                                })}
                                                                            </p>
                                                                        </div>
                                                                        <p className="text-gray-300 text-sm">{reply.content}</p>
                                                                        {session &&
                                                                            (session.user.id === reply.userId.toString() ||
                                                                                session.user.roleId === 2) && (
                                                                                <button
                                                                                    onClick={() =>
                                                                                        deleteReply.mutate({ replyId: reply.id })
                                                                                    }
                                                                                    className="text-red-500 hover:text-red-600 text-xs mt-1"
                                                                                >
                                                                                    Xóa
                                                                                </button>
                                                                            )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400">Chưa có bình luận nào.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}