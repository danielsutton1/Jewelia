import JewelryItemForm from "@/components/inventory/jewelry-item-form"

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      {/* TODO: Load product data by params.id and pass as initialValues */}
      <JewelryItemForm productId={resolvedParams.id} />
    </div>
  )
} 