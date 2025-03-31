"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import TVSeriesCard from "~/app/_components/tvSeriesCard";

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

interface TVSeries {
    id: number;
    name: string;
    poster_path: string;
    backdrop_path: string | null;
    overview: string;
    first_air_date: string;
    genres: Genre[];
    number_of_seasons: number;
    number_of_episodes: number;
    vote_average: number;
    credits: {
        crew: CrewMember[];
        cast: CastMember[];
    };
    videos: {
        results: Video[];
    };
}

interface RelatedTVSeries {
    id: number;
    name: string;
    poster_path: string;
    first_air_date: string;
}

interface TVSeriesPageProps {
    params: { id: string };
}

export default function TVSeriesPage({ params }: TVSeriesPageProps) {
    const { id } = params;
    const { data: session, status } = useSession();
    const [tvSeries, setTVSeries] = useState<TVSeries | null>(null);
    const [commentContent, setCommentContent] = useState("");
    const [replyContent, setReplyContent] = useState("");
    const [replyingTo, setReplyingTo] = useState<number | null>(null);

    useEffect(() => {
        const fetchTVSeries = async () => {
            const response = await axios.get(
                `https://api.themoviedb.org/3/tv/${id}`,
                {
                    params: {
                        api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY,
                        append_to_response: "credits,videos",
                    },
                }
            );
            setTVSeries(response.data);
        };
        fetchTVSeries();
    }, [id]);

    const { data: comments, refetch: refetchComments } =
        api.comments.getCommentsByTVSeries.useQuery(
            { tvSeriesId: parseInt(id) },
            { enabled: !!tvSeries }
        );

    const { data: relatedTVSeries } = api.tv.getRelatedTVSeries.useQuery(
        { tvSeriesId: parseInt(id) },
        { enabled: !!tvSeries }
    );

    const addComment = api.comments.addCommentToTVSeries.useMutation({
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

    if (!tvSeries) {
        return <div>Đang tải...</div>;
    }

    const creator = tvSeries.credits.crew.find((member) => member.job === "Creator");
    const topCast = tvSeries.credits.cast.slice(0, 5);
    const trailer = tvSeries.videos.results.find(
        (video) => video.type === "Trailer" && video.site === "YouTube"
    );

    const handleAddComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentContent.trim()) return;
        addComment.mutate({
            tvSeriesId: parseInt(id),
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

    return (
        <div className="bg-gray-900 min-h-screen text-white pt-16">
            <div
                className="bg-cover bg-center h-[440px] max-md:h-fit"
                style={{
                    backgroundImage: tvSeries.backdrop_path
                        ? `url(https://image.tmdb.org/t/p/original${tvSeries.backdrop_path})`
                        : "none",
                    backgroundColor: tvSeries.backdrop_path ? "transparent" : "gray",
                }}
            >
                <div className="bg-gray-900/60 flex items-center h-full max-md:py-6">
                    <div className="container mx-auto px-4 flex flex-col md:flex-row gap-6">
                        <img
                            src={
                                tvSeries.poster_path
                                    ? `https://image.tmdb.org/t/p/w500${tvSeries.poster_path}`
                                    : "/images/placeholder.png"
                            }
                            alt={tvSeries.name}
                            className="w-48 md:w-64 rounded-lg shadow-lg"
                        />
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold">{tvSeries.name}</h1>
                            <p className="text-gray-400 mt-2">
                                {tvSeries.first_air_date} • {tvSeries.number_of_seasons} mùa •{" "}
                                {tvSeries.number_of_episodes} tập •{" "}
                                {tvSeries.genres.map((genre, index) => (
                                    <span key={genre.id}>
                                        <Link href={`/genres/${genre.id}`} className="hover:text-blue-500">
                                            {genre.name}
                                        </Link>
                                        {index < tvSeries.genres.length - 1 && ", "}
                                    </span>
                                ))}
                            </p>
                            <p className="text-yellow-400 mt-2">
                                ⭐ {tvSeries.vote_average.toFixed(1)}/10
                            </p>
                            <p className="mt-4">{tvSeries.overview}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1">
                        {creator && (
                            <div className="mb-6">
                                <h2 className="text-2xl font-semibold">Người tạo</h2>
                                <Link href={`/creators/${creator.id}`}>
                                    <p className="text-gray-300 mt-2 hover:text-blue-500">
                                        {creator.name}
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
                                    <Link href={`/actors/${actor.id}`} key={actor.id}>
                                        <div className="flex items-center gap-3 hover:bg-gray-800 p-2 rounded">
                                            {actor.profile_path ? (
                                                <img
                                                    src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                                                    alt={actor.name}
                                                    className="w-12 h-12 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center">
                                                    <img
                                                        src="/images/placeholder.png"
                                                        alt="Placeholder"
                                                        className="w-12 h-12 rounded-full object-cover"
                                                    />
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
                                <div className="space-y-4 bg-gray-800 p-3 rounded flex flex-col gap-1">
                                    {comments.map((comment: Comment) => (
                                        // <div></div>
                                        <div key={comment.id} className="bg-gray-800 rounded">
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
                                                            <span className="text-gray-400 select-none">N/A</span>
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
                                                                session.user.roleId === 1) && (
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
                                                                                session.user.roleId === 1) && (
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
                        {/* TV Series liên quan */}
                        <div className="mt-8">
                            <h2 className="text-2xl font-semibold mb-4">TV Series liên quan</h2>
                            {relatedTVSeries?.length ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {relatedTVSeries.slice(0, 5).map((relatedSeries: RelatedTVSeries) => (
                                        <Link key={relatedSeries.id} href={`/tv/${relatedSeries.id}`}>
                                            <TVSeriesCard tvSeries={relatedSeries} />
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400">Không có TV Series liên quan.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}