"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import MovieCard from "./movieCard";
import TVSeriesCard from "./tvSeriesCard";

interface Movie {
    id: number;
    title: string;
    poster_path: string;
    release_date: string | null;
    vote_average?: number;
    name?: string;
    first_air_date?: string

}

interface MovieCarouselProps {
    url?: string;
    title: string;
    isMovie?: boolean;
    listMovies?: Movie[];

}

export default function MovieCarousel({ url, title, isMovie = true, listMovies }: MovieCarouselProps) {
    const [movies, setMovies] = useState<Movie[]>([]);

    // Nếu có listMovies truyền vào, sử dụng nó thay vì fetch từ API
    useEffect(() => {
        if (listMovies && listMovies.length > 0) {
            setMovies(listMovies);
        }
    }, [listMovies]);

    // Fetch phim từ API nếu không có listMovies
    useEffect(() => {
        if (!url) return
        const fetchMovies = async () => {
            try {
                const response = await axios.get(
                    `https://api.themoviedb.org/3${url}`,
                    {
                        params: {
                            api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY,
                            language: "vi-VN"
                        },
                    }
                );
                setMovies(response.data.results);
            } catch (error) {
                console.error("Error fetching movies:", error);
            }
        };
        fetchMovies();
    }, [url]);

    if (!movies.length) {
        return <div>Đang tải...</div>;
    }

    return (
        <div className="py-8">
            <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={16}
                slidesPerView={5}
                navigation
                autoplay={{
                    delay: 3000,
                    pauseOnMouseEnter: true,
                }}
                breakpoints={{
                    320: { slidesPerView: 2 },
                    640: { slidesPerView: 3 },
                    1024: { slidesPerView: 5 },
                }}
                loop={true}
            >
                {movies.map((movie) => (
                    <SwiperSlide key={isMovie ? `movie-${movie.id}` : `tv-${movie.id}`}>
                        {isMovie ?
                            <MovieCard movie={{
                                id: movie.id,
                                title: movie.title,
                                poster_path: movie.poster_path || "",
                                vote_average: movie.vote_average ?? 0,
                                release_date: movie.release_date ?? "",
                                genre: [], // Thêm trường genre để tránh lỗi
                            }}></MovieCard> :
                            <TVSeriesCard tvSeries={
                                {
                                    id: movie.id,
                                    name: movie.name,
                                    poster_path: movie.poster_path,
                                    first_air_date: movie.first_air_date,
                                    vote_average: movie.vote_average
                                }
                            }

                            ></TVSeriesCard>}
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}