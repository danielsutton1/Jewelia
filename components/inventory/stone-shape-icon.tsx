import { cn } from "@/lib/utils"

interface StoneShapeIconProps {
  shape: string
  className?: string
  size?: "sm" | "md" | "lg"
}

export function StoneShapeIcon({ shape, className, size = "md" }: StoneShapeIconProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  }

  const getShapeIcon = (shape: string) => {
    switch (shape) {
      case "round":
        return "○"
      case "princess":
        return "□"
      case "cushion":
        return "⬭"
      case "emerald":
        return "▭"
      case "oval":
        return "⬬"
      case "radiant":
        return "⬙"
      case "asscher":
        return "⬓"
      case "marquise":
        return "⬖"
      case "pear":
        return "⬗"
      case "heart":
        return "♥"
      case "trillion":
        return "△"
      case "baguette":
        return "▭"
      default:
        return "○"
    }
  }

  return <span className={cn(sizeClasses[size], className)}>{getShapeIcon(shape)}</span>
}
