"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus } from "lucide-react"

// Sample data - replace with actual data fetching
const sampleLaborCodes = [
  {
    id: "1",
    code: "LC-001",
    name: "Setting Round Diamond",
    description: "Setting a round brilliant diamond in a prong setting",
    timeEstimate: "1.5 hours",
    cost: 150,
    price: 200,
  },
  // Add more sample items...
]

const sampleItemTemplates = [
  {
    id: "1",
    code: "IT-001",
    name: "Classic Solitaire Ring",
    category: "Rings",
    materials: ["18K Gold", "Diamond"],
    laborCodes: ["Setting Round Diamond", "Polishing"],
    totalCost: 2500,
    basePrice: 3500,
  },
  // Add more sample items...
]

export function ItemTemplates() {
  const [activeTab, setActiveTab] = useState("labor-codes")
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="space-y-4">
      <Tabs defaultValue="labor-codes" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="labor-codes">Labor Codes</TabsTrigger>
          <TabsTrigger value="item-templates">Item Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="labor-codes" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Input
                placeholder="Search labor codes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[300px] rounded-[6px] border-2 border-emerald-600 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
              />
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Labor Code
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Time Estimate</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleLaborCodes.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell>{code.code}</TableCell>
                    <TableCell>{code.name}</TableCell>
                    <TableCell>{code.description}</TableCell>
                    <TableCell>{code.timeEstimate}</TableCell>
                    <TableCell>${code.cost}</TableCell>
                    <TableCell>${code.price}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>View Usage</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="item-templates" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[300px] rounded-[6px] border-2 border-emerald-600 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
              />
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Template
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Materials</TableHead>
                  <TableHead>Labor Codes</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>Base Price</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleItemTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>{template.code}</TableCell>
                    <TableCell>{template.name}</TableCell>
                    <TableCell>{template.category}</TableCell>
                    <TableCell>{template.materials.join(", ")}</TableCell>
                    <TableCell>{template.laborCodes.join(", ")}</TableCell>
                    <TableCell>${template.totalCost}</TableCell>
                    <TableCell>${template.basePrice}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Duplicate</DropdownMenuItem>
                          <DropdownMenuItem>View Usage</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 
 
 