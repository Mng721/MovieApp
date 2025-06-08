import MovieCarousel from "./_components/MovieCarousel";

export default async function Home() {
  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="container mx-auto">
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