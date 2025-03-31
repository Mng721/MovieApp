import Image from "next/image";
import Link from "next/link";

interface TVSeries {
    id: number;
    name?: string;
    poster_path: string | null;
    first_air_date?: string;
    vote_average?: number
}

interface TVSeriesCardProps {
    tvSeries: TVSeries;
}

export default function TVSeriesCard({ tvSeries }: TVSeriesCardProps) {
    return (
        <Link href={`/tv/${tvSeries.id}`} >
            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                <div className="relative w-full h-64">
                    <img
                        src={`https://image.tmdb.org/t/p/w300${tvSeries.poster_path}`}
                        alt={tvSeries.name ?? "tvseries"}
                        className="w-full h-full object-cover"
                        onError={(e) => (e.currentTarget.src = "/assets/images/movie.jpg")}
                    />
                </div>
                <div className="p-4">
                    <h3 className="text-lg font-semibold text-white truncate">{tvSeries.name}</h3>
                    <p className="text-gray-400 text-sm">{tvSeries.first_air_date}</p>\
                    {tvSeries.vote_average ? (
                        <p className="text-yellow-400 text-sm mt-1">
                            ⭐ {tvSeries.vote_average.toFixed(1)}/10
                        </p>
                    ) : (<div className="text-yellow-400 text-sm mt-1">⭐ N/A</div>)}
                </div>
            </div>
        </Link>
    );
}