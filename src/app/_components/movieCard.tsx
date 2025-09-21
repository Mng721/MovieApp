import Link from "next/link";
import { FaRegPlayCircle } from "react-icons/fa";
interface Movie {
  vote_count?: number;
  id: number;
  title: string;
  poster_path?: string;
  release_date?: string;
  vote_average: number; // Thêm trường vote_average
  genre: { id: number; name: string }[]; // Thêm trường genre
}

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link href={`/movie/${movie.id}`}>
      <div className="bg-gray-700 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group">
        <div
          className="w-full h-64 relative">
          <img
            src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
            alt={movie.title}
            className="w-full h-full object-cover"
            onError={(e) => (e.currentTarget.src = "/assets/images/movie.jpg")}
          />
          <div
            className="absolute inset-0 group-hover:bg-black/50 flex items-center justify-center">
            <FaRegPlayCircle className="h-6 w-6 invisible group-hover:visible transition duration-300 ease-in-out group-hover:scale-200 text-white" />
          </div>
        </div>
        <div className="p-4 group-hover:bg-black/20">
          <h3 className="text-white font-semibold truncate transition duration-300 group-hover:text-white/50">{movie.title}</h3>
          <p className="text-gray-400 text-sm">{movie.release_date}</p>
          {movie.vote_average ? (
            <p className="text-yellow-400 text-sm mt-1">
              ⭐ {(+movie.vote_average).toFixed(1)}/10
            </p>
          ) : (<div className="text-yellow-400 text-sm mt-1">⭐ N/A</div>)}
          {movie.genre && <div className="mt-2">
            {movie.genre.slice(0, 3).map((g) => (
              <span
                key={g.id}
                className="text-xs text-gray-300 bg-gray-800 rounded-full px-2 py-1 mr-1"
              >
                {g.name}
              </span>
            ))}
          </div>}
        </div>
      </div>
    </Link>
  );
}