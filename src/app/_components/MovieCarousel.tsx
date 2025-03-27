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

interface Movie {
    id: number;
    title: string;
    poster_path: string;
    release_date: string;
    vote_average?: number;
}

interface MovieCarouselProps {
    url: string;
    title: string;
}

export default function MovieCarousel({ url, title }: MovieCarouselProps) {
    const [movies, setMovies] = useState<Movie[]>([]);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const response = await axios.get(
                    `https://api.themoviedb.org/3${url}`,
                    {
                        params: {
                            api_key: process.env.NEXT_PUBLIC_TMDB_API_KEY,
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
                autoplay={{ delay: 10000 }}
                breakpoints={{
                    320: { slidesPerView: 2 },
                    640: { slidesPerView: 3 },
                    1024: { slidesPerView: 5 },
                }}
            >
                {movies.map((movie) => (
                    <SwiperSlide key={movie.id}>
                        <MovieCard movie={{
                            id: movie.id,
                            title: movie.title,
                            poster_path: movie.poster_path || "",
                            vote_average: movie.vote_average,
                            release_date: movie.release_date, // Có thể thêm trường release_date vào favoriteMovies nếu cần
                        }}></MovieCard>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}