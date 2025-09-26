"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IconPicker } from "./icon-picker"
import { ImageUpload } from "./image-upload"

interface Category {
  id: string
  name: string
  slug: string
  icon: string
  image?: string
  parent: string | null
  children: any[]
  level: number
}

interface CategoryFormProps {
  category?: Category
  onSave: (categoryData: Partial<Category>) => void
  onCancel: () => void
  parentCategory: Category | null
}

export function CategoryForm({ category, onSave, onCancel, parentCategory }: CategoryFormProps) {
  const [name, setName] = useState(category?.name || "")
  const [slug, setSlug] = useState(category?.slug || "")
  const [icon, setIcon] = useState(category?.icon || "circle")
  const [image, setImage] = useState(category?.image || "")
  const [autoSlug, setAutoSlug] = useState(!category)

  // Generate slug from name if autoSlug is enabled
  useEffect(() => {
    if (autoSlug) {
      setSlug(
        name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
      )
    }
  }, [name, autoSlug])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name,
      slug,
      icon,
      image,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {parentCategory && (
        <div className="text-sm text-muted-foreground mb-4">
          Parent Category: <span className="font-medium">{parentCategory.name}</span>
        </div>
      )}

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Diamond Rings"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="slug">URL Slug</Label>
              <div className="flex items-center space-x-2">
                <Label htmlFor="auto-slug" className="text-xs">
                  Auto-generate
                </Label>
                <input
                  type="checkbox"
                  id="auto-slug"
                  checked={autoSlug}
                  onChange={(e) => setAutoSlug(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>
            </div>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g., diamond-rings"
              disabled={autoSlug}
              required
            />
            <p className="text-xs text-muted-foreground">
              This will be used in URLs: /jewelry/<span className="font-mono">{slug || "category-slug"}</span>
            </p>
          </div>

          <div className="space-y-2">
            <Label>Category Icon</Label>
            <IconPicker selectedIcon={icon} onSelectIcon={setIcon} />
          </div>
        </TabsContent>

        <TabsContent value="media" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Category Image</Label>
            <ImageUpload currentImage={image} onImageChange={setImage} aspectRatio="16:9" />
            <p className="text-xs text-muted-foreground">Recommended size: 1200 x 675 pixels (16:9 ratio)</p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{category ? "Update Category" : "Create Category"}</Button>
      </div>
    </form>
  )
}
