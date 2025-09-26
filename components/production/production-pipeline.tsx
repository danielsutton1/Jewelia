"use client"

import * as React from "react"
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"
import type { ProductionStage, ProductionItem, StageStatus } from "./production-stage"
import { Card, CardContent } from "@/components/ui/card"
import { ProductionStage as StageComponent } from "./production-stage"
import { Button } from "@/components/ui/button"
import { RefreshCw, Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

// Sample data generator now accepts the stages and a date range to generate data for
function generateSampleData(stages: ProductionStage[], dateRange?: { from: Date; to: Date }) {
  const customers = [
    "Olivia Martin", "Jackson Lee", "Isabella Nguyen", "William Kim",
    "Sophia Chen", "Ethan Davis", "Emma Wilson", "Noah Garcia",
  ]
  const assignees = [
    "Michael Chen", "Sophia Rodriguez", "David Kim", "Emma Johnson",
    "James Wilson", "Olivia Martinez", "William Taylor", "Ava Thompson",
  ]
  const itemNames = [
    "Diamond Engagement Ring", "Gold Wedding Band", "Pearl Necklace", "Sapphire Earrings",
    "Emerald Bracelet", "Ruby Pendant", "Silver Cufflinks", "Platinum Watch",
    "Topaz Brooch", "Amethyst Anklet",
  ]
  
  // Design-specific statuses
  const designStatuses: StageStatus[] = ["review", "approved", "revise"]
  // Casting-specific statuses
  const castingStatuses: StageStatus[] = ["in-progress", "review", "approved", "revise"]
  // Generic statuses for other stages
  const genericStatuses: StageStatus[] = ["on-track", "delayed", "overdue"]

  const stageItems: Record<string, ProductionItem[]> = {}

  // Generate a pool of unique order numbers
  const totalOrders = 40;
  const orderNumbers = Array.from({ length: totalOrders }, (_, i) => `ORD-${1001 + i}`)
  let orderIndex = 0;

  stages.forEach((stage) => {
    if (stage === "design") {
      // Use actual design data from the design kanban page
      const actualDesignData = [
        {
          id: 'ORD-1002',
          name: 'Sapphire Pendant',
          customer: 'Ethan Davis',
          dueDate: 'Jul 20',
          status: 'review' as StageStatus,
          assignee: 'David Chen',
          notes: 'Sapphire pendant with diamond accents.',
        },
        {
          id: 'ORD-1003',
          name: 'Custom Bracelet',
          customer: 'Ava Martinez',
          dueDate: 'Jul 10',
          status: 'approved' as StageStatus,
          assignee: 'Emily Rodriguez',
          notes: 'Custom bracelet design with mixed metals.',
        },
        {
          id: 'ORD-1004',
          name: 'Wedding Band',
          customer: 'Liam Smith',
          dueDate: 'Jul 25',
          status: 'revise' as StageStatus,
          assignee: 'Michael Kim',
          notes: 'Wedding band design needs revision.',
        },
      ];
      stageItems[stage] = actualDesignData;
    } else if (stage === "cad") {
      // Use actual CAD data from the CAD kanban page
      const actualCADData = [
        {
          id: 'ORD-1001',
          name: 'Custom Engagement Ring',
          customer: 'Sophia Chen',
          dueDate: 'Jul 18',
          status: 'review' as StageStatus,
          assignee: 'Sarah Johnson',
          notes: '3D modeling for custom engagement ring with emerald center stone.',
        },
        {
          id: 'ORD-1002',
          name: 'Sapphire Pendant',
          customer: 'Ethan Davis',
          dueDate: 'Jul 25',
          status: 'review' as StageStatus,
          assignee: 'David Chen',
          notes: 'Sapphire pendant CAD model with diamond accents.',
        },
        {
          id: 'ORD-1003',
          name: 'Custom Bracelet',
          customer: 'Ava Martinez',
          dueDate: 'Jul 15',
          status: 'approved' as StageStatus,
          assignee: 'Emily Rodriguez',
          notes: 'Custom bracelet CAD with mixed metals design.',
        },
        {
          id: 'ORD-1004',
          name: 'Wedding Band',
          customer: 'Liam Smith',
          dueDate: 'Jul 30',
          status: 'revise' as StageStatus,
          assignee: 'Michael Kim',
          notes: 'Wedding band CAD needs revision for comfort fit.',
        },
      ];
      stageItems[stage] = actualCADData;
    } else if (stage === "casting") {
      // Use actual casting data from the casting kanban page
      const actualCastingData = [
        {
          id: 'ORD-1001',
          name: 'Custom Engagement Ring',
          customer: 'Sophia Chen',
          dueDate: 'Jul 22',
          status: 'in-progress' as StageStatus,
          assignee: 'Sarah Johnson',
          notes: 'Casting for custom engagement ring with emerald center stone.',
        },
        {
          id: 'ORD-1002',
          name: 'Sapphire Pendant',
          customer: 'Ethan Davis',
          dueDate: 'Jul 28',
          status: 'review' as StageStatus,
          assignee: 'David Chen',
          notes: 'Sapphire pendant casting with diamond accents.',
        },
        {
          id: 'ORD-1003',
          name: 'Custom Bracelet',
          customer: 'Ava Martinez',
          dueDate: 'Jul 19',
          status: 'approved' as StageStatus,
          assignee: 'Emily Rodriguez',
          notes: 'Custom bracelet casting with mixed metals design.',
        },
        {
          id: 'ORD-1004',
          name: 'Wedding Band',
          customer: 'Liam Smith',
          dueDate: 'Aug 1',
          status: 'revise' as StageStatus,
          assignee: 'Michael Kim',
          notes: 'Wedding band casting needs revision for comfort fit.',
        },
      ];
      stageItems[stage] = actualCastingData;
    } else if (stage === "setting") {
      // Use actual setting data from the setting kanban page
      const actualSettingData = [
        {
          id: 'ORD-1001',
          name: 'Custom Engagement Ring',
          customer: 'Sophia Chen',
          dueDate: 'Jul 25',
          status: 'in-progress' as StageStatus,
          assignee: 'Sarah Johnson',
          notes: 'Stone setting for custom engagement ring with emerald center stone.',
        },
        {
          id: 'ORD-1002',
          name: 'Sapphire Pendant',
          customer: 'Ethan Davis',
          dueDate: 'Jul 29',
          status: 'review' as StageStatus,
          assignee: 'David Chen',
          notes: 'Sapphire pendant stone setting with diamond accents.',
        },
        {
          id: 'ORD-1003',
          name: 'Custom Bracelet',
          customer: 'Ava Martinez',
          dueDate: 'Jul 22',
          status: 'approved' as StageStatus,
          assignee: 'Emily Rodriguez',
          notes: 'Custom bracelet stone setting with mixed metals design.',
        },
        {
          id: 'ORD-1004',
          name: 'Wedding Band',
          customer: 'Liam Smith',
          dueDate: 'Aug 3',
          status: 'revise' as StageStatus,
          assignee: 'Michael Kim',
          notes: 'Wedding band setting needs revision for comfort fit.',
        },
      ];
      stageItems[stage] = actualSettingData;
    } else if (stage === "polishing") {
      // Use actual polishing data from the polishing kanban page
      const actualPolishingData = [
        {
          id: 'ORD-1001',
          name: 'Custom Engagement Ring',
          customer: 'Sophia Chen',
          dueDate: 'Jul 25',
          status: 'in-progress' as StageStatus,
          assignee: 'Sarah Johnson',
          notes: 'High-gloss polishing for platinum engagement ring with diamond accents.',
        },
        {
          id: 'ORD-1002',
          name: 'Sapphire Pendant',
          customer: 'Ethan Davis',
          dueDate: 'Jul 29',
          status: 'review' as StageStatus,
          assignee: 'David Chen',
          notes: 'Matte finish polishing for gold pendant with sapphire center stone.',
        },
        {
          id: 'ORD-1003',
          name: 'Custom Bracelet',
          customer: 'Ava Martinez',
          dueDate: 'Jul 22',
          status: 'approved' as StageStatus,
          assignee: 'Emily Rodriguez',
          notes: 'Brushed finish for mixed metal bracelet with custom texture.',
        },
        {
          id: 'ORD-1004',
          name: 'Wedding Band',
          customer: 'Liam Smith',
          dueDate: 'Aug 3',
          status: 'revise' as StageStatus,
          assignee: 'Michael Kim',
          notes: 'Mirror finish needed for wedding band - current finish too matte.',
        },
      ];
      stageItems[stage] = actualPolishingData;
    } else if (stage === "qc") {
      // Use actual QC data from the QC kanban page
      const actualQCData = [
        {
          id: 'ORD-1001',
          name: 'Custom Engagement Ring',
          customer: 'Sophia Chen',
          dueDate: 'Jul 25',
          status: 'in-progress' as StageStatus,
          assignee: 'Sarah Johnson',
          notes: 'Final quality inspection for platinum engagement ring with diamond accents. Check stone security, finish quality, and overall craftsmanship.',
        },
        {
          id: 'ORD-1002',
          name: 'Sapphire Pendant',
          customer: 'Ethan Davis',
          dueDate: 'Jul 29',
          status: 'review' as StageStatus,
          assignee: 'David Chen',
          notes: 'Quality control for gold pendant with sapphire center stone. Verify stone setting, metal finish, and chain integrity.',
        },
        {
          id: 'ORD-1003',
          name: 'Custom Bracelet',
          customer: 'Ava Martinez',
          dueDate: 'Jul 22',
          status: 'approved' as StageStatus,
          assignee: 'Emily Rodriguez',
          notes: 'Mixed metal bracelet passed all quality checks. Stone security, finish, and clasp mechanism all meet standards.',
        },
        {
          id: 'ORD-1004',
          name: 'Wedding Band',
          customer: 'Liam Smith',
          dueDate: 'Aug 3',
          status: 'revise' as StageStatus,
          assignee: 'Michael Kim',
          notes: 'Wedding band failed quality inspection - minor scratch on inner band surface. Requires re-polishing before final approval.',
        },
      ];
      stageItems[stage] = actualQCData;
    } else {
      // Generate data for other stages
      const itemCount = Math.floor(Math.random() * 8) + 1 // 1-8 items per stage
      const items: ProductionItem[] = []

      for (let i = 0; i < itemCount; i++) {
        const randomStatus = genericStatuses[Math.floor(Math.random() * genericStatuses.length)]
        
        let dueDate: Date;
        if (dateRange && dateRange.from && dateRange.to) {
          // Generate a due date within the provided range
          const fromTime = dateRange.from.getTime();
          const toTime = dateRange.to.getTime();
          dueDate = new Date(fromTime + Math.random() * (toTime - fromTime));
        } else {
           // Default behavior if no date range
          const daysToAdd = randomStatus === "on-track" ? 7 : randomStatus === "delayed" ? 3 : 0
          dueDate = new Date()
          dueDate.setDate(dueDate.getDate() + daysToAdd)
        }

        const orderNumber = orderNumbers[orderIndex % orderNumbers.length]
        orderIndex++

        items.push({
          id: orderNumber,
          name: itemNames[Math.floor(Math.random() * itemNames.length)],
          customer: customers[Math.floor(Math.random() * customers.length)],
          dueDate: format(dueDate, "MMM d"),
          status: randomStatus,
          assignee: assignees[Math.floor(Math.random() * assignees.length)],
          notes: Math.random() > 0.7 ? "Customer requested rush" : undefined,
        })
      }
      stageItems[stage] = items
    }
  })

  return stageItems
}

const defaultSteps = [
  'Design',
  'CAD',
  'Casting',
  'Setting',
  'Polishing',
  'QC',
];

type DatePreset = 'today' | 'week' | 'month' | 'custom';

interface ProductionPipelineProps {
  visibleStages?: string[];
  dateRange?: DateRange | undefined;
}

export function ProductionPipeline({ visibleStages, dateRange }: ProductionPipelineProps) {
  const [isLoading, setIsLoading] = React.useState(true)
  const [steps, setSteps] = React.useState<string[]>(defaultSteps)
  const [stageItems, setStageItems] = React.useState<Record<string, ProductionItem[]>>({})
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  // Use visibleStages prop if provided, otherwise fall back to internal steps state
  const effectiveSteps = visibleStages || steps;

  // Memoize the mapped steps to avoid re-calculating on every render
  const productionStages = React.useMemo(
    () => effectiveSteps.map(s => s.toLowerCase() as ProductionStage),
    [effectiveSteps]
  );

  const fetchDataForRange = React.useCallback((range?: DateRange) => {
    setIsLoading(true);
    const effectiveRange = range?.from && range?.to ? { from: range.from, to: range.to } : undefined;
    setTimeout(() => {
      setStageItems(generateSampleData(productionStages, effectiveRange))
      setIsLoading(false)
      setIsRefreshing(false)
    }, 500)
  }, [productionStages]);

  // Re-fetch and re-generate data when the pipeline steps or date range change
  React.useEffect(() => {
    fetchDataForRange(dateRange)
  }, [productionStages, dateRange, fetchDataForRange])

  // Handle manual refresh
  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchDataForRange(dateRange)
  }

  return (
    <Card className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto w-full">
      <CardContent className="p-3 sm:p-4 md:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 md:gap-8 w-full px-2 md:px-0 justify-center overflow-x-auto">
          {effectiveSteps.map((step) => {
            const stageKey = step.toLowerCase() as ProductionStage;
            const items = stageItems[stageKey] || [];
            return (
              <div key={step} className="group relative flex flex-col items-center justify-center min-w-[180px] sm:min-w-[200px] p-3 sm:p-4 bg-white border-2 border-emerald-200 rounded-xl shadow-lg hover:shadow-xl transition-all">
                <StageComponent
                  stage={stageKey}
                  items={isLoading ? [] : items}
                  isLoading={isLoading}
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  )
}