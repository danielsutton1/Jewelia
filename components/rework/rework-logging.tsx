"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, Trash2, Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

const correctiveActionSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  assignee: z.string().min(1, "Assignee is required"),
  dueDate: z.date({ required_error: "Due date is required" }),
  status: z.enum(["Not Started", "In Progress", "Completed"]),
});

const reworkFormSchema = z.object({
  originalWorkOrderId: z.string().min(1, "Work order ID is required"),
  issueDescription: z.string().min(10, "Issue description must be at least 10 characters"),
  rootCauseCategory: z.string().min(1, "Root cause category is required"),
  rootCauseDescription: z.string().min(10, "Root cause description must be at least 10 characters"),
  systemicIssue: z.boolean(),
  priority: z.enum(["low", "medium", "high", "critical"]),
  correctiveActions: z.array(correctiveActionSchema),
})

type ReworkFormValues = z.infer<typeof reworkFormSchema>

const mockUsers = [
  { id: "user-1", name: "Alice Johnson" },
  { id: "user-2", name: "Bob Williams" },
  { id: "user-3", name: "Charlie Brown" },
  { id: "user-4", name: "Diana Miller" },
];

export function ReworkLogging() {
  const form = useForm<ReworkFormValues>({
    resolver: zodResolver(reworkFormSchema),
    defaultValues: {
      originalWorkOrderId: "",
      issueDescription: "",
      rootCauseCategory: "",
      rootCauseDescription: "",
      systemicIssue: false,
      priority: "medium",
      correctiveActions: [
        { description: "", assignee: "", dueDate: new Date(), status: "Not Started" },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "correctiveActions",
  })

  function onSubmit(values: ReworkFormValues) {
    console.log({
      ...values,
      dateCreated: new Date(),
      status: "Open",
    })
    toast.success("Rework record created successfully!", {
      description: `Work Order ID: ${values.originalWorkOrderId}`,
    })
    form.reset()
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Log Rework Issue</CardTitle>
        <CardDescription>
          Document details about a rework issue to track and analyze for process improvement.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="originalWorkOrderId"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Original Work Order ID</FormLabel>
                        <FormControl>
                        <Input placeholder="e.g., WO-12345" {...field} />
                        </FormControl>
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
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>

            <FormField
              control={form.control}
              name="issueDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issue Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the issue that requires rework..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Card className="p-4 bg-muted/50">
              <CardHeader className="p-2">
                  <CardTitle className="text-lg">Root Cause Analysis</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                    control={form.control}
                    name="rootCauseCategory"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Root Cause Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="material_defect">Material Defect</SelectItem>
                            <SelectItem value="design_error">Design Error</SelectItem>
                            <SelectItem value="production_error">Production Error</SelectItem>
                            <SelectItem value="measurement_error">Measurement Error</SelectItem>
                            <SelectItem value="communication_error">Communication Error</SelectItem>
                            <SelectItem value="equipment_failure">Equipment Failure</SelectItem>
                            <SelectItem value="human_error">Human Error</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                      control={form.control}
                      name="systemicIssue"
                      render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-6">
                          <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                              <FormLabel>Systemic Issue</FormLabel>
                              <FormDescription>Check if this is a recurring or systemic issue.</FormDescription>
                          </div>
                          </FormItem>
                      )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="rootCauseDescription"
                    render={({ field }) => (
                    <FormItem className="mt-6">
                        <FormLabel>Root Cause Description</FormLabel>
                        <FormControl>
                        <Textarea
                            placeholder="Describe the root cause of the issue in detail..."
                            className="min-h-[100px]"
                            {...field}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </CardContent>
            </Card>

            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Corrective Actions</h3>
                    <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ description: "", assignee: "", dueDate: new Date(), status: "Not Started" })}
                    >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Action
                    </Button>
                </div>

                <div className="space-y-4">
                    {fields.map((field, index) => (
                    <Card key={field.id} className="p-4 relative">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <FormField
                            control={form.control}
                            name={`correctiveActions.${index}.description`}
                            render={({ field }) => (
                            <FormItem className="md:col-span-4">
                                <FormLabel>Action Description</FormLabel>
                                <FormControl>
                                <Textarea placeholder="Describe the corrective action..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`correctiveActions.${index}.assignee`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Assignee</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select user" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {mockUsers.map(user => (
                                        <SelectItem key={user.id} value={user.name}>{user.name}</SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`correctiveActions.${index}.dueDate`}
                            render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Due Date</FormLabel>
                                <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                        )}
                                    >
                                        {field.value ? (
                                        format(field.value, "PPP")
                                        ) : (
                                        <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                    />
                                </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`correctiveActions.${index}.status`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Not Started">Not Started</SelectItem>
                                        <SelectItem value="In Progress">In Progress</SelectItem>
                                        <SelectItem value="Completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => remove(index)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </Card>
                    ))}
                </div>
            </div>

            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Submitting..." : "Submit Rework Log"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
