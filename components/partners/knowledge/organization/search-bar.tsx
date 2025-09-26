import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { translations } from "../translations"

interface SearchBarProps {
  language: string
}

export function SearchBar({ language }: SearchBarProps) {
  const t = (translations as any)[language] || translations.en

  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input type="search" placeholder={t.search.placeholder} className="pl-8" />
    </div>
  )
}
