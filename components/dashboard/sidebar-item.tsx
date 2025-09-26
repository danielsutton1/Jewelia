"use client"

import Link from "next/link"
import { LucideIcon, ChevronRight, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSidebar } from "./sidebar-context"

interface SidebarItemProps {
  label: string
  icon: LucideIcon
  href: string
  isActive: boolean
  isExpanded: boolean
  onToggle?: () => void
  children?: React.ReactNode
}

export function SidebarItem({
  label,
  icon: Icon,
  href,
  isActive,
  isExpanded,
  onToggle,
  children
}: SidebarItemProps) {
  const { isMobile, closeMobileSidebar } = useSidebar()

  const handleClick = () => {
    if (isMobile) {
      closeMobileSidebar()
    }
  }

  const itemContent = (
    <div className="flex items-center w-full">
      <Icon className="h-5 w-5 text-emerald-400 flex-shrink-0" />
      <span className="font-semibold flex-1 text-white tracking-wide text-[15px] ml-2">{label}</span>
      {onToggle && (
        isExpanded ? (
          <ChevronDown className="h-4 w-4 text-emerald-300 transition-transform flex-shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-emerald-300 transition-transform flex-shrink-0" />
        )
      )}
    </div>
  )

  if (onToggle) {
    // This is a category header with toggle functionality
    return (
      <div className="mb-1">
        <button
          className={cn(
            "flex items-center justify-center w-full px-3 py-2 rounded-md transition-colors group hover:bg-emerald-900/20 min-h-[44px]",
            isExpanded ? "bg-emerald-900/10" : ""
          )}
          onClick={onToggle}
          type="button"
          aria-expanded={isExpanded}
          aria-label={label}
        >
          {itemContent}
        </button>
        {children}
      </div>
    )
  }

  // This is a regular navigation item
  return (
    <li>
      <Link
        href={href}
        onClick={handleClick}
        className={cn(
          "flex items-center gap-2 px-2 py-1.5 rounded-md text-[15px] transition-colors min-h-[44px]",
          isActive
            ? "bg-emerald-700/30 text-emerald-200 font-bold"
            : "text-emerald-100 hover:bg-emerald-800/20 hover:text-white"
        )}
        aria-label={label}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        <span className="truncate">{label}</span>
      </Link>
    </li>
  )
} 