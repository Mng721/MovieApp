"use client"
import { useSession } from 'next-auth/react';
import React from 'react'
import { api } from '~/trpc/react';
import MovieCarousel from './MovieCarousel';
type Suggestion = {
    movieId: string;
    title: string;
    posterPath?: string;
    vote_average?: number;
    release_date?: string;
};
const suggestedCarousel = () => {
    const { data: session, status } = useSession();
    // Lấy danh sách phim gợi ý
    const { data: suggestions, refetch: refetchSuggestions } =
        api.movies.getMovieSuggestions.useQuery(undefined, {
            enabled: !!session,
        });

    return (
        <div>
            {session && suggestions && suggestions.length > 0 && (
                <MovieCarousel
                    isMovie={true}
                    title="Phim Đề xuất"
                    listMovies={suggestions.map((sug: Suggestion) => ({
                        id: sug.movieId,
                        title: sug.title,
                        poster_path: sug.posterPath || "",
                        vote_average: sug.vote_average,
                        release_date: sug.release_date,
                    }))}
                />
            )}
        </div>
    )
}

export default suggestedCarousel
