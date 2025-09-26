"use client"

import { useState } from "react"
import { DndProvider, useDrag, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { Tree, TreeNode } from "react-organizational-chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Edit, Plus, Trash, MapPin, ShieldCheck, Thermometer, Percent, ImageIcon, List } from "lucide-react"

// Define location types
type LocationType = "Store" | "Showroom" | "Case" | "Shelf" | "Position"

// Define location interface
interface Location {
  id: string
  type: LocationType
  name: string
  capacity: number
  securityLevel: "low" | "medium" | "high"
  contents: string[]
  photos: string[]
  dimensions: string
  temperature: string
  humidity: string
  insurance: string
  children?: Location[]
}

// Sample location data
const initialLocations: Location = {
  id: "store1",
  type: "Store",
  name: "Main Store",
  capacity: 1000,
  securityLevel: "medium",
  contents: [],
  photos: [],
  dimensions: "1000 sq ft",
  temperature: "72°F",
  humidity: "50%",
  insurance: "Jewelers Mutual",
  children: [
    {
      id: "showroom1",
      type: "Showroom",
      name: "Front Showroom",
      capacity: 500,
      securityLevel: "medium",
      contents: [],
      photos: [],
      dimensions: "500 sq ft",
      temperature: "72°F",
      humidity: "50%",
      insurance: "Jewelers Mutual",
      children: [
        {
          id: "case1",
          type: "Case",
          name: "Display Case A",
          capacity: 50,
          securityLevel: "high",
          contents: [],
          photos: [],
          dimensions: "4ft x 2ft x 3ft",
          temperature: "70°F",
          humidity: "45%",
          insurance: "Jewelers Mutual",
          children: [
            {
              id: "shelf1",
              type: "Shelf",
              name: "Top Shelf",
              capacity: 10,
              securityLevel: "high",
              contents: [],
              photos: [],
              dimensions: "3ft x 1ft",
              temperature: "70°F",
              humidity: "45%",
              insurance: "Jewelers Mutual",
              children: [
                {
                  id: "position1",
                  type: "Position",
                  name: "Position 1",
                  capacity: 1,
                  securityLevel: "high",
                  contents: ["ring123"],
                  photos: [],
                  dimensions: "6in x 6in",
                  temperature: "70°F",
                  humidity: "45%",
                  insurance: "Jewelers Mutual",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

// Define drag and drop types
const LOCATION = "location"

// Draggable location component
const LocationNode = ({ location, onEdit, onDelete, onMove }: {
  location: Location;
  onEdit: (location: Location) => void;
  onDelete: (location: Location) => void;
  onMove: (dragId: string, dropId: string) => void;
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: LOCATION,
    item: { id: location.id, type: LOCATION },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [{ isOver }, drop] = useDrop<{ id: string; type: string }, void, { isOver: boolean }>({
    accept: LOCATION,
    drop: (item: { id: string; type: string }) => {
      if (item.id !== location.id) {
        onMove(item.id, location.id)
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  })

  return (
    <TreeNode
      label={
        <div
          ref={(node) => {
            drag(node)
            drop(node)
          }}
          style={{
            cursor: "grab",
            opacity: isDragging ? 0.5 : 1,
            border: isOver ? "2px dashed blue" : "none",
            padding: "8px",
            borderRadius: "4px",
            backgroundColor: "white",
          }}
          className="relative"
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">{location.name}</span>
              <Badge variant="outline" className="ml-2">
                {location.type}
              </Badge>
            </div>
            <div className="space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(location)
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(location)
                }}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      }
    />
  )
}

export function LocationHierarchy() {
  const [locations, setLocations] = useState<Location>(initialLocations)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  // Function to find a location by ID
  const findLocation = (id: string, tree: Location = locations): Location | undefined => {
    if (tree.id === id) {
      return tree
    }
    if (tree.children) {
      for (const child of tree.children) {
        const found = findLocation(id, child)
        if (found) {
          return found
        }
      }
    }
    return undefined
  }

  // Function to update a location
  const updateLocation = (updatedLocation: Location) => {
    const update = (tree: Location): Location => {
      if (tree.id === updatedLocation.id) {
        return { ...tree, ...updatedLocation }
      }
      if (tree.children) {
        return { ...tree, children: tree.children.map(update) }
      }
      return tree
    }
    setLocations(update(locations))
    setSelectedLocation(updatedLocation)
  }

  // Function to delete a location
  const deleteLocation = (locationToDelete: Location) => {
    const remove = (tree: Location): Location | null => {
      if (tree.children) {
        const newChildren = tree.children.filter((child) => child.id !== locationToDelete.id)
        if (newChildren.length < tree.children.length) {
          return { ...tree, children: newChildren }
        } else {
          return { ...tree, children: tree.children.map(remove).filter(Boolean) as Location[] }
        }
      }
      return tree
    }

    setLocations(remove(locations) as Location)
    setSelectedLocation(null)
  }

  // Function to move a location
  const moveLocation = (dragId: string, dropId: string) => {
    console.log(`Moving ${dragId} to ${dropId}`)
    // Implement the logic to move the location in the tree structure
  }

  // Function to add a new location
  const addLocation = (newLocation: Location, parentId: string) => {
    console.log(`Adding new location ${newLocation.name} to ${parentId}`)
    // Implement the logic to add the new location to the tree structure
  }

  // Handle location selection
  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location)
  }

  // Handle edit location
  const handleEditLocation = (location: Location) => {
    setSelectedLocation(location)
    setIsEditing(true)
  }

  // Handle add location
  const handleAddLocation = (parentId: string) => {
    setIsAdding(true)
  }

  // Handle delete location
  const handleDeleteLocation = (location: Location) => {
    deleteLocation(location)
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-full">
        {/* Tree View */}
        <Card className="w-1/3 border-r">
          <CardHeader>
            <CardTitle>Location Hierarchy</CardTitle>
            <CardDescription>Drag and drop to reorganize</CardDescription>
          </CardHeader>
          <CardContent className="overflow-auto">
            <ScrollArea className="h-[calc(100vh - 150px)]">
              <Tree lineWidth={"2px"} label={<span className="sr-only">Root</span>}>
                <LocationNode
                  location={locations}
                  onEdit={handleEditLocation}
                  onDelete={handleDeleteLocation}
                  onMove={moveLocation}
                />
              </Tree>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Location Details Panel */}
        <Card className="flex-1">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Location Details</CardTitle>
              <div>
                <Button variant="ghost" size="sm" onClick={() => setIsAdding(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Location
                </Button>
                <Button variant="ghost" size="sm" disabled={!selectedLocation} onClick={() => setIsEditing(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </div>
            </div>
            <CardDescription>View and edit location details</CardDescription>
          </CardHeader>
          <CardContent className="overflow-auto">
            {selectedLocation ? (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">{selectedLocation.name}</h3>
                <div className="text-sm text-muted-foreground">Type: {selectedLocation.type}</div>
                <div className="text-sm text-muted-foreground">Capacity: {selectedLocation.capacity}</div>
                <div className="flex items-center">
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  <span className="text-sm text-muted-foreground">
                    Security Level: {selectedLocation.securityLevel}
                  </span>
                </div>
                <div className="flex items-center">
                  <Thermometer className="mr-2 h-4 w-4" />
                  <span className="text-sm text-muted-foreground">Temperature: {selectedLocation.temperature}</span>
                </div>
                <div className="flex items-center">
                  <Percent className="mr-2 h-4 w-4" />
                  <span className="text-sm text-muted-foreground">Humidity: {selectedLocation.humidity}</span>
                </div>
                <div className="flex items-center">
                  <ImageIcon className="mr-2 h-4 w-4" />
                  <span className="text-sm text-muted-foreground">Dimensions: {selectedLocation.dimensions}</span>
                </div>
                <div className="flex items-center">
                  <List className="mr-2 h-4 w-4" />
                  <span className="text-sm text-muted-foreground">Insurance: {selectedLocation.insurance}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  <span className="text-sm text-muted-foreground">
                    Contents: {selectedLocation.contents.join(", ")}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">Select a location to view details.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </DndProvider>
  )
}
