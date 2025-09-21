import { useSession } from "next-auth/react";

import MovieCarousel from "./_components/MovieCarousel";
import FavCarousel from "./_components/favCarousel";
import SuggestedCarousel from "./_components/suggestedCarousel";

export default async function Home() {

  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="container mx-auto">
        {/* Carousel cho phim mới */}
        <MovieCarousel
          url="/movie/now_playing"
          title="Phim Mới"
        />
        {/* Carousel cho phim yêu thích */}
        <FavCarousel />

        {/* Carousel cho phim gợi ý */}
        <SuggestedCarousel />

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

        <MovieCarousel
          isMovie={false}
          url="/tv/popular"
          title="Chương trình truyền hình"
        />
      </div>
    </div>
  );
}