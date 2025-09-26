"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { ServiceSpecifications } from "./service-specifications"
import { FileUpload } from "./file-upload"
import type { ServiceType, MaterialProvision, ServiceRequestSpecification } from "@/types/service-request"

const formSchema = z.object({
  priority: z.string().min(1, {
    message: "Priority is required.",
  }),
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  currency: z.string().min(1, {
    message: "Currency is required.",
  }),
  serviceType: z.string().min(1, {
    message: "Service type is required.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  materialProvision: z.string().min(1, {
    message: "Material provision is required.",
  }),
  materialDetails: z.string().optional(),
  dueDate: z.date({
    required_error: "Due date is required.",
  }),
  budgetMin: z.coerce.number().min(0, {
    message: "Minimum budget must be a positive number.",
  }),
  budgetMax: z.coerce.number().min(0, {
    message: "Maximum budget must be a positive number.",
  }),
  tags: z.string().optional(),
}).refine((data) => data.budgetMax >= data.budgetMin, {
  message: "Maximum budget must be greater than or equal to minimum budget.",
  path: ["budgetMax"],
})

type FormValues = z.infer<typeof formSchema>

export function ServiceRequestForm() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("details")
  const [specifications, setSpecifications] = useState<ServiceRequestSpecification[]>([])
  const [files, setFiles] = useState<File[]>([])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      priority: "medium",
      title: "",
      currency: "USD",
      description: "",
      materialDetails: "",
      tags: "",
    },
  })

  function onSubmit(values: FormValues) {
    // In a real app, this would send the data to the server
    console.log({
      ...values,
      specifications,
      files,
      tags: values.tags ? values.tags.split(",").map((tag) => tag.trim()) : [],
      budgetRange: {
        min: values.budgetMin,
        max: values.budgetMax,
        currency: values.currency,
      },
    })

    // Navigate to the service requests list
    router.push("/dashboard/services")
  }

  const serviceTypes: { value: ServiceType; label: string }[] = [
    { value: "casting", label: "Casting" },
    { value: "stone-setting", label: "Stone Setting" },
    { value: "engraving", label: "Engraving" },
    { value: "polishing", label: "Polishing" },
    { value: "plating", label: "Plating" },
    { value: "repair", label: "Repair" },
    { value: "custom-design", label: "Custom Design" },
    { value: "appraisal", label: "Appraisal" },
    { value: "cad-modeling", label: "CAD Modeling" },
    { value: "3d-printing", label: "3D Printing" },
  ]

  const materialProvisionOptions: { value: MaterialProvision; label: string }[] = [
    { value: "client-provided", label: "Client Provided" },
    { value: "provider-sourced", label: "Provider Sourced" },
    { value: "mixed", label: "Mixed (Client & Provider)" },
  ]

  const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
  ]

  const currencies = [
    { value: "USD", label: "USD ($)" },
    { value: "EUR", label: "EUR (€)" },
    { value: "GBP", label: "GBP (£)" },
    { value: "CAD", label: "CAD ($)" },
    { value: "AUD", label: "AUD ($)" },
  ]

  const handleSpecificationsChange = (newSpecifications: ServiceRequestSpecification[]) => {
    setSpecifications(newSpecifications)
  }

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles)
  }

  const nextTab = () => {
    if (activeTab === "details") {
      setActiveTab("specifications")
    } else if (activeTab === "specifications") {
      setActiveTab("materials")
    } else if (activeTab === "materials") {
      setActiveTab("files")
    } else if (activeTab === "files") {
      setActiveTab("review")
    }
  }

  const prevTab = () => {
    if (activeTab === "specifications") {
      setActiveTab("details")
    } else if (activeTab === "materials") {
      setActiveTab("specifications")
    } else if (activeTab === "files") {
      setActiveTab("materials")
    } else if (activeTab === "review") {
      setActiveTab("files")
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>New Service Request</CardTitle>
                <CardDescription>Request external services from your partners</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-5 mb-6">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="specifications">Specifications</TabsTrigger>
                    <TabsTrigger value="materials">Materials</TabsTrigger>
                    <TabsTrigger value="files">Files</TabsTrigger>
                    <TabsTrigger value="review">Review</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Request Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Custom Ring Casting" {...field} />
                          </FormControl>
                          <FormDescription>A clear title that describes the service you need</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="serviceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a service type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {serviceTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>The type of service you are requesting</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe the service you need in detail..."
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>Provide a detailed description of the service you need</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {priorityOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>Set the priority level for this request</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., wedding, custom, rush" {...field} />
                          </FormControl>
                          <FormDescription>Comma-separated tags to categorize this request</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Button type="button" onClick={nextTab}>
                        Next: Specifications
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="specifications" className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Task Specifications</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Add specific details about the task requirements
                      </p>

                      <ServiceSpecifications specifications={specifications} onChange={handleSpecificationsChange} />
                    </div>

                    <div className="flex justify-between">
                      <Button type="button" variant="outline" onClick={prevTab}>
                        Back
                      </Button>
                      <Button type="button" onClick={nextTab}>
                        Next: Materials
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="materials" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="materialProvision"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Material Provision</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select who will provide materials" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {materialProvisionOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>Specify who will provide the materials for this task</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="materialDetails"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Material Details</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Provide details about the materials..."
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>Describe the materials that will be used or provided</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-between">
                      <Button type="button" variant="outline" onClick={prevTab}>
                        Back
                      </Button>
                      <Button type="button" onClick={nextTab}>
                        Next: Files
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="files" className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">File Attachments</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Upload files related to your service request (designs, references, etc.)
                      </p>

                      <FileUpload files={files} onChange={handleFilesChange} />
                    </div>

                    <div className="flex justify-between">
                      <Button type="button" variant="outline" onClick={prevTab}>
                        Back
                      </Button>
                      <Button type="button" onClick={nextTab}>
                        Next: Review
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="review" className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Review Your Request</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium">Request Details</h4>
                          <p className="text-sm">
                            <span className="font-medium">Title:</span> {form.watch("title") || "Not specified"}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Service Type:</span>{" "}
                            {serviceTypes.find((t) => t.value === form.watch("serviceType"))?.label || "Not specified"}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Priority:</span>{" "}
                            {priorityOptions.find((p) => p.value === form.watch("priority"))?.label || "Medium"}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Tags:</span> {form.watch("tags") || "None"}
                          </p>
                          <div className="text-sm">
                            <span className="font-medium">Description:</span>
                            <p className="mt-1 whitespace-pre-wrap">{form.watch("description") || "Not specified"}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium">Timeline & Budget</h4>
                          <p className="text-sm">
                            <span className="font-medium">Due Date:</span>{" "}
                            {form.watch("dueDate") ? format(form.watch("dueDate")!, "MMMM d, yyyy") : "Not specified"}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Budget Range:</span>{" "}
                            {form.watch("budgetMin") && form.watch("budgetMax")
                              ? `${form.watch("currency")} ${form.watch("budgetMin")} - ${form.watch("budgetMax")}`
                              : "Not specified"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <h4 className="font-medium">Materials</h4>
                        <p className="text-sm">
                          <span className="font-medium">Material Provision:</span>{" "}
                          {materialProvisionOptions.find((m) => m.value === form.watch("materialProvision"))?.label ||
                            "Not specified"}
                        </p>
                        <div className="text-sm">
                          <span className="font-medium">Material Details:</span>
                          <p className="mt-1 whitespace-pre-wrap">{form.watch("materialDetails") || "None"}</p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <h4 className="font-medium">Specifications</h4>
                        {specifications.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {specifications.map((spec) => (
                              <div key={spec.id} className="text-sm border rounded p-2">
                                <span className="font-medium">{spec.name}:</span> {spec.value} {spec.unit}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No specifications added</p>
                        )}
                      </div>

                      <div className="mt-4 space-y-2">
                        <h4 className="font-medium">Files</h4>
                        {files.length > 0 ? (
                          <div className="space-y-2">
                            {files.map((file, index) => (
                              <div key={index} className="text-sm border rounded p-2 flex items-center">
                                <span className="truncate flex-grow">{file.name}</span>
                                <span className="text-xs text-muted-foreground ml-2">
                                  {(file.size / 1024).toFixed(0)} KB
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No files attached</p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button type="button" variant="outline" onClick={prevTab}>
                        Back
                      </Button>
                      <Button type="submit">Submit Request</Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Request Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium">Service Type</h4>
                      <p className="text-sm">
                        {serviceTypes.find((t) => t.value === form.watch("serviceType"))?.label || "Not selected"}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Due Date</h4>
                      <FormField
                        control={form.control}
                        name="dueDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground",
                                    )}
                                  >
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Budget Range</h4>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div>
                          <FormField
                            control={form.control}
                            name="currency"
                            render={({ field }) => (
                              <FormItem>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Currency" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {currencies.map((currency) => (
                                      <SelectItem key={currency.value} value={currency.value}>
                                        {currency.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <FormField
                          control={form.control}
                          name="budgetMin"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input type="number" placeholder="Min" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="budgetMax"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input type="number" placeholder="Max" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Specifications</h4>
                      <p className="text-sm text-muted-foreground">{specifications.length} specification(s) added</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Files</h4>
                      <p className="text-sm text-muted-foreground">{files.length} file(s) attached</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Help</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-2">
                    <p>
                      <span className="font-medium">Be specific:</span> The more details you provide, the better matches
                      you'll get.
                    </p>
                    <p>
                      <span className="font-medium">Attach files:</span> Include reference images, designs, or
                      specifications.
                    </p>
                    <p>
                      <span className="font-medium">Set realistic deadlines:</span> Allow enough time for quality work.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
