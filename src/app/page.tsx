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

      {/* Nội dung trang chủ khác */}
      <div className="p-4">
        <h1 className="text-2xl text-white">Home</h1>
        {session ? (
          <p className="text-white">Welcome, {session.user.email}</p>
        ) : (
          <div>
            <Link href="/login" className="text-blue-500">
              Login
            </Link>{" "}
            |{" "}
            <Link href="/register" className="text-blue-500">
              Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}