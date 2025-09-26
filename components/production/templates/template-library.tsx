"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  Search,
  Filter,
  Plus,
  Clock,
  Star,
  FileText,
  MoreHorizontal,
  History,
  Copy,
  Edit,
  Trash2,
  Eye,
  Download,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ProductionTemplate } from "@/types/production-templates"

// Mock data for templates
const mockTemplates: ProductionTemplate[] = [
  {
    id: "1",
    name: "Classic Solitaire Ring",
    description: "Standard process for creating a classic solitaire engagement ring with 4-prong setting",
    category: "rings",
    subcategory: "engagement",
    version: "2.1.0",
    createdBy: "John Smith",
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-06-22"),
    publishedAt: new Date("2023-01-20"),
    status: "published",
    processes: [],
    materials: [],
    qualityCheckpoints: [],
    tools: [],
    estimatedTotalTime: 240,
    complexity: "moderate",
    tags: ["engagement", "solitaire", "prong-setting", "diamond"],
    imageUrl: "/assorted-jewelry-display.png",
    usageCount: 128,
    averageRating: 4.7,
  },
  {
    id: "2",
    name: "Three-Stone Diamond Ring",
    description: "Process for creating a three-stone diamond ring with side accent stones",
    category: "rings",
    subcategory: "engagement",
    version: "1.3.0",
    createdBy: "Sarah Johnson",
    createdAt: new Date("2023-02-10"),
    updatedAt: new Date("2023-05-15"),
    publishedAt: new Date("2023-02-15"),
    status: "published",
    processes: [],
    materials: [],
    qualityCheckpoints: [],
    tools: [],
    estimatedTotalTime: 360,
    complexity: "complex",
    tags: ["engagement", "three-stone", "accent-stones", "diamond"],
    imageUrl: "/sparkling-diamond-ring.png",
    usageCount: 87,
    averageRating: 4.5,
  },
  {
    id: "3",
    name: "Pearl Strand Necklace",
    description: "Standard process for creating a classic pearl strand necklace with secure clasp",
    category: "necklaces",
    subcategory: "pearl",
    version: "1.0.0",
    createdBy: "Michael Chen",
    createdAt: new Date("2023-03-05"),
    updatedAt: new Date("2023-03-05"),
    publishedAt: new Date("2023-03-10"),
    status: "published",
    processes: [],
    materials: [],
    qualityCheckpoints: [],
    tools: [],
    estimatedTotalTime: 180,
    complexity: "simple",
    tags: ["pearl", "strand", "necklace", "clasp"],
    imageUrl: "/pearl-necklace.png",
    usageCount: 42,
    averageRating: 4.2,
  },
  {
    id: "4",
    name: "Diamond Tennis Bracelet",
    description: "Process for creating a diamond tennis bracelet with secure clasp and safety chain",
    category: "bracelets",
    subcategory: "tennis",
    version: "1.5.0",
    createdBy: "Emily Rodriguez",
    createdAt: new Date("2023-01-20"),
    updatedAt: new Date("2023-04-12"),
    publishedAt: new Date("2023-01-25"),
    status: "published",
    processes: [],
    materials: [],
    qualityCheckpoints: [],
    tools: [],
    estimatedTotalTime: 420,
    complexity: "complex",
    tags: ["diamond", "tennis", "bracelet", "safety-chain"],
    imageUrl: "/emerald-bracelet.png",
    usageCount: 65,
    averageRating: 4.8,
  },
  {
    id: "5",
    name: "Hoop Earrings with Diamonds",
    description: "Process for creating diamond-studded hoop earrings with secure closures",
    category: "earrings",
    subcategory: "hoops",
    version: "1.2.0",
    createdBy: "David Wilson",
    createdAt: new Date("2023-02-28"),
    updatedAt: new Date("2023-05-30"),
    publishedAt: new Date("2023-03-05"),
    status: "published",
    processes: [],
    materials: [],
    qualityCheckpoints: [],
    tools: [],
    estimatedTotalTime: 300,
    complexity: "moderate",
    tags: ["diamond", "hoops", "earrings", "pave"],
    imageUrl: "/pearl-earrings.png",
    usageCount: 53,
    averageRating: 4.4,
  },
  {
    id: "6",
    name: "Custom Pendant Setting",
    description: "Template for custom pendant settings that can be adapted for various center stones",
    category: "pendants",
    subcategory: "custom",
    version: "0.9.0",
    createdBy: "Jessica Lee",
    createdAt: new Date("2023-04-15"),
    updatedAt: new Date("2023-04-15"),
    status: "draft",
    processes: [],
    materials: [],
    qualityCheckpoints: [],
    tools: [],
    estimatedTotalTime: 270,
    complexity: "complex",
    tags: ["pendant", "custom", "adaptable", "setting"],
    imageUrl: "/sapphire-pendant.png",
    usageCount: 0,
  },
]

// Version history mock data
const versionHistoryMock = [
  {
    version: "2.1.0",
    date: "2023-06-22",
    author: "John Smith",
    changes: "Optimized stone setting process, reduced time by 15%",
  },
  {
    version: "2.0.0",
    date: "2023-03-10",
    author: "Maria Garcia",
    changes: "Major update to quality checkpoints, added 3 new criteria",
  },
  {
    version: "1.2.0",
    date: "2022-11-15",
    author: "John Smith",
    changes: "Updated material requirements, added alternative options",
  },
  {
    version: "1.1.0",
    date: "2022-08-03",
    author: "Sarah Johnson",
    changes: "Added new polishing step, improved final finish quality",
  },
  { version: "1.0.0", date: "2022-05-20", author: "John Smith", changes: "Initial release" },
]

export function TemplateLibrary() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedComplexity, setSelectedComplexity] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [showVersionHistory, setShowVersionHistory] = useState(false)

  // Filter templates based on search query and filters
  const filteredTemplates = mockTemplates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory
    const matchesComplexity = selectedComplexity === "all" || template.complexity === selectedComplexity

    return matchesSearch && matchesCategory && matchesComplexity
  })

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const handleCreateTemplate = () => {
    router.push("/dashboard/production/templates/create")
  }

  const handleViewTemplate = (templateId: string) => {
    router.push(`/dashboard/production/templates/${templateId}`)
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Production Templates</h1>
          <p className="text-muted-foreground">Manage and apply standardized production processes</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button onClick={handleCreateTemplate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Template Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Total Templates</div>
              <div className="text-2xl font-bold">{mockTemplates.length}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Published</div>
              <div className="text-2xl font-bold">{mockTemplates.filter((t) => t.status === "published").length}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Most Used</div>
              <div className="text-lg font-medium truncate">
                {mockTemplates.sort((a, b) => b.usageCount - a.usageCount)[0]?.name}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Recently Updated</div>
              <div className="text-lg font-medium truncate">
                {mockTemplates.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0]?.name}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Popular Templates</CardTitle>
            <CardDescription>Most frequently used production templates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mockTemplates
                .sort((a, b) => b.usageCount - a.usageCount)
                .slice(0, 3)
                .map((template) => (
                  <Card key={template.id} className="overflow-hidden">
                    <div className="relative h-32">
                      <Image
                        src={template.imageUrl || "/placeholder.svg"}
                        alt={template.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardHeader className="p-3">
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        {formatTime(template.estimatedTotalTime)}
                      </div>
                    </CardHeader>
                    <div className="p-3 pt-0 flex justify-between">
                      <div className="flex items-center">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm ml-1">{template.averageRating || "-"}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">{template.usageCount} uses</div>
                    </div>
                  </Card>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <CardTitle>Template Library</CardTitle>
            <div className="flex items-center mt-2 md:mt-0">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                className="mr-2"
                onClick={() => setViewMode("grid")}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
              >
                Table
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search templates..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="rings">Rings</SelectItem>
                  <SelectItem value="necklaces">Necklaces</SelectItem>
                  <SelectItem value="earrings">Earrings</SelectItem>
                  <SelectItem value="bracelets">Bracelets</SelectItem>
                  <SelectItem value="pendants">Pendants</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedComplexity} onValueChange={setSelectedComplexity}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Complexity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Complexity</SelectItem>
                  <SelectItem value="simple">Simple</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="complex">Complex</SelectItem>
                  <SelectItem value="very complex">Very Complex</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No templates found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters to find what you're looking for.
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="overflow-hidden">
                  <div className="relative h-48">
                    <Image
                      src={template.imageUrl || "/placeholder.svg"}
                      alt={template.name}
                      fill
                      className="object-cover"
                    />
                    {template.status === "draft" && (
                      <Badge variant="secondary" className="absolute top-2 right-2">
                        Draft
                      </Badge>
                    )}
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{template.name}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewTemplate(template.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setShowVersionHistory(true)}>
                            <History className="mr-2 h-4 w-4" />
                            Version History
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription className="line-clamp-2">{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {template.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {template.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Category</p>
                        <p className="font-medium capitalize">{template.category}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Complexity</p>
                        <p className="font-medium capitalize">{template.complexity}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Time Estimate</p>
                        <p className="font-medium">{formatTime(template.estimatedTotalTime)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Version</p>
                        <p className="font-medium">{template.version}</p>
                      </div>
                    </div>
                  </CardContent>
                  <div className="p-3 pt-0 flex justify-between">
                    <div className="flex items-center">
                      {template.averageRating ? (
                        <>
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="ml-1 font-medium">{template.averageRating.toFixed(1)}</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground text-sm">No ratings</span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">{template.usageCount} uses</div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Complexity</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTemplates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          {template.name}
                          {template.status === "draft" && (
                            <Badge variant="outline" className="ml-2">
                              Draft
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{template.category}</TableCell>
                      <TableCell className="capitalize">{template.complexity}</TableCell>
                      <TableCell>{formatTime(template.estimatedTotalTime)}</TableCell>
                      <TableCell>{template.version}</TableCell>
                      <TableCell>{template.usageCount}</TableCell>
                      <TableCell>
                        {template.averageRating ? (
                          <div className="flex items-center">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="ml-1">{template.averageRating.toFixed(1)}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(template.updatedAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewTemplate(template.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setShowVersionHistory(true)}>
                              <History className="mr-2 h-4 w-4" />
                              Version History
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Version History Dialog */}
      <Dialog open={showVersionHistory} onOpenChange={setShowVersionHistory}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Version History</DialogTitle>
            <DialogDescription>Track changes and updates to this production template</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {versionHistoryMock.map((version, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">Version {version.version}</h4>
                      <p className="text-sm text-muted-foreground">
                        {version.date} by {version.author}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-3 w-3" />
                      Export
                    </Button>
                  </div>
                  <p className="text-sm">{version.changes}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVersionHistory(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
