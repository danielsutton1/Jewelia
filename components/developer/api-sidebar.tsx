"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface ApiSidebarProps {
  selectedEndpoint: string
  onSelectEndpoint: (endpoint: string) => void
}

interface EndpointGroup {
  name: string
  endpoints: {
    id: string
    name: string
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  }[]
}

const endpointGroups: EndpointGroup[] = [
  {
    name: "Inventory",
    endpoints: [
      { id: "list-inventory", name: "List Inventory Items", method: "GET" },
      { id: "get-inventory", name: "Get Inventory Item", method: "GET" },
      { id: "create-inventory", name: "Create Inventory Item", method: "POST" },
      { id: "update-inventory", name: "Update Inventory Item", method: "PUT" },
      { id: "delete-inventory", name: "Delete Inventory Item", method: "DELETE" },
    ],
  },
  {
    name: "Categories",
    endpoints: [
      { id: "list-categories", name: "List Categories", method: "GET" },
      { id: "get-category", name: "Get Category", method: "GET" },
      { id: "create-category", name: "Create Category", method: "POST" },
      { id: "update-category", name: "Update Category", method: "PUT" },
      { id: "delete-category", name: "Delete Category", method: "DELETE" },
    ],
  },
  {
    name: "Stones",
    endpoints: [
      { id: "list-stones", name: "List Stones", method: "GET" },
      { id: "get-stone", name: "Get Stone", method: "GET" },
      { id: "create-stone", name: "Create Stone", method: "POST" },
      { id: "update-stone", name: "Update Stone", method: "PUT" },
      { id: "delete-stone", name: "Delete Stone", method: "DELETE" },
    ],
  },
  {
    name: "Locations",
    endpoints: [
      { id: "list-locations", name: "List Locations", method: "GET" },
      { id: "get-location", name: "Get Location", method: "GET" },
      { id: "create-location", name: "Create Location", method: "POST" },
      { id: "update-location", name: "Update Location", method: "PUT" },
      { id: "delete-location", name: "Delete Location", method: "DELETE" },
    ],
  },
]

export function ApiSidebar({ selectedEndpoint, onSelectEndpoint }: ApiSidebarProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-muted p-4 font-medium">API Reference</div>
      <ScrollArea className="h-[calc(100vh-250px)]">
        <div className="p-4">
          {endpointGroups.map((group) => (
            <div key={group.name} className="mb-6">
              <h3 className="font-semibold mb-2 text-sm text-muted-foreground">{group.name}</h3>
              <ul className="space-y-1">
                {group.endpoints.map((endpoint) => (
                  <li key={endpoint.id}>
                    <button
                      onClick={() => onSelectEndpoint(endpoint.id)}
                      className={cn(
                        "flex items-center w-full text-left px-2 py-1 text-sm rounded-md",
                        selectedEndpoint === endpoint.id ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block w-12 text-xs font-mono mr-2 px-1 py-0.5 rounded",
                          endpoint.method === "GET" && "bg-blue-100 text-blue-800",
                          endpoint.method === "POST" && "bg-green-100 text-green-800",
                          endpoint.method === "PUT" && "bg-amber-100 text-amber-800",
                          endpoint.method === "PATCH" && "bg-purple-100 text-purple-800",
                          endpoint.method === "DELETE" && "bg-red-100 text-red-800",
                          selectedEndpoint === endpoint.id && "bg-primary-foreground text-primary",
                        )}
                      >
                        {endpoint.method}
                      </span>
                      <span className="truncate">{endpoint.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
