"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera, Upload, Trash2, ZoomIn, Download, Plus, ImageIcon } from "lucide-react"
import Image from "next/image"

interface PhotoDocumentationProps {
  inspectionId: string
}

// Mock photo data
const mockPhotos = [
  {
    id: "photo-1",
    category: "overview",
    url: "/placeholder.svg?height=400&width=400&query=jewelry%20ring%20overview",
    caption: "Full product overview",
    timestamp: "2023-05-15T10:30:00Z",
  },
  {
    id: "photo-2",
    category: "detail",
    url: "/placeholder.svg?height=400&width=400&query=diamond%20setting%20close%20up",
    caption: "Diamond setting detail",
    timestamp: "2023-05-15T10:32:00Z",
  },
  {
    id: "photo-3",
    category: "detail",
    url: "/placeholder.svg?height=400&width=400&query=ring%20band%20texture",
    caption: "Band texture detail",
    timestamp: "2023-05-15T10:35:00Z",
  },
  {
    id: "photo-4",
    category: "defect",
    url: "/placeholder.svg?height=400&width=400&query=scratched%20metal%20surface",
    caption: "Surface scratch on inner band",
    timestamp: "2023-05-15T10:38:00Z",
  },
  {
    id: "photo-5",
    category: "hallmark",
    url: "/placeholder.svg?height=400&width=400&query=jewelry%20hallmark%20close%20up",
    caption: "Hallmark detail",
    timestamp: "2023-05-15T10:40:00Z",
  },
]

export function PhotoDocumentation({ inspectionId }: PhotoDocumentationProps) {
  const [photos, setPhotos] = useState(mockPhotos)
  const [activeTab, setActiveTab] = useState("all")
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [newPhotoCaption, setNewPhotoCaption] = useState("")
  const [newPhotoCategory, setNewPhotoCategory] = useState("overview")

  const filteredPhotos = activeTab === "all" ? photos : photos.filter((photo) => photo.category === activeTab)

  const handleDeletePhoto = (photoId: string) => {
    setPhotos(photos.filter((photo) => photo.id !== photoId))
    if (selectedPhoto === photoId) {
      setSelectedPhoto(null)
    }
  }

  const handleUploadPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Logic to handle file upload
    console.log("Uploading photo for inspection", inspectionId)
  }

  const handleCapturePhoto = () => {
    // Logic to capture photo using device camera
    console.log("Capturing photo for inspection", inspectionId)
  }

  const selectedPhotoData = selectedPhoto ? photos.find((photo) => photo.id === selectedPhoto) : null

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Photo Documentation</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <label htmlFor="photo-upload" className="cursor-pointer flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload
                </label>
                <Input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handleUploadPhoto} />
              </Button>
              <Button variant="default" className="gap-2" onClick={handleCapturePhoto}>
                <Camera className="h-4 w-4" />
                Capture
              </Button>
            </div>
          </div>
          <CardDescription>Document the item with photos from multiple angles</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="detail">Details</TabsTrigger>
              <TabsTrigger value="defect">Defects</TabsTrigger>
              <TabsTrigger value="hallmark">Hallmarks</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPhotos.map((photo) => (
                  <Card
                    key={photo.id}
                    className={`overflow-hidden cursor-pointer transition-all ${selectedPhoto === photo.id ? "ring-2 ring-primary" : ""}`}
                    onClick={() => setSelectedPhoto(photo.id)}
                  >
                    <div className="relative aspect-square">
                      <Image src={photo.url || "/placeholder.svg"} alt={photo.caption} fill className="object-cover" />
                    </div>
                    <CardContent className="p-3">
                      <p className="text-sm font-medium truncate">{photo.caption}</p>
                      <p className="text-xs text-muted-foreground">{new Date(photo.timestamp).toLocaleString()}</p>
                    </CardContent>
                  </Card>
                ))}

                {/* Add new photo card */}
                <Card className="overflow-hidden cursor-pointer border-dashed border-2 flex flex-col items-center justify-center aspect-square">
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <div className="rounded-full bg-muted p-3 mb-3">
                      <Plus className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium">Add Photo</p>
                    <p className="text-xs text-muted-foreground mt-1">Upload or capture a new photo</p>
                  </div>
                </Card>
              </div>

              {filteredPhotos.length === 0 && activeTab !== "all" && (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="rounded-full bg-muted p-3 mb-3">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-medium">No photos in this category</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-md">
                    Upload or capture photos to document the item in this category
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {selectedPhotoData && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>Photo Details</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={() => handleDeletePhoto(selectedPhotoData.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative aspect-square">
                <Image
                  src={selectedPhotoData.url || "/placeholder.svg"}
                  alt={selectedPhotoData.caption}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="photo-caption">Caption</Label>
                  <Input
                    id="photo-caption"
                    value={selectedPhotoData.caption}
                    onChange={() => {}} // Would update caption in real app
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="photo-category">Category</Label>
                  <select
                    id="photo-category"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedPhotoData.category}
                    onChange={() => {}} // Would update category in real app
                  >
                    <option value="overview">Overview</option>
                    <option value="detail">Detail</option>
                    <option value="defect">Defect</option>
                    <option value="hallmark">Hallmark</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Timestamp</Label>
                  <p className="text-sm">{new Date(selectedPhotoData.timestamp).toLocaleString()}</p>
                </div>
                <Button className="w-full mt-4">Save Changes</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
