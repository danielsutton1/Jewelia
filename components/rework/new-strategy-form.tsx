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

const strategySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  targetRootCauses: z.string().min(1, "Target root causes are required"),
  estimatedCost: z.coerce.number().min(0, "Cost must be a positive number"),
  implementationTimeframe: z.string().min(1, "Timeframe is required"),
  estimatedEffectiveness: z.coerce.number().min(0).max(100, "Must be between 0 and 100"),
})

type StrategyFormValues = z.infer<typeof strategySchema>

interface NewStrategyFormProps {
  onStrategyCreate: (strategy: StrategyFormValues) => void;
  children: React.ReactNode;
}

export function NewStrategyForm({ onStrategyCreate, children }: NewStrategyFormProps) {
  const form = useForm<StrategyFormValues>({
    resolver: zodResolver(strategySchema),
    defaultValues: {
      title: "",
      description: "",
      targetRootCauses: "",
      estimatedCost: 0,
      implementationTimeframe: "",
      estimatedEffectiveness: 75,
    },
  })

  const onSubmit = (values: StrategyFormValues) => {
    onStrategyCreate(values)
    form.reset();
    toast.success("New prevention strategy created successfully!")
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Create New Prevention Strategy</DialogTitle>
          <DialogDescription>
            Define a new strategy to address common rework issues and improve processes.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Strategy Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Enhanced Material Inspection" {...field} />
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
                      placeholder="Describe the strategy in detail..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="targetRootCauses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Root Causes</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Material Defects, Production Errors" {...field} />
                  </FormControl>
                  <FormDescription>
                    Comma-separated list of root causes this strategy addresses.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-3 gap-4">
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
                name="implementationTimeframe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Implementation Timeframe</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 1-2 months" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="estimatedEffectiveness"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Effectiveness (%)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="100" {...field} />
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
              <Button type="submit">Create Strategy</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 
 