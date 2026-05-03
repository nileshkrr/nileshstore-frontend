export default function StarRating({ rating = 0 }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star}>
          {star <= rating ? '⭐' : '☆'}
        </span>
      ))}
    </div>
  );
}