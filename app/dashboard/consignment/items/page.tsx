"use client"

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function ConsignedItemsPage() {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Consigned Items</h1>
        <Button onClick={() => router.push('/dashboard/consignment/items/add')}>
          Add Consigned Item
        </Button>
      </div>
      <div className="bg-white rounded shadow p-6 text-center">
        <p>A list of consigned items will be displayed here.</p>
      </div>
    </div>
  );
} 
 