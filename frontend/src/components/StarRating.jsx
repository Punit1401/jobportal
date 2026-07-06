import React, { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating, setRating, isEditable = false }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!isEditable}
          className={`${isEditable ? "cursor-pointer" : "cursor-default"} transition-all`}
          onClick={() => setRating(star)}
          onMouseEnter={() => isEditable && setHover(star)}
          onMouseLeave={() => isEditable && setHover(0)}
        >
          <Star
            size={20}
            className={`${
              star <= (hover || rating) 
                ? "fill-amber-400 text-amber-400" 
                : "text-slate-300 fill-transparent"
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
}