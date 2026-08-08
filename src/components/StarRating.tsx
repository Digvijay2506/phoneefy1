import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  size?: number;
}

export default function StarRating({ rating, size = 14 }: StarRatingProps) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          fill={star <= Math.round(rating) ? '#F59E0B' : 'none'}
          color={star <= Math.round(rating) ? '#F59E0B' : '#D1D5DB'}
          strokeWidth={1.5}
        />
      ))}
      <span className="text-xs font-semibold ml-1">{rating}</span>
    </div>
  );
}
