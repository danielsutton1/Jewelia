"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Camera, Check, X, ImageIcon } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

export function MobileInspectionForm() {
  const [activeTab, setActiveTab] = useState("details")
  const [photoCount, setPhotoCount] = useState(0)
  const [decision, setDecision] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-base">Diamond Ring (INS-001)</CardTitle>
          <p className="text-sm text-muted-foreground">Diamond Direct</p>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="checks">Checks</TabsTrigger>
          <TabsTrigger value="defects">Defects</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-4 space-y-4">
          <div className="space-y-3">
            <div className="grid gap-2">
              <Label htmlFor="order-id">Order ID</Label>
              <Input id="order-id" value="ORD-5782" readOnly />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="item-type">Item Type</Label>
              <Input id="item-type" value="Diamond Ring" readOnly />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="partner">Partner</Label>
              <Input id="partner" value="Diamond Direct" readOnly />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="received-date">Received Date</Label>
              <Input id="received-date" type="date" value="2023-05-15" readOnly />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Inspection Notes</Label>
              <Textarea id="notes" placeholder="Add inspection notes here..." />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="photos" className="mt-4 space-y-4">
          <div className="grid gap-4">
            <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8">
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="rounded-full bg-muted p-2">
                  <Camera className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Take Photo</p>
                  <p className="text-xs text-muted-foreground">{photoCount} photos taken</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setPhotoCount((prev) => prev + 1)}
              >
                <Camera className="h-4 w-4" />
                Camera
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setPhotoCount((prev) => prev + 1)}
              >
                <ImageIcon className="h-4 w-4" />
                Gallery
              </Button>
            </div>

            {photoCount > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: photoCount }).map((_, i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-md bg-muted"
                    style={{
                      backgroundImage: `url('/placeholder.svg?height=200&width=200&query=jewelry+inspection+photo+${i + 1}')`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute right-1 top-1 h-6 w-6"
                      onClick={() => setPhotoCount((prev) => prev - 1)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="checks" className="mt-4 space-y-4">
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="dimensions">
              <AccordionTrigger>Dimensions</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="ring-size">Ring Size</Label>
                      <span className="text-sm">7</span>
                    </div>
                    <Slider id="ring-size" defaultValue={[7]} max={13} min={3} step={0.5} />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="band-width">Band Width (mm)</Label>
                      <span className="text-sm">2.5 mm</span>
                    </div>
                    <Slider id="band-width" defaultValue={[2.5]} max={10} min={1} step={0.1} />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="diamond-size">Diamond Size (ct)</Label>
                      <span className="text-sm">1.2 ct</span>
                    </div>
                    <Slider id="diamond-size" defaultValue={[1.2]} max={5} min={0.1} step={0.1} />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="quality">
              <AccordionTrigger>Quality Checks</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="polish" />
                    <Label htmlFor="polish">Polish meets specifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="setting" />
                    <Label htmlFor="setting">Stone setting is secure</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="finish" />
                    <Label htmlFor="finish">Surface finish is consistent</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="hallmark" />
                    <Label htmlFor="hallmark">Hallmark is present and correct</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="weight" />
                    <Label htmlFor="weight">Weight matches specifications</Label>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="materials">
              <AccordionTrigger>Materials Verification</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="gold-karat" />
                    <Label htmlFor="gold-karat">Gold karat matches specification (18K)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="diamond-clarity" />
                    <Label htmlFor="diamond-clarity">Diamond clarity matches (VS1)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="diamond-color" />
                    <Label htmlFor="diamond-color">Diamond color matches (F)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="diamond-cert" />
                    <Label htmlFor="diamond-cert">Diamond certificate verified</Label>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        <TabsContent value="defects" className="mt-4 space-y-4">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Defect Category</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="">Select category</option>
                <option value="finish">Surface Finish</option>
                <option value="setting">Stone Setting</option>
                <option value="dimension">Dimensional</option>
                <option value="material">Material</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="defect-description">Defect Description</Label>
              <Textarea id="defect-description" placeholder="Describe the defect in detail..." />
            </div>

            <div className="grid gap-2">
              <Label>Severity</Label>
              <RadioGroup defaultValue="medium">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="severity-low" />
                  <Label htmlFor="severity-low">Low</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="severity-medium" />
                  <Label htmlFor="severity-medium">Medium</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="severity-high" />
                  <Label htmlFor="severity-high">High</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="critical" id="severity-critical" />
                  <Label htmlFor="severity-critical">Critical</Label>
                </div>
              </RadioGroup>
            </div>

            <Button variant="outline" className="w-full">
              Add Defect
            </Button>

            <div className="rounded-md border">
              <div className="p-3">
                <h4 className="font-medium">Recorded Defects</h4>
                <p className="text-sm text-muted-foreground">No defects recorded</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="fixed bottom-0 left-0 right-0 flex border-t bg-background p-4">
        <div className="grid w-full grid-cols-2 gap-2">
          <Button
            variant={decision === "reject" ? "destructive" : "outline"}
            className={cn("flex items-center gap-2", decision === "reject" && "text-white hover:text-white")}
            onClick={() => setDecision("reject")}
          >
            <X className="h-4 w-4" />
            Reject
          </Button>
          <Button
            variant={decision === "approve" ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => setDecision("approve")}
          >
            <Check className="h-4 w-4" />
            Approve
          </Button>
        </div>
      </div>
    </div>
  )
}
