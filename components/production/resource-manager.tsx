"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog as Modal, DialogContent as ModalContent, DialogFooter as ModalFooter, DialogHeader as ModalHeader, DialogTitle as ModalTitle } from "@/components/ui/dialog"
import { Users, Settings, Plus, Search, Filter, Database, Wrench, UserCheck, AlertCircle, CheckCircle, Clock, TrendingUp } from "lucide-react"

interface ResourceType {
  id: number
  type: string
  description?: string
}

interface Resource {
  id: string
  name: string
  type: string
  status?: string
  description?: string
  capacity?: number
  current_load?: number
  location_id?: string | null
  metadata?: Record<string, any>
}

interface WorkOrder {
  id: string
  itemDescription: string
}

export function ResourceManager() {
  const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([])
  const [selectedType, setSelectedType] = useState<string>("")
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [form, setForm] = useState<Partial<Resource>>({})
  const [showTypeModal, setShowTypeModal] = useState(false)
  const [editingType, setEditingType] = useState<ResourceType | null>(null)
  const [typeForm, setTypeForm] = useState<Partial<ResourceType>>({})
  const [typeError, setTypeError] = useState<string | null>(null)
  const [typeLoading, setTypeLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>("")
  const [filterName, setFilterName] = useState<string>("")
  const [filterLocation, setFilterLocation] = useState<string>("")
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [availableWorkOrders, setAvailableWorkOrders] = useState<WorkOrder[]>([])
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<string | null>(null)

  // Fetch resource types
  useEffect(() => {
    fetch("/api/resource-types")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setResourceTypes(json.data)
          if (!selectedType && json.data.length > 0) setSelectedType(json.data[0].type)
        }
      })
  }, [])

  // Fetch resources of selected type with filters
  useEffect(() => {
    if (!selectedType) return
    setLoading(true)
    let url = `/api/resources?type=${selectedType}`
    if (filterStatus) url += `&status=${encodeURIComponent(filterStatus)}`
    if (filterName) url += `&name=${encodeURIComponent(filterName)}`
    if (filterLocation) url += `&location_id=${encodeURIComponent(filterLocation)}`
    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setResources(json.data)
        else setError(json.error || "Failed to load resources")
        setLoading(false)
      })
      .catch(() => {
        setError("Failed to load resources")
        setLoading(false)
      })
  }, [selectedType, showDialog, filterStatus, filterName, filterLocation])

  // Fetch available work orders for assignment
  useEffect(() => {
    if (showAssignmentModal) {
      fetch("/api/work-orders")
        .then((res) => res.json())
        .then((json) => {
          if (json.success) setAvailableWorkOrders(json.data)
          else setError(json.error || "Failed to load work orders")
        })
        .catch(() => setError("Failed to load work orders"))
    }
  }, [showAssignmentModal])

  // Handle form changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // Open dialog for create/edit
  const openDialog = (resource?: Resource) => {
    setEditingResource(resource || null)
    setForm(resource || { type: selectedType })
    setShowDialog(true)
  }

  // Handle create/edit submit
  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    const method = editingResource ? "PUT" : "POST"
    const url = editingResource ? `/api/resources?id=${editingResource.id}` : "/api/resources"
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const json = await res.json()
    if (json.success) {
      setShowDialog(false)
      setForm({})
      setEditingResource(null)
      // Optimistically update UI
      if (editingResource) {
        setResources((prev) => prev.map((r) => (r.id === json.data.id ? json.data : r)))
      } else {
        setResources((prev) => [json.data, ...prev])
      }
    } else {
      setError(json.error || "Failed to save resource")
    }
    setLoading(false)
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) return
    setLoading(true)
    setError(null)
    const res = await fetch(`/api/resources?id=${id}`, { method: "DELETE" })
    const json = await res.json()
    if (json.success) {
      setResources((prev) => prev.filter((r) => r.id !== id))
    } else {
      setError(json.error || "Failed to delete resource")
    }
    setLoading(false)
  }

  // Resource type management handlers
  const openTypeModal = (type?: ResourceType) => {
    setEditingType(type || null)
    setTypeForm(type || {})
    setShowTypeModal(true)
  }
  const handleTypeFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTypeForm({ ...typeForm, [e.target.name]: e.target.value })
  }
  const handleTypeSubmit = async () => {
    setTypeLoading(true)
    setTypeError(null)
    const method = editingType ? "PUT" : "POST"
    const url = editingType ? `/api/resource-types?id=${editingType.id}` : "/api/resource-types"
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(typeForm),
    })
    const json = await res.json()
    if (json.success) {
      setShowTypeModal(false)
      setTypeForm({})
      setEditingType(null)
      // Refresh types
      fetch("/api/resource-types")
        .then((res) => res.json())
        .then((json) => {
          if (json.success) setResourceTypes(json.data)
        })
    } else {
      setTypeError(json.error || "Failed to save resource type")
    }
    setTypeLoading(false)
  }
  const handleTypeDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this resource type?")) return
    setTypeLoading(true)
    setTypeError(null)
    const res = await fetch(`/api/resource-types?id=${id}`, { method: "DELETE" })
    const json = await res.json()
    if (json.success) {
      setResourceTypes((prev) => prev.filter((t) => t.id !== id))
      setShowTypeModal(false)
    } else {
      setTypeError(json.error || "Failed to delete resource type")
    }
    setTypeLoading(false)
  }

  // Open assignment modal
  const openAssignmentModal = (resource: Resource) => {
    setSelectedResource(resource)
    setSelectedWorkOrder(resource.metadata?.assigned_to || null)
    setShowAssignmentModal(true)
  }

  // Handle assignment submit
  const handleAssignmentSubmit = async () => {
    if (!selectedResource) return
    setLoading(true)
    setError(null)
    const updatedMetadata = { ...selectedResource.metadata, assigned_to: selectedWorkOrder }
    const res = await fetch(`/api/resources?id=${selectedResource.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...selectedResource, metadata: updatedMetadata }),
    })
    const json = await res.json()
    if (json.success) {
      setResources((prev) => prev.map((r) => (r.id === selectedResource.id ? json.data : r)))
      setShowAssignmentModal(false)
    } else {
      setError(json.error || "Failed to assign resource")
    }
    setLoading(false)
  }

  // Mock data for resource summary
  const resourceSummary = {
    totalResources: resources.length,
    activeResources: resources.filter(r => r.status === 'active').length,
    equipmentCount: resources.filter(r => r.type === 'equipment').length,
    personnelCount: resources.filter(r => r.type === 'craftsperson').length,
    utilizationRate: 78,
    maintenanceDue: resources.filter(r => r.status === 'maintenance').length
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Resource Summary Cards - Matching Dashboard Style */}
      <div className="relative">
        <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"></div>
        <div className="relative p-4">
          <div className="w-full overflow-x-auto md:overflow-visible">
            <div className="flex md:grid md:grid-cols-4 gap-3 md:gap-4 min-w-[320px] md:min-w-0 flex-nowrap">
              <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                        <Database className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 truncate">Total Resources</h4>
                        <Badge variant="secondary" className="text-xs mt-1">
                          Overview
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                      {resourceSummary.totalResources}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <TrendingUp className="h-3 w-3" />
                      <span>+{resourceSummary.activeResources} active</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                    Total production resources available
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                        <Wrench className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 truncate">Equipment</h4>
                        <Badge variant="secondary" className="text-xs mt-1">
                          Assets
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                      {resourceSummary.equipmentCount}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      <span>{resourceSummary.utilizationRate}% utilization</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                    Production equipment and machinery
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 truncate">Personnel</h4>
                        <Badge variant="secondary" className="text-xs mt-1">
                          Staff
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                      {resourceSummary.personnelCount}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <UserCheck className="h-3 w-3" />
                      <span>{resourceSummary.activeResources} available</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                    Production staff and craftspeople
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                        <AlertCircle className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 truncate">Maintenance Due</h4>
                        <Badge variant="secondary" className="text-xs mt-1">
                          Alerts
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                      {resourceSummary.maintenanceDue}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-orange-600">
                      <Clock className="h-3 w-3" />
                      <span>Requires attention</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                    Equipment requiring maintenance
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Controls and Filters */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl"></div>
        <div className="relative p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-48 bg-white/80 backdrop-blur-sm border-slate-200">
                  <SelectValue placeholder="Select resource type" />
                </SelectTrigger>
                <SelectContent>
                  {resourceTypes.map((type) => (
                    <SelectItem key={type.id} value={type.type}>
                      {type.type.charAt(0).toUpperCase() + type.type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => openDialog()} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                <Plus className="mr-2 h-4 w-4" />
                Add Resource
              </Button>
              <Button onClick={() => openTypeModal()} variant="outline" className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300">
                <Settings className="mr-2 h-4 w-4" />
                Manage Types
              </Button>
            </div>
          </div>
          
          {/* Enhanced Filters */}
          <div className="flex gap-3 mt-4 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Filter by name" 
                value={filterName} 
                onChange={e => setFilterName(e.target.value)} 
                className="w-48 pl-10 bg-white/80 backdrop-blur-sm border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300" 
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Filter by status" 
                value={filterStatus} 
                onChange={e => setFilterStatus(e.target.value)} 
                className="w-40 pl-10 bg-white/80 backdrop-blur-sm border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300" 
              />
            </div>
            <Input 
              placeholder="Filter by location" 
              value={filterLocation} 
              onChange={e => setFilterLocation(e.target.value)} 
              className="w-40 bg-white/80 backdrop-blur-sm border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300" 
            />
          </div>
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="relative">
        <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl"></div>
        <div className="relative p-6">
          {error && <div className="text-red-600 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">{error}</div>}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              <span className="ml-2 text-slate-600">Loading resources...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="font-semibold text-slate-700">Name</TableHead>
                  <TableHead className="font-semibold text-slate-700">Status</TableHead>
                  <TableHead className="font-semibold text-slate-700">Description</TableHead>
                  <TableHead className="font-semibold text-slate-700">Assigned To</TableHead>
                  <TableHead className="font-semibold text-slate-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resources.map((resource) => (
                  <TableRow key={resource.id} className="hover:bg-slate-50/50 transition-colors duration-200">
                    <TableCell className="font-medium text-slate-800">{resource.name}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        resource.status === 'active' 
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                          : resource.status === 'maintenance' 
                            ? 'bg-orange-100 text-orange-700 border border-orange-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {resource.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-600">{resource.description}</TableCell>
                    <TableCell className="text-slate-600">{resource.metadata?.assigned_to || "None"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openDialog(resource)} className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300">
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(resource.id)} className="bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                          Delete
                        </Button>
                        {(resource.type === "equipment" || resource.type === "workstation") && (
                          <Button size="sm" variant="secondary" onClick={() => openAssignmentModal(resource)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-lg hover:shadow-xl transition-all duration-300">
                            Assign
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Enhanced Dialogs */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-800">{editingResource ? "Edit Resource" : "Add Resource"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              name="name"
              placeholder="Name"
              value={form.name || ""}
              onChange={handleFormChange}
              required
              className="bg-white/50 border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300"
            />
            <Input
              name="status"
              placeholder="Status (e.g. active, maintenance)"
              value={form.status || ""}
              onChange={handleFormChange}
              className="bg-white/50 border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300"
            />
            <Input
              name="description"
              placeholder="Description"
              value={form.description || ""}
              onChange={handleFormChange}
              className="bg-white/50 border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300"
            />
            <Input
              name="capacity"
              placeholder="Capacity (number)"
              type="number"
              value={form.capacity || ""}
              onChange={handleFormChange}
              className="bg-white/50 border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300"
            />
            <Input
              name="current_load"
              placeholder="Current Load (number)"
              type="number"
              value={form.current_load || ""}
              onChange={handleFormChange}
              className="bg-white/50 border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} className="border-slate-200">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
              {editingResource ? "Save Changes" : "Create Resource"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Modal open={showTypeModal} onOpenChange={setShowTypeModal}>
        <ModalContent className="max-w-md bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl">
          <ModalHeader>
            <ModalTitle className="text-xl font-semibold text-slate-800">{editingType ? "Edit Resource Type" : "Add Resource Type"}</ModalTitle>
          </ModalHeader>
          <div className="space-y-4">
            <Input
              name="type"
              placeholder="Type (e.g. craftsperson, equipment)"
              value={typeForm.type || ""}
              onChange={handleTypeFormChange}
              required
              className="bg-white/50 border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300"
            />
            <Input
              name="description"
              placeholder="Description"
              value={typeForm.description || ""}
              onChange={handleTypeFormChange}
              className="bg-white/50 border-slate-200 focus:bg-white focus:shadow-lg transition-all duration-300"
            />
            {typeError && <div className="text-red-600 p-3 bg-red-50 border border-red-200 rounded-lg">{typeError}</div>}
          </div>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowTypeModal(false)} className="border-slate-200">
              Cancel
            </Button>
            {editingType && (
              <Button variant="destructive" onClick={() => handleTypeDelete(editingType.id)} disabled={typeLoading} className="bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                Delete
              </Button>
            )}
            <Button onClick={handleTypeSubmit} disabled={typeLoading} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
              {editingType ? "Save Changes" : "Create Type"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal open={showAssignmentModal} onOpenChange={setShowAssignmentModal}>
        <ModalContent className="max-w-md bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl">
          <ModalHeader>
            <ModalTitle className="text-xl font-semibold text-slate-800">Assign Resource</ModalTitle>
          </ModalHeader>
          <div className="space-y-4">
            <Select value={selectedWorkOrder || ""} onValueChange={setSelectedWorkOrder}>
              <SelectTrigger className="bg-white/50 border-slate-200">
                <SelectValue placeholder="Select work order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {availableWorkOrders.map((order) => (
                  <SelectItem key={order.id} value={order.id}>
                    {order.id} - {order.itemDescription}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <ModalFooter>
            <Button variant="outline" onClick={() => setShowAssignmentModal(false)} className="border-slate-200">
              Cancel
            </Button>
            <Button onClick={handleAssignmentSubmit} disabled={loading} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
              Assign
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
} 