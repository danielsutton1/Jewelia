"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, PenToolIcon as Tool, Calendar, Package, Clipboard } from "lucide-react"

interface EquipmentDetailsDialogProps {
  equipment: any
  open: boolean
  onClose: () => void
}

export function EquipmentDetailsDialog({ equipment, open, onClose }: EquipmentDetailsDialogProps) {
  if (!equipment) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {equipment.name} ({equipment.id})
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">General Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Type:</dt>
                      <dd>{equipment.type}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Manufacturer:</dt>
                      <dd>{equipment.manufacturer}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Model:</dt>
                      <dd>{equipment.model}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Serial Number:</dt>
                      <dd>{equipment.serialNumber}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Purchase Date:</dt>
                      <dd>{new Date(equipment.purchaseDate).toLocaleDateString()}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Location & Assignment</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Location:</dt>
                      <dd>{equipment.location}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Department:</dt>
                      <dd>{equipment.department}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Responsible Person:</dt>
                      <dd>John Smith</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Status:</dt>
                      <dd>{equipment.status.charAt(0).toUpperCase() + equipment.status.slice(1)}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    This equipment has specific technical specifications that are important for maintenance and
                    operation. Please refer to the manufacturer's documentation for detailed specifications.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="maintenance">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Maintenance Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Last Maintenance:</dt>
                      <dd>{new Date(equipment.lastMaintenance).toLocaleDateString()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Next Maintenance:</dt>
                      <dd>{new Date(equipment.nextMaintenance).toLocaleDateString()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Maintenance Interval:</dt>
                      <dd>90 days</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Service Provider:</dt>
                      <dd>JewelTech Services</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Recent Maintenance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Regular service on {new Date(equipment.lastMaintenance).toLocaleDateString()}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Tool className="h-4 w-4 text-muted-foreground" />
                      <span>Parts replacement on {new Date("2023-01-15").toLocaleDateString()}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Regular service on {new Date("2022-10-10").toLocaleDateString()}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Service Contract</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Contract Number:</dt>
                      <dd>SC-2023-{equipment.id}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Provider:</dt>
                      <dd>JewelTech Services</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Valid Until:</dt>
                      <dd>{new Date("2024-12-31").toLocaleDateString()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Coverage:</dt>
                      <dd>Full parts and labor</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="usage">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Usage Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Total Usage Hours:</dt>
                      <dd>{equipment.usageHours} hours</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Average Daily Usage:</dt>
                      <dd>4.5 hours</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Last Used:</dt>
                      <dd>{new Date().toLocaleDateString()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Lifetime Capacity:</dt>
                      <dd>10,000 hours</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Remaining Lifetime:</dt>
                      <dd>{10000 - equipment.usageHours} hours</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Recent Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Today, 9:00 AM - 12:00 PM (John Smith)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Tomorrow, 2:00 PM - 5:00 PM (Sarah Johnson)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>May 25, 10:00 AM - 4:00 PM (Michael Brown)</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Downtime History</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-red-500" />
                      <span>March 10-15, 2023 - Repair (Power supply failure)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-500" />
                      <span>January 15, 2023 - Scheduled maintenance</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-red-500" />
                      <span>November 5-7, 2022 - Repair (Calibration issue)</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="documents">
            <div className="grid grid-cols-1 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Documentation</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span>User Manual</span>
                      <Button variant="link" size="sm" className="ml-auto">
                        Download
                      </Button>
                    </li>
                    <li className="flex items-center gap-2">
                      <Tool className="h-4 w-4 text-muted-foreground" />
                      <span>Service Manual</span>
                      <Button variant="link" size="sm" className="ml-auto">
                        Download
                      </Button>
                    </li>
                    <li className="flex items-center gap-2">
                      <Clipboard className="h-4 w-4 text-muted-foreground" />
                      <span>Warranty Certificate</span>
                      <Button variant="link" size="sm" className="ml-auto">
                        Download
                      </Button>
                    </li>
                    <li className="flex items-center gap-2">
                      <Clipboard className="h-4 w-4 text-muted-foreground" />
                      <span>Calibration Certificate</span>
                      <Button variant="link" size="sm" className="ml-auto">
                        Download
                      </Button>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Tool className="mr-2 h-4 w-4" />
              Log Maintenance
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Book Equipment
            </Button>
          </div>
          <Button variant="default" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
