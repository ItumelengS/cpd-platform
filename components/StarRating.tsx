'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  showValue?: boolean;
}

export default function StarRating({
  rating,
  onChange,
  size = 'md',
  readonly = false,
  showValue = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const displayRating = hoverRating ?? rating;
  const isInteractive = !readonly && onChange;

  const handleClick = (value: number) => {
    if (isInteractive) {
      onChange(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (!isInteractive) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange(index + 1);
    } else if (e.key === 'ArrowRight' && index < 4) {
      e.preventDefault();
      (e.currentTarget.nextElementSibling as HTMLElement)?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      (e.currentTarget.previousElementSibling as HTMLElement)?.focus();
    }
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((value) => {
          const isFilled = value <= displayRating;
          const isHalfFilled = !isFilled && value - 0.5 <= displayRating;

          return (
            <button
              key={value}
              type="button"
              onClick={() => handleClick(value)}
              onMouseEnter={() => isInteractive && setHoverRating(value)}
              onMouseLeave={() => isInteractive && setHoverRating(null)}
              onKeyDown={(e) => handleKeyDown(e, value - 1)}
              disabled={readonly}
              className={`
                ${isInteractive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
                transition-transform focus:outline-none focus:ring-2 focus:ring-blue-500 rounded
                ${readonly ? '' : 'focus-visible:ring-2 focus-visible:ring-blue-500'}
              `}
              aria-label={`${value} star${value !== 1 ? 's' : ''}`}
              tabIndex={isInteractive ? 0 : -1}
            >
              {isHalfFilled ? (
                <div className="relative">
                  <Star
                    className={`${sizeClasses[size]} text-gray-300`}
                    fill="currentColor"
                  />
                  <div className="absolute inset-0 overflow-hidden w-1/2">
                    <Star
                      className={`${sizeClasses[size]} text-yellow-400`}
                      fill="currentColor"
                    />
                  </div>
                </div>
              ) : (
                <Star
                  className={`${sizeClasses[size]} ${
                    isFilled ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                  fill="currentColor"
                />
              )}
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="ml-2 text-sm font-medium text-gray-700">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
