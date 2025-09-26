"use client"

import Image from "next/image"
import { useState } from "react"
import { Download, Expand, Info } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface WorkOrderSpecificationsProps {
  workOrder: any // Using any for brevity, should be properly typed in a real application
}

export function WorkOrderSpecifications({ workOrder }: WorkOrderSpecificationsProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      {/* Item Images and Renders */}
      <Card>
        <CardHeader>
          <CardTitle>Item Visuals</CardTitle>
          <CardDescription>Images, renders, and technical drawings of the item</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="images">
            <TabsList className="mb-4">
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="renders">3D Renders</TabsTrigger>
              <TabsTrigger value="drawings">Technical Drawings</TabsTrigger>
            </TabsList>
            <TabsContent value="images">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {workOrder.item.images.map((image: string, index: number) => (
                  <div key={index} className="relative aspect-square overflow-hidden rounded-md border">
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`Item image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                        onClick={() => setSelectedImage(image)}
                      >
                        <Expand className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="renders">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {workOrder.item.renders.map((render: string, index: number) => (
                  <div key={index} className="relative aspect-square overflow-hidden rounded-md border">
                    <Image
                      src={render || "/placeholder.svg"}
                      alt={`Item render ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                        onClick={() => setSelectedImage(render)}
                      >
                        <Expand className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="drawings">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {workOrder.item.drawings.map((drawing: string, index: number) => (
                  <div key={index} className="relative aspect-square overflow-hidden rounded-md border">
                    <Image
                      src={drawing || "/placeholder.svg"}
                      alt={`Technical drawing ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                        onClick={() => setSelectedImage(drawing)}
                      >
                        <Expand className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Metal Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Metal Requirements</CardTitle>
          <CardDescription>Metal specifications for this work order</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Metal Type</h3>
              <p className="font-medium">{workOrder.metal.type}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Estimated Weight</h3>
              <p className="font-medium">{workOrder.metal.estimatedWeight}g</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Purity</h3>
              <p className="font-medium">{workOrder.metal.purity}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Finish</h3>
              <p className="font-medium">{workOrder.metal.finish}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stone List */}
      <Card>
        <CardHeader>
          <CardTitle>Stone List</CardTitle>
          <CardDescription>Stones required for this work order with placement details</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Shape</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Color/Clarity</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Placement</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workOrder.stones.map((stone: any) => (
                <TableRow key={stone.id}>
                  <TableCell className="font-medium">{stone.id}</TableCell>
                  <TableCell>{stone.type}</TableCell>
                  <TableCell>{stone.shape}</TableCell>
                  <TableCell>{stone.size}</TableCell>
                  <TableCell>
                    {stone.color}/{stone.clarity}
                  </TableCell>
                  <TableCell>{stone.quantity}</TableCell>
                  <TableCell>{stone.placement}</TableCell>
                  <TableCell>
                    <Badge variant={stone.status === "Set" ? "success" : "outline"}>{stone.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Special Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Special Instructions</CardTitle>
          <CardDescription>Important notes and instructions for this work order</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start">
              <Info className="mr-2 mt-0.5 h-4 w-4 text-amber-600" />
              <div>
                <p className="text-sm text-amber-800">{workOrder.instructions}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Viewer Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
            <DialogDescription>View the full-size image</DialogDescription>
          </DialogHeader>
          <div className="relative aspect-square w-full overflow-hidden rounded-md">
            {selectedImage && (
              <Image
                src={selectedImage || "/placeholder.svg"}
                alt="Full size preview"
                fill
                className="object-contain"
              />
            )}
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setSelectedImage(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
