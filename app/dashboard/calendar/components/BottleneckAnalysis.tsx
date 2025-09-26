import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { ProductionProject, ProductionStage } from '../types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Users, Clock, TrendingUp, BarChart2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { format, differenceInHours } from 'date-fns';

interface BottleneckAnalysisProps {
  projects: ProductionProject[];
}

interface PartnerWorkload {
  partner: string;
  currentStages: ProductionStage[];
  upcomingStages: ProductionStage[];
  totalHours: number;
  conflicts: {
    date: Date;
    stages: ProductionStage[];
  }[];
  metrics: {
    utilization: number;
    efficiency: number;
    onTimeDelivery: number;
    averageDelay: number;
    averageCost: number;
    averageQuality: number;
  };
}

export function BottleneckAnalysis({ projects }: BottleneckAnalysisProps) {
  const partnerWorkloads = useMemo<PartnerWorkload[]>(() => {
    const workloads: Record<string, PartnerWorkload> = {};
    const now = new Date();

    // Initialize workloads for all partners
    projects.forEach((project) => {
      project.stages.forEach((stage) => {
        if (!workloads[stage.partner]) {
          workloads[stage.partner] = {
            partner: stage.partner,
            currentStages: [],
            upcomingStages: [],
            totalHours: 0,
            conflicts: [],
            metrics: {
              utilization: 0,
              efficiency: 0,
              onTimeDelivery: 0,
              averageDelay: 0,
              averageCost: 0,
              averageQuality: 0,
            },
          };
        }
      });
    });

    // Analyze each stage
    projects.forEach((project) => {
      project.stages.forEach((stage: ProductionStage) => {
        const workload = workloads[stage.partner];
        const stageStart = new Date(stage.start);
        const stageEnd = new Date(stage.end);
        const stageDuration = differenceInHours(stageEnd, stageStart);

        if (stageStart <= now && stageEnd >= now) {
          workload.currentStages.push(stage);
        } else if (stageStart > now) {
          workload.upcomingStages.push(stage);
        }

        workload.totalHours += stageDuration;

        // Check for conflicts
        workload.upcomingStages.forEach((otherStage: ProductionStage) => {
          if (otherStage.id !== stage.id) {
            const overlap = Math.min(stageEnd.getTime(), new Date(otherStage.end).getTime()) -
              Math.max(stageStart.getTime(), new Date(otherStage.start).getTime());

            if (overlap > 0) {
              const conflictDate = new Date(Math.max(stageStart.getTime(), new Date(otherStage.start).getTime()));
              const existingConflict = workload.conflicts.find((c) =>
                c.date.getTime() === conflictDate.getTime()
              );

              if (existingConflict) {
                existingConflict.stages.push(stage);
              } else {
                workload.conflicts.push({
                  date: conflictDate,
                  stages: [stage, otherStage],
                });
              }
            }
          }
        });
      });
    });

    // Calculate metrics for each partner
    Object.values(workloads).forEach((workload) => {
      const completedStages = workload.currentStages.filter((s) => s.status === 'completed');
      const delayedStages = workload.currentStages.filter((s) => s.status === 'delayed');

      // Utilization: Current hours / Total available hours
      workload.metrics.utilization = Math.min(
        (workload.totalHours / (40 * 5)) * 100, // Assuming 40-hour work week
        100
      );

      // Efficiency: Completed stages / Total stages
      workload.metrics.efficiency =
        workload.currentStages.length > 0
          ? (completedStages.length / workload.currentStages.length) * 100
          : 0;

      // On-time delivery: Non-delayed stages / Total stages
      workload.metrics.onTimeDelivery =
        workload.currentStages.length > 0
          ? ((workload.currentStages.length - delayedStages.length) / workload.currentStages.length) * 100
          : 0;

      // Average delay: Sum of delays / Number of delayed stages
      if (delayedStages.length > 0) {
        const totalDelay = delayedStages.reduce((sum, stage: ProductionStage) => {
          const plannedEnd = new Date(stage.end);
          const actualEnd = new Date(stage.actualEnd ?? stage.end);
          return sum + differenceInHours(actualEnd, plannedEnd);
        }, 0);
        workload.metrics.averageDelay = totalDelay / delayedStages.length;
      } else {
        workload.metrics.averageDelay = 0;
      }

      // Average cost and quality
      const allStages = [...workload.currentStages, ...workload.upcomingStages];
      if (allStages.length > 0) {
        workload.metrics.averageCost = allStages.reduce((sum, s) => sum + (s.cost ?? 0), 0) / allStages.length;
        workload.metrics.averageQuality = allStages.reduce((sum, s) => sum + (s.quality ?? 0), 0) / allStages.length;
      } else {
        workload.metrics.averageCost = 0;
        workload.metrics.averageQuality = 0;
      }
    });

    return Object.values(workloads);
  }, [projects]);

  const sortedWorkloads = useMemo<PartnerWorkload[]>(() => {
    return [...partnerWorkloads].sort((a, b) => b.totalHours - a.totalHours);
  }, [partnerWorkloads]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Resource Analysis</h2>
      {sortedWorkloads.map((workload: PartnerWorkload) => (
        <Card key={workload.partner} className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <h3 className="font-medium">{workload.partner}</h3>
            </div>
            <div className="text-sm text-muted-foreground">
              {workload.totalHours.toFixed(1)} hours
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium mb-1">
                <BarChart2 className="h-4 w-4" />
                Resource Utilization
              </div>
              <Progress value={workload.metrics.utilization} className="h-2" />
              <div className="text-sm text-muted-foreground mt-1">
                {workload.metrics.utilization.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm font-medium mb-1">
                <TrendingUp className="h-4 w-4" />
                Efficiency
              </div>
              <Progress value={workload.metrics.efficiency} className="h-2" />
              <div className="text-sm text-muted-foreground mt-1">
                {workload.metrics.efficiency.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm font-medium mb-1">
                <Clock className="h-4 w-4" />
                On-Time Delivery
              </div>
              <Progress value={workload.metrics.onTimeDelivery} className="h-2" />
              <div className="text-sm text-muted-foreground mt-1">
                {workload.metrics.onTimeDelivery.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm font-medium mb-1">
                <AlertTriangle className="h-4 w-4" />
                Average Delay
              </div>
              <div className="text-sm text-muted-foreground">
                {workload.metrics.averageDelay.toFixed(1)} hours
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm font-medium mb-1">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full" />
                Avg. Cost
              </div>
              <div className="text-sm text-muted-foreground">
                ${workload.metrics.averageCost.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm font-medium mb-1">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full" />
                Avg. Quality
              </div>
              <div className="text-sm text-muted-foreground">
                {workload.metrics.averageQuality.toFixed(1)} / 10
              </div>
            </div>
          </div>

          {workload.currentStages.length > 0 && (
            <div className="mb-2">
              <div className="text-sm font-medium mb-1">Current Work</div>
              <div className="space-y-1">
                {workload.currentStages.map((stage: ProductionStage) => (
                  <div key={stage.id} className="text-sm">
                    {stage.name} - {stage.progress}% complete
                  </div>
                ))}
              </div>
            </div>
          )}

          {workload.conflicts.length > 0 && (
            <Alert variant="destructive" className="mt-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Resource Conflicts</AlertTitle>
              <AlertDescription>
                {workload.conflicts.map((conflict: { date: Date; stages: ProductionStage[] }) => (
                  <div key={conflict.date.toISOString()} className="mt-1">
                    <div className="font-medium">
                      {format(conflict.date, 'PPp')}
                    </div>
                    <div className="text-sm">
                      {conflict.stages.map((s: ProductionStage) => s.name).join(' & ')}
                    </div>
                  </div>
                ))}
              </AlertDescription>
            </Alert>
          )}

          {workload.upcomingStages.length > 0 && (
            <div className="mt-2">
              <div className="text-sm font-medium mb-1">Upcoming Work</div>
              <div className="space-y-1">
                {workload.upcomingStages.map((stage: ProductionStage) => (
                  <div key={stage.id} className="text-sm">
                    {stage.name} - {format(new Date(stage.start), 'PPp')}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
} 
 
 
 
 