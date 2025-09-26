export default async function EquipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Equipment Details</h1>
      <p className="text-muted-foreground mb-2">Equipment ID: <span className="font-mono">{resolvedParams.id}</span></p>
      <p className="text-muted-foreground">This is a placeholder page for equipment details. You can build out more details here.</p>
    </div>
  );
} 