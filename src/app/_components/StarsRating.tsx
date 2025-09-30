import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FaStar } from "react-icons/fa"; // Sử dụng react-icons cho icon sao

interface StarRatingProps {
    movieId: number;
    initialRating?: number; // Điểm ban đầu từ user (nếu có)
}

export default function StarRating({ movieId, initialRating }: StarRatingProps) {
    const { data: session } = useSession();
    const [rating, setRating] = useState<number | null>(initialRating || null);
    const [hover, setHover] = useState<number | null>(null);

    // Cập nhật state khi initialRating thay đổi
    useEffect(() => {
        setRating(initialRating || null);
    }, [initialRating]);

    const handleRating = (value: number) => {
        if (!session) {
            alert("Vui lòng đăng nhập để đánh giá!");
            return;
        }
        setRating(value);
    };

    return (
        <div className="flex items-center gap-1">
            {[...Array(10)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                    <label key={index}>
                        <input
                            type="radio"
                            name={`rating-${movieId}`}
                            value={ratingValue}
                            onClick={() => handleRating(ratingValue)} // Scale 1-5 thành 1-10
                            className="hidden"
                        />
                        <FaStar
                            className={`cursor-pointer text-2xl transition-colors ${ratingValue <= (hover || rating || 0)
                                ? "text-yellow-400"
                                : "text-gray-300"
                                }`}
                            onMouseEnter={() => setHover(ratingValue)}
                            onMouseLeave={() => setHover(null)}
                        />
                    </label>
                );
            })}
            <span className="ml-2 text-sm">
                {rating ? `${rating}/10` : "Chưa đánh giá"}
            </span>
        </div>
    );
}