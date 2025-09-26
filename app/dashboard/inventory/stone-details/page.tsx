import type { Metadata } from "next"
import StoneInformation from "@/components/inventory/stone-information"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Stone Details | Jewelia CRM",
  description: "Detailed gemstone information management",
}

export default function StoneDetailsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link href="/dashboard/inventory">
          <Button variant="ghost" className="pl-0 flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Inventory
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mt-2">Stone Information Management</h1>
        <p className="text-muted-foreground">Detailed documentation of gemstones in jewelry items</p>
      </div>

      <Tabs defaultValue="add" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="add">Add New Stone</TabsTrigger>
          <TabsTrigger value="example">Example Data</TabsTrigger>
        </TabsList>
        <TabsContent value="add" className="mt-6">
          <StoneInformation />
        </TabsContent>
        <TabsContent value="example" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Example Stone Information</CardTitle>
              <CardDescription>
                This example shows a completed stone information form for a diamond ring with accent stones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StoneInformation
                readOnly
                initialData={{
                  primaryStone: {
                    stoneType: "diamond",
                    stoneShape: "round",
                    caratWeight: 1.25,
                    length: 6.8,
                    width: 6.8,
                    depth: 4.2,
                    colorGrade: "G",
                    clarityGrade: "VS1",
                    cutGrade: "excellent",
                    polish: "excellent",
                    symmetry: "very-good",
                    fluorescence: "none",
                    certification: "gia",
                    certificationNumber: "GIA 1234567890",
                    notes: "Center stone for engagement ring. Excellent brilliance and fire.",
                  },
                  accentStones: [
                    {
                      stoneType: "diamond",
                      stoneShape: "round",
                      caratWeight: 0.15,
                      quantity: 10,
                      notes: "Melee diamonds for halo setting",
                    },
                    {
                      stoneType: "sapphire",
                      stoneShape: "round",
                      caratWeight: 0.05,
                      quantity: 2,
                      notes: "Blue sapphires on the sides of the setting",
                    },
                  ],
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
