"use client"
import { useSession } from 'next-auth/react';
import React from 'react'
import { api } from "~/trpc/react";
import MovieCarousel from './MovieCarousel';

const favCarousel = () => {

    const { data: session, status } = useSession();

    // Lấy danh sách phim yêu thích
    const { data: favorites, refetch: refetchFavorites } =
        api.movies.getFavorites.useQuery(undefined, {
            enabled: !!session,
        });
    return (
        <div>
            {session && favorites && (
                <MovieCarousel
                    isMovie={true}
                    title="Phim Yêu Thích"
                    listMovies={favorites.map((fav) => ({
                        id: fav.movieId,
                        title: fav.title,
                        poster_path: fav.posterPath || "",
                    }))}
                />
            )}
        </div>
    )
}

export default favCarousel
