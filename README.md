# MovieApp - Ứng dụng Xem Phim và TV Series

![MovieApp Banner](https://via.placeholder.com/1200x400.png?text=MovieApp+Banner)

## Giới thiệu

**MovieApp** là một ứng dụng web cho phép người dùng khám phá, xem thông tin chi tiết, và tương tác với các bộ phim và TV series. Dự án được xây dựng với mục tiêu cung cấp trải nghiệm người dùng mượt mà, bao gồm các tính năng như tìm kiếm phim, xem chi tiết phim/TV series, bình luận, trả lời bình luận, và gợi ý nội dung liên quan. Ứng dụng sử dụng **TMDB API** để lấy dữ liệu phim và TV series, và tích hợp các công nghệ hiện đại như Next.js, tRPC, và Drizzle ORM để đảm bảo hiệu suất và khả năng mở rộng.

### Các tính năng chính

- **Khám phá phim và TV series**: Xem danh sách phim/TV series theo thể loại, tìm kiếm phim theo từ khóa.
- **Chi tiết phim/TV series**: Hiển thị thông tin chi tiết bao gồm poster, tổng quan, thể loại, diễn viên, trailer, số mùa/tập (đối với TV series).
- **Bình luận và trả lời**: Người dùng có thể bình luận, trả lời bình luận, và xóa bình luận của mình (hoặc admin có thể xóa).
- **Gợi ý nội dung liên quan**: Gợi ý các phim hoặc TV series liên quan dựa trên nội dung đang xem.
- **Quản lý tài khoản**: Đăng nhập, đăng ký, quản lý thông tin cá nhân, và thêm phim/TV series vào danh sách yêu thích.
- **Quản trị viên**: Admin có thể quản lý người dùng và nội dung bình luận.
- **Responsive Design**: Giao diện thân thiện, hỗ trợ cả desktop và mobile.

## Công nghệ sử dụng

- **Frontend**: Next.js (React Framework), Tailwind CSS
- **Backend**: tRPC (Type-safe API), Next.js API Routes
- **Cơ sở dữ liệu**: PostgreSQL, Drizzle ORM
- **API**: TMDB API (The Movie Database)
- **Xác thực**: NextAuth.js
- **Khác**: TypeScript, Axios, Date-fns

## Giao diện và tính năng

Dưới đây là một số ảnh chụp màn hình của **MovieApp**:

### Trang chủ

![Trang chủ](https://github.com/Mng721/MovieApp/blob/main/public/assets/screenshots/home-page.png)

### Chi tiết phim

![Chi tiết phim](https://github.com/Mng721/MovieApp/blob/main/public/assets/screenshots/movie-detail-page.png)

### Chi tiết diễn viên

![Chi tiết diễn viên](https://github.com/Mng721/MovieApp/blob/main/public/assets/screenshots/actor-page.png)

### Lọc phim theo thể loại

![Lọc phim theo thể loại](https://github.com/Mng721/MovieApp/blob/main/public/assets/screenshots/.png)

## Cài đặt và chạy dự án

### Yêu cầu

- Node.js (phiên bản 18.x trở lên)
- PostgreSQL (phiên bản 13.x trở lên)
- Tài khoản TMDB để lấy API Key (https://www.themoviedb.org/documentation/api)

### Hướng dẫn cài đặt

1. **Clone repository**:
   ```bash
   git clone https://github.com/your-username/movieapp.git
   cd movieapp
   ```
2. **Cài đặt dependencies**:

   ```bash
   npm install
   ```

3. **Tạo file môi trường**:

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/movieapp"
   TMDB_API_KEY="your-tmdb-api-key"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-nextauth-secret"
   NEXT_PUBLIC_TMDB_API_KEY="your-tmdb-api-key"
   ```

4. **Khởi tạo cơ sở dữ liệu**:

   ```bash
   npx drizzle-kit generate:pg
   npx drizzle-kit push:pg
   ```

5. **Chạy ứng dụng**:
   ```bash
   npm run dev
   ```

Mở trình duyệt và truy cập: http://localhost:3000.

## Cách sử dụng

1. **Trang chủ**:
   -Truy cập http://localhost:3000 để xem danh sách phim nổi bật.
   -Sử dụng thanh tìm kiếm để tìm phim theo từ khóa.

2. **Chi tiết phim/TV series**:
   -Truy cập /movies/[id] hoặc /tv/[id] để xem thông tin chi tiết.
   -Bình luận, trả lời bình luận, và xem nội dung liên quan.

3. **Đăng nhập/Đăng ký**:
   Truy cập /login để đăng nhập hoặc đăng ký tài khoản.

Sau khi đăng nhập, bạn có thể thêm phim/TV series vào danh sách yêu thích.

4. **Quản trị viên**:
   Admin (roleId = 1) có thể truy cập /admin để quản lý người dùng và bình luận.
