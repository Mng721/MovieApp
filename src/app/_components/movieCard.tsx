import Link from "next/link";

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
  vote_average?: number; // Thêm trường vote_average
}

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link href={`/movie/${movie.id}`}>
      <div className="bg-gray-700 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
        <img
          src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
          alt={movie.title}
          className="w-full h-64 object-cover"
        />
        <div className="p-4">
          <h3 className="text-white font-semibold truncate">{movie.title}</h3>
          <p className="text-gray-400 text-sm">{movie.release_date}</p>
          {movie.vote_average && (
            <p className="text-yellow-400 text-sm mt-1">
              ⭐ {movie.vote_average.toFixed(1)}/10
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}