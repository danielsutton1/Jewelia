"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const trainingNeedSchema = z.object({
  skillArea: z.string().min(1, "Skill area is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  affectedEmployees: z.string().min(1, "Affected employees are required"),
  priority: z.enum(["low", "medium", "high"]),
  suggestedTraining: z.string().min(1, "Suggested training is required"),
  estimatedCost: z.coerce.number().min(0, "Cost must be a positive number"),
  estimatedTimeRequired: z.coerce.number().min(0, "Time must be a positive number"),
})

type TrainingNeedFormValues = z.infer<typeof trainingNeedSchema>

interface NewTrainingNeedFormProps {
  onTrainingNeedCreate: (trainingNeed: TrainingNeedFormValues) => void;
  children: React.ReactNode;
}

export function NewTrainingNeedForm({ onTrainingNeedCreate, children }: NewTrainingNeedFormProps) {
  const form = useForm<TrainingNeedFormValues>({
    resolver: zodResolver(trainingNeedSchema),
    defaultValues: {
      skillArea: "",
      description: "",
      affectedEmployees: "",
      priority: "medium",
      suggestedTraining: "",
      estimatedCost: 0,
      estimatedTimeRequired: 8,
    },
  })

  const onSubmit = (values: TrainingNeedFormValues) => {
    onTrainingNeedCreate(values)
    form.reset();
    toast.success("New training need created successfully!")
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Create New Training Need</DialogTitle>
          <DialogDescription>
            Identify and document a new training need to address skill gaps.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="skillArea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skill Area</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Stone Setting Techniques" {...field} />
                  </FormControl>
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
                      placeholder="Describe the training need in detail..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="affectedEmployees"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Affected Employees</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., John Smith, Maria Garcia" {...field} />
                  </FormControl>
                   <FormDescription>
                    Comma-separated list of employee names.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="suggestedTraining"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Suggested Training</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Advanced Stone Setting Masterclass" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            <div className="grid grid-cols-3 gap-4">
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
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="estimatedCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Cost ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="estimatedTimeRequired"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time (hours)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Create Training Need</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 
 