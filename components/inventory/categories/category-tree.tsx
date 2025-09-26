"use client"

import { useState, useCallback } from "react"
import { DndProvider, useDrag, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronRight, ChevronDown, Plus, Edit, Trash2, Search } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CategoryForm } from "./category-form"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Define category types
interface Category {
  id: string
  name: string
  slug: string
  icon: string
  image?: string
  parent: string | null
  children: Category[]
  level: number
  isExpanded?: boolean
}

// Sample category data
const initialCategories: Category[] = [
  {
    id: "jewelry",
    name: "Jewelry",
    slug: "jewelry",
    icon: "gem",
    parent: null,
    level: 0,
    isExpanded: true,
    children: [
      {
        id: "rings",
        name: "Rings",
        slug: "rings",
        icon: "circle",
        parent: "jewelry",
        level: 1,
        isExpanded: true,
        children: [
          {
            id: "engagement-rings",
            name: "Engagement Rings",
            slug: "engagement-rings",
            icon: "heart",
            parent: "rings",
            level: 2,
            children: [],
          },
          {
            id: "wedding-bands",
            name: "Wedding Bands",
            slug: "wedding-bands",
            icon: "circle",
            parent: "rings",
            level: 2,
            children: [],
          },
          {
            id: "fashion-rings",
            name: "Fashion Rings",
            slug: "fashion-rings",
            icon: "sparkles",
            parent: "rings",
            level: 2,
            children: [],
          },
        ],
      },
      {
        id: "necklaces",
        name: "Necklaces",
        slug: "necklaces",
        icon: "link",
        parent: "jewelry",
        level: 1,
        isExpanded: false,
        children: [
          {
            id: "pendants",
            name: "Pendants",
            slug: "pendants",
            icon: "heart",
            parent: "necklaces",
            level: 2,
            children: [],
          },
          {
            id: "chains",
            name: "Chains",
            slug: "chains",
            icon: "link",
            parent: "necklaces",
            level: 2,
            children: [],
          },
        ],
      },
      {
        id: "earrings",
        name: "Earrings",
        slug: "earrings",
        icon: "star",
        parent: "jewelry",
        level: 1,
        isExpanded: false,
        children: [
          {
            id: "studs",
            name: "Studs",
            slug: "studs",
            icon: "dot",
            parent: "earrings",
            level: 2,
            children: [],
          },
          {
            id: "hoops",
            name: "Hoops",
            slug: "hoops",
            icon: "circle",
            parent: "earrings",
            level: 2,
            children: [],
          },
          {
            id: "drops",
            name: "Drops",
            slug: "drops",
            icon: "droplet",
            parent: "earrings",
            level: 2,
            children: [],
          },
        ],
      },
      {
        id: "bracelets",
        name: "Bracelets",
        slug: "bracelets",
        icon: "circle-dashed",
        parent: "jewelry",
        level: 1,
        isExpanded: false,
        children: [
          {
            id: "bangles",
            name: "Bangles",
            slug: "bangles",
            icon: "circle",
            parent: "bracelets",
            level: 2,
            children: [],
          },
          {
            id: "tennis-bracelets",
            name: "Tennis Bracelets",
            slug: "tennis-bracelets",
            icon: "diamond",
            parent: "bracelets",
            level: 2,
            children: [],
          },
          {
            id: "charm-bracelets",
            name: "Charm Bracelets",
            slug: "charm-bracelets",
            icon: "star",
            parent: "bracelets",
            level: 2,
            children: [],
          },
        ],
      },
      {
        id: "watches",
        name: "Watches",
        slug: "watches",
        icon: "watch",
        parent: "jewelry",
        level: 1,
        isExpanded: false,
        children: [
          {
            id: "luxury-watches",
            name: "Luxury Watches",
            slug: "luxury-watches",
            icon: "watch",
            parent: "watches",
            level: 2,
            children: [],
          },
          {
            id: "fashion-watches",
            name: "Fashion Watches",
            slug: "fashion-watches",
            icon: "watch",
            parent: "watches",
            level: 2,
            children: [],
          },
        ],
      },
    ],
  },
]

// Define drag item type
const ItemTypes = {
  CATEGORY: "category",
}

// Draggable category component
const DraggableCategory = ({
  category,
  onToggle,
  onSelect,
  isSelected,
  onEdit,
  onDelete,
  onDrop,
}: {
  category: Category
  onToggle: (id: string) => void
  onSelect: (id: string) => void
  isSelected: boolean
  onEdit: (category: Category) => void
  onDelete: (id: string) => void
  onDrop: (dragId: string, dropId: string) => void
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.CATEGORY,
    item: { id: category.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.CATEGORY,
    drop: (item: { id: string }) => {
      if (item.id !== category.id) {
        onDrop(item.id, category.id)
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }))

  const hasChildren = category.children && category.children.length > 0
  const isExpanded = category.isExpanded

  return (
    <div ref={drop as any} className="category-item">
      <div
        ref={drag as any}
        className={`
          flex items-center p-2 rounded-md mb-1 cursor-pointer
          ${isSelected ? "bg-primary/10" : "hover:bg-muted"}
          ${isOver ? "border-2 border-dashed border-primary" : ""}
          ${isDragging ? "opacity-50" : "opacity-100"}
        `}
        style={{ paddingLeft: `${category.level * 16 + 8}px` }}
        onClick={() => onSelect(category.id)}
      >
        {hasChildren && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 p-0 mr-1"
            onClick={(e) => {
              e.stopPropagation()
              onToggle(category.id)
            }}
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        )}
        {!hasChildren && <div className="w-6"></div>}

        <div className="flex-1 flex items-center">
          <span className="font-medium">{category.name}</span>
          <span className="ml-2 text-xs text-muted-foreground">/{category.slug}</span>
        </div>

        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(category)
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(category.id)
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div className="category-children">
          {category.children.map((child) => (
            <DraggableCategory
              key={child.id}
              category={child}
              onToggle={onToggle}
              onSelect={onSelect}
              isSelected={isSelected}
              onEdit={onEdit}
              onDelete={onDelete}
              onDrop={onDrop}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Recursive function to find and update a category
const updateCategoryInTree = (
  categories: Category[],
  id: string,
  updateFn: (category: Category) => Category,
): Category[] => {
  return categories.map((category) => {
    if (category.id === id) {
      return updateFn(category)
    }
    if (category.children && category.children.length > 0) {
      return {
        ...category,
        children: updateCategoryInTree(category.children, id, updateFn),
      }
    }
    return category
  })
}

// Recursive function to find a category by ID
const findCategoryById = (categories: Category[], id: string): Category | null => {
  for (const category of categories) {
    if (category.id === id) {
      return category
    }
    if (category.children && category.children.length > 0) {
      const found = findCategoryById(category.children, id)
      if (found) {
        return found
      }
    }
  }
  return null
}

// Recursive function to move a category
const moveCategoryInTree = (categories: Category[], dragId: string, dropId: string): Category[] => {
  // Find the category to move
  const dragCategory = findCategoryById(categories, dragId)
  if (!dragCategory) return categories

  // Find the target category
  const dropCategory = findCategoryById(categories, dropId)
  if (!dropCategory) return categories

  // Remove the category from its current position
  const removeCategory = (cats: Category[], id: string): [Category[], Category | null] => {
    let removed: Category | null = null
    const newCats = cats
      .filter((cat) => {
        if (cat.id === id) {
          removed = cat
          return false
        }
        return true
      })
      .map((cat) => {
        if (cat.children && cat.children.length > 0) {
          const [newChildren, removedChild] = removeCategory(cat.children, id)
          if (removedChild) {
            removed = removedChild
          }
          return { ...cat, children: newChildren }
        }
        return cat
      })
    return [newCats, removed]
  }

  const [newCategories, removedCategory] = removeCategory(categories, dragId)
  if (!removedCategory) return categories

  // Add the category to its new position
  const addCategory = (cats: Category[], parentId: string, categoryToAdd: Category): Category[] => {
    return cats.map((cat) => {
      if (cat.id === parentId) {
        return {
          ...cat,
          children: [...cat.children, { ...categoryToAdd, parent: parentId, level: cat.level + 1 }],
          isExpanded: true,
        }
      }
      if (cat.children && cat.children.length > 0) {
        return {
          ...cat,
          children: addCategory(cat.children, parentId, categoryToAdd),
        }
      }
      return cat
    })
  }

  return addCategory(newCategories, dropId, removedCategory)
}

// Main category tree component
export function CategoryTree({
  selectedCategory,
  setSelectedCategory,
}: {
  selectedCategory: string | null
  setSelectedCategory: (id: string | null) => void
}) {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newCategoryParent, setNewCategoryParent] = useState<string | null>(null)
  const [showDeleteAlert, setShowDeleteAlert] = useState<string | null>(null)

  // Toggle category expansion
  const toggleCategory = useCallback((id: string) => {
    setCategories((prevCategories) =>
      updateCategoryInTree(prevCategories, id, (category) => ({
        ...category,
        isExpanded: !category.isExpanded,
      })),
    )
  }, [])

  // Handle category selection
  const handleSelectCategory = useCallback(
    (id: string) => {
      setSelectedCategory(id)
    },
    [setSelectedCategory],
  )

  // Handle category edit
  const handleEditCategory = useCallback((category: Category) => {
    setEditingCategory(category)
  }, [])

  // Handle category delete
  const handleDeleteCategory = useCallback((id: string) => {
    setShowDeleteAlert(id)
  }, [])

  // Confirm category delete
  const confirmDeleteCategory = useCallback(
    (id: string) => {
      // Recursive function to remove a category and its children
      const removeCategory = (cats: Category[], categoryId: string): Category[] => {
        return cats
          .filter((cat) => cat.id !== categoryId)
          .map((cat) => ({
            ...cat,
            children: removeCategory(cat.children, categoryId),
          }))
      }

      setCategories((prevCategories) => removeCategory(prevCategories, id))
      setShowDeleteAlert(null)
      if (selectedCategory === id) {
        setSelectedCategory(null)
      }
    },
    [selectedCategory, setSelectedCategory],
  )

  // Handle category drop (for drag and drop)
  const handleCategoryDrop = useCallback((dragId: string, dropId: string) => {
    setCategories((prevCategories) => moveCategoryInTree(prevCategories, dragId, dropId))
  }, [])

  // Handle adding a new category
  const handleAddCategory = useCallback((parentId: string | null = null) => {
    setNewCategoryParent(parentId)
    setIsAddDialogOpen(true)
  }, [])

  // Save a new category
  const saveNewCategory = useCallback(
    (categoryData: Partial<Category>) => {
      const newCategory: Category = {
        id: `category-${Date.now()}`,
        name: categoryData.name || "New Category",
        slug: categoryData.slug || "new-category",
        icon: categoryData.icon || "circle",
        image: categoryData.image,
        parent: newCategoryParent,
        level: newCategoryParent ? (findCategoryById(categories, newCategoryParent)?.level || 0) + 1 : 0,
        children: [],
      }

      if (newCategoryParent) {
        // Add as a child to the parent category
        setCategories((prevCategories) =>
          updateCategoryInTree(prevCategories, newCategoryParent, (category) => ({
            ...category,
            children: [...category.children, newCategory],
            isExpanded: true,
          })),
        )
      } else {
        // Add as a top-level category
        setCategories((prevCategories) => [...prevCategories, newCategory])
      }

      setIsAddDialogOpen(false)
      setNewCategoryParent(null)
    },
    [categories, newCategoryParent],
  )

  // Save edited category
  const saveEditedCategory = useCallback(
    (categoryData: Partial<Category>) => {
      if (!editingCategory) return

      setCategories((prevCategories) =>
        updateCategoryInTree(prevCategories, editingCategory.id, (category) => ({
          ...category,
          name: categoryData.name || category.name,
          slug: categoryData.slug || category.slug,
          icon: categoryData.icon || category.icon,
          image: categoryData.image || category.image,
        })),
      )

      setEditingCategory(null)
    },
    [editingCategory],
  )

  // Filter categories based on search term
  const filterCategories = useCallback((cats: Category[], term: string): Category[] => {
    if (!term) return cats

    return cats
      .map((cat) => {
        const matchesSearch =
          cat.name.toLowerCase().includes(term.toLowerCase()) || cat.slug.toLowerCase().includes(term.toLowerCase())

        const filteredChildren = filterCategories(cat.children, term)

        if (matchesSearch || filteredChildren.length > 0) {
          return {
            ...cat,
            children: filteredChildren,
            isExpanded: filteredChildren.length > 0 ? true : cat.isExpanded,
          }
        }

        return cat
      })
      .filter((cat) => {
        const matchesSearch =
          cat.name.toLowerCase().includes(term.toLowerCase()) || cat.slug.toLowerCase().includes(term.toLowerCase())
        return matchesSearch || cat.children.length > 0
      })
  }, [])

  const filteredCategories = searchTerm ? filterCategories(categories, searchTerm) : categories

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button onClick={() => handleAddCategory(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Root Category
              </Button>
            </div>

            <ScrollArea className="h-[500px] pr-4">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <DraggableCategory
                    key={category.id}
                    category={category}
                    onToggle={toggleCategory}
                    onSelect={handleSelectCategory}
                    isSelected={selectedCategory === category.id}
                    onEdit={handleEditCategory}
                    onDelete={handleDeleteCategory}
                    onDrop={handleCategoryDrop}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "No categories match your search" : "No categories found. Add your first category."}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Add Category Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <CategoryForm
              onSave={saveNewCategory}
              onCancel={() => setIsAddDialogOpen(false)}
              parentCategory={newCategoryParent ? findCategoryById(categories, newCategoryParent) : null}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Category Dialog */}
        <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
            </DialogHeader>
            {editingCategory && (
              <CategoryForm
                category={editingCategory}
                onSave={saveEditedCategory}
                onCancel={() => setEditingCategory(null)}
                parentCategory={editingCategory.parent ? findCategoryById(categories, editingCategory.parent) : null}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={!!showDeleteAlert} onOpenChange={(open) => !open && setShowDeleteAlert(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <Alert variant="destructive">
              <AlertDescription>
                Are you sure you want to delete this category? This will also delete all subcategories and cannot be
                undone.
              </AlertDescription>
            </Alert>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setShowDeleteAlert(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => showDeleteAlert && confirmDeleteCategory(showDeleteAlert)}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DndProvider>
  )
}
