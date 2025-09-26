"use client"

import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating: number
  onChange?: (rating: number) => void
  size?: "small" | "medium" | "large"
}

export function StarRating({ rating, onChange, size = "medium" }: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5]

  const handleClick = (value: number) => {
    if (onChange) {
      onChange(value)
    }
  }

  const getSizeClass = () => {
    switch (size) {
      case "small":
        return "h-4 w-4"
      case "large":
        return "h-8 w-8"
      case "medium":
      default:
        return "h-6 w-6"
    }
  }

  return (
    <div className="flex">
      {stars.map((star) => (
        <Star
          key={star}
          className={cn(
            getSizeClass(),
            "cursor-pointer transition-colors",
            star <= rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300",
          )}
          onClick={() => handleClick(star)}
        />
      ))}
    </div>
  )
}
