import { auth } from "~/server/auth";
import Link from "next/link";
import MovieCarousel from "./_components/MovieCarousel";

export default async function Home() {
  const session = await auth();
  return (
    <div className="bg-gray-900 min-h-screen">
      {/* Carousel cho phim phổ biến */}
      <MovieCarousel
        url="/movie/popular"
        title="Phim Phổ Biến"
      />

      {/* Carousel cho phim sắp chiếu */}
      <MovieCarousel
        url="/movie/upcoming"
        title="Phim Sắp Chiếu"
      />

    </div>
  );
}