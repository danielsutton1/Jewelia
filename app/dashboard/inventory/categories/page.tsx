import { CategoryHierarchyManager } from "@/components/inventory/categories/category-hierarchy-manager"

export default function CategoriesPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Category Hierarchy Manager</h1>
          <p className="text-muted-foreground">Organize your jewelry inventory with a flexible categorization system</p>
        </div>
      </div>
      <CategoryHierarchyManager />
    </div>
  )
}
