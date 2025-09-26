"use client"

import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { CheckpointCategory } from "./checkpoint-category"
import { SignatureCapture } from "./signature-capture"
import { AlertCircle, CheckCircle2, AlertTriangle, ArrowLeftCircle, Camera, Upload, Download, Star, Target, Clock } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"

const formSchema = z.object({
  workOrderId: z.string().min(1, { message: "Work order ID is required" }),
  itemType: z.string().min(1, { message: "Item type is required" }),
  customerName: z.string().optional(),
  dueDate: z.string().optional(),
  materialType: z.string().min(1, { message: "Material type is required" }),
  stoneDetails: z.string().optional(),
  inspectorName: z.string().min(1, { message: "Inspector name is required" }),
  inspectionDate: z.string().min(1, { message: "Inspection date is required" }),
  overallNotes: z.string().optional(),
  signature: z.string().min(1, { message: "Signature is required" }),
  qualityScore: z.number().min(0).max(100),
  priority: z.string().optional(),
  estimatedTime: z.number().optional(),
})

export function InspectionForm() {
  const isMobile = useMobile()
  const [inspectionStatus, setInspectionStatus] = useState<"pending" | "approved" | "rejected" | "review">("pending")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [photos, setPhotos] = useState<string[]>([])
  const [measurements, setMeasurements] = useState({
    length: "",
    width: "",
    height: "",
    weight: "",
    ringSize: "",
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workOrderId: "",
      itemType: "",
      customerName: "",
      dueDate: new Date().toISOString().split("T")[0],
      materialType: "",
      stoneDetails: "",
      inspectorName: "",
      inspectionDate: new Date().toISOString().split("T")[0],
      overallNotes: "",
      signature: "",
      qualityScore: 85,
      priority: "normal",
      estimatedTime: 15,
    },
  })

  const [checkpoints, setCheckpoints] = useState({
    metalQuality: { passed: null, notes: "", severity: "low", measurements: "", photoUrl: "" },
    stoneSetting: { passed: null, notes: "", severity: "low", measurements: "", photoUrl: "" },
    finishQuality: { passed: null, notes: "", severity: "low", measurements: "", photoUrl: "" },
    measurements: { passed: null, notes: "", severity: "low", measurements: "", photoUrl: "" },
    functionality: { passed: null, notes: "", severity: "low", measurements: "", photoUrl: "" },
  })

  const handleFieldChange = (category: keyof typeof checkpoints, field: string, value: any) => {
    setCheckpoints((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }))
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newPhotos = Array.from(files).map(file => URL.createObjectURL(file))
      setPhotos(prev => [...prev, ...newPhotos])
      toast({
        title: "Photos Uploaded",
        description: `${files.length} photo(s) added to inspection`
      })
    }
  }

  const handleMeasurementChange = (field: string, value: string) => {
    setMeasurements(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const calculateQualityScore = () => {
    const passedCheckpoints = Object.values(checkpoints).filter(cp => cp.passed === true).length
    const totalCheckpoints = Object.keys(checkpoints).length
    return Math.round((passedCheckpoints / totalCheckpoints) * 100)
  }

  const getQualityLevel = (score: number) => {
    if (score >= 95) return { level: "Excellent", color: "text-green-600", bg: "bg-green-100" }
    if (score >= 85) return { level: "Good", color: "text-blue-600", bg: "bg-blue-100" }
    if (score >= 75) return { level: "Fair", color: "text-amber-600", bg: "bg-amber-100" }
    return { level: "Poor", color: "text-red-600", bg: "bg-red-100" }
  }

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Check if all checkpoints have been evaluated
    const allCheckpointsEvaluated = Object.values(checkpoints).every((cp) => cp.passed !== null)

    if (!allCheckpointsEvaluated) {
      toast({
        title: "Incomplete Inspection",
        description: "Please evaluate all checkpoints before submitting",
        variant: "destructive"
      })
      return
    }

    const qualityScore = calculateQualityScore()
    const qualityLevel = getQualityLevel(qualityScore)

    // In a real application, you would submit the form data to your backend
    console.log({ 
      ...values, 
      checkpoints, 
      photos, 
      measurements, 
      qualityScore,
      qualityLevel: qualityLevel.level
    })
    
    setShowConfirmation(true)
  }

  const handleApprove = () => {
    setInspectionStatus("approved")
    setShowConfirmation(true)
    toast({
      title: "Inspection Approved",
      description: "Item has passed quality control inspection"
    })
  }

  const handleReject = () => {
    setInspectionStatus("rejected")
    setShowConfirmation(true)
    toast({
      title: "Inspection Rejected",
      description: "Item has been rejected and sent back for rework",
      variant: "destructive"
    })
  }

  const handleRequestReview = () => {
    setInspectionStatus("review")
    setShowConfirmation(true)
    toast({
      title: "Review Requested",
      description: "Inspection has been submitted for manager review",
      variant: "default"
    })
  }

  const handleNewInspection = () => {
    form.reset()
    setCheckpoints({
      metalQuality: { passed: null, notes: "", severity: "low", measurements: "", photoUrl: "" },
      stoneSetting: { passed: null, notes: "", severity: "low", measurements: "", photoUrl: "" },
      finishQuality: { passed: null, notes: "", severity: "low", measurements: "", photoUrl: "" },
      measurements: { passed: null, notes: "", severity: "low", measurements: "", photoUrl: "" },
      functionality: { passed: null, notes: "", severity: "low", measurements: "", photoUrl: "" },
    })
    setInspectionStatus("pending")
    setShowConfirmation(false)
    setPhotos([])
    setMeasurements({
      length: "",
      width: "",
      height: "",
      weight: "",
      ringSize: "",
    })
  }

  const qualityScore = calculateQualityScore()
  const qualityLevel = getQualityLevel(qualityScore)

  if (showConfirmation) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">
            Inspection{" "}
            {inspectionStatus === "approved"
              ? "Approved"
              : inspectionStatus === "rejected"
                ? "Rejected"
                : "Submitted for Review"}
          </CardTitle>
          <CardDescription>
            Work Order: {form.getValues().workOrderId} | Item: {form.getValues().itemType}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert
            variant={
              inspectionStatus === "approved" ? "default" : inspectionStatus === "rejected" ? "destructive" : "default"
            }
          >
            {inspectionStatus === "approved" && <CheckCircle2 className="h-4 w-4" />}
            {inspectionStatus === "rejected" && <AlertCircle className="h-4 w-4" />}
            {inspectionStatus === "review" && <AlertTriangle className="h-4 w-4" />}
            <AlertTitle>
              {inspectionStatus === "approved" && "Item Approved for Delivery"}
              {inspectionStatus === "rejected" && "Item Returned to Production"}
              {inspectionStatus === "review" && "Manager Review Requested"}
            </AlertTitle>
            <AlertDescription>
              {inspectionStatus === "approved" && "This item has passed quality control and is ready for delivery."}
              {inspectionStatus === "rejected" && "This item has been sent back to production for corrections."}
              {inspectionStatus === "review" && "This item has been submitted for manager review."}
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium">Quality Score</p>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${qualityLevel.color}`}>{qualityScore}%</span>
                <Badge className={qualityLevel.bg + " " + qualityLevel.color}>
                  {qualityLevel.level}
                </Badge>
              </div>
              <Progress value={qualityScore} className="h-2" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Inspection Summary</p>
              <div className="text-sm space-y-1">
                <p>Total Checkpoints: 5</p>
                <p>Passed: {Object.values(checkpoints).filter(cp => cp.passed === true).length}</p>
                <p>Failed: {Object.values(checkpoints).filter(cp => cp.passed === false).length}</p>
                <p>Photos Taken: {photos.length}</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button onClick={handleNewInspection} className="w-full">
              <ArrowLeftCircle className="mr-2 h-4 w-4" />
              Start New Inspection
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Quality Score Display */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Quality Score</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${qualityLevel.color}`}>{qualityScore}%</span>
                    <Badge className={qualityLevel.bg + " " + qualityLevel.color}>
                      {qualityLevel.level}
                    </Badge>
                  </div>
                </div>
              </div>
              <Progress value={qualityScore} className="w-32 h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Work Order Details</CardTitle>
            <CardDescription>Enter the details of the item being inspected</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="workOrderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Order ID</FormLabel>
                    <FormControl>
                      <Input placeholder="WO-12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="itemType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select item type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ring">Ring</SelectItem>
                        <SelectItem value="necklace">Necklace</SelectItem>
                        <SelectItem value="bracelet">Bracelet</SelectItem>
                        <SelectItem value="earrings">Earrings</SelectItem>
                        <SelectItem value="pendant">Pendant</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Customer name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Item Specifications</CardTitle>
            <CardDescription>Enter the specifications of the item</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="materialType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select material type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="14k-gold">14K Gold</SelectItem>
                        <SelectItem value="18k-gold">18K Gold</SelectItem>
                        <SelectItem value="platinum">Platinum</SelectItem>
                        <SelectItem value="silver">Silver</SelectItem>
                        <SelectItem value="white-gold">White Gold</SelectItem>
                        <SelectItem value="rose-gold">Rose Gold</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stoneDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stone Details</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter stone details (type, size, quantity)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Measurements Section */}
        <Card>
          <CardHeader>
            <CardTitle>Measurements</CardTitle>
            <CardDescription>Record precise measurements of the item</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label>Length (mm)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={measurements.length}
                  onChange={(e) => handleMeasurementChange("length", e.target.value)}
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label>Width (mm)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={measurements.width}
                  onChange={(e) => handleMeasurementChange("width", e.target.value)}
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label>Height (mm)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={measurements.height}
                  onChange={(e) => handleMeasurementChange("height", e.target.value)}
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label>Weight (g)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={measurements.weight}
                  onChange={(e) => handleMeasurementChange("weight", e.target.value)}
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label>Ring Size</Label>
                <Input
                  type="number"
                  placeholder="0.0"
                  value={measurements.ringSize}
                  onChange={(e) => handleMeasurementChange("ringSize", e.target.value)}
                  step="0.5"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Photo Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>Photo Documentation</CardTitle>
            <CardDescription>Upload photos of the item for quality documentation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-4 w-4 mr-2" />
                Take Photos
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Photos
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            {photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={photo}
                      alt={`Inspection photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                      onClick={() => setPhotos(prev => prev.filter((_, i) => i !== index))}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quality Checkpoints</CardTitle>
            <CardDescription>Evaluate each quality aspect of the item</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <CheckpointCategory
              title="Metal Quality"
              description="Inspect for proper alloy, color consistency, and absence of defects"
              checkpoint={checkpoints.metalQuality}
              onChange={(field, value) => handleFieldChange("metalQuality", field, value)}
            />

            <Separator />

            <CheckpointCategory
              title="Stone Setting"
              description="Verify secure setting, proper alignment, and prong integrity"
              checkpoint={checkpoints.stoneSetting}
              onChange={(field, value) => handleFieldChange("stoneSetting", field, value)}
            />

            <Separator />

            <CheckpointCategory
              title="Finish Quality"
              description="Check for proper polish, absence of scratches, and consistent finish"
              checkpoint={checkpoints.finishQuality}
              onChange={(field, value) => handleFieldChange("finishQuality", field, value)}
            />

            <Separator />

            <CheckpointCategory
              title="Measurements"
              description="Verify dimensions match specifications"
              checkpoint={checkpoints.measurements}
              onChange={(field, value) => handleFieldChange("measurements", field, value)}
            />

            <Separator />

            <CheckpointCategory
              title="Functionality"
              description="Test clasps, hinges, and moving parts for proper operation"
              checkpoint={checkpoints.functionality}
              onChange={(field, value) => handleFieldChange("functionality", field, value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inspector Information</CardTitle>
            <CardDescription>Enter your information and overall assessment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="inspectorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inspector Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="inspectionDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inspection Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="overallNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Overall Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter any additional notes about the inspection" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="signature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Digital Signature</FormLabel>
                  <FormControl>
                    <SignatureCapture value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormDescription>Please sign to certify this inspection</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button type="submit" className="flex-1">
            Submit Inspection
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleApprove}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button type="button" variant="outline" onClick={handleReject}>
              <AlertCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button type="button" variant="outline" onClick={handleRequestReview}>
              <AlertTriangle className="h-4 w-4 mr-2" />
              Request Review
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
