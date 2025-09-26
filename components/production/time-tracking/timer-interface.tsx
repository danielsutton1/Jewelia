"use client"

import * as React from "react"
import { Coffee, Pause, Play, RotateCcw, Save, CheckCircle2, ChevronDown, ChevronUp, AlertCircle, Target, Clock, Zap, Bell, Settings } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"

// Enhanced mock data for work orders
const workOrders = [
  {
    id: "WO-1234",
    description: "Diamond Engagement Ring",
    customer: "Emma Thompson",
    stages: ["Design/CAD", "Wax/3D Print", "Casting", "Stone Setting", "Polishing", "QC"],
    priority: "high",
    dueDate: "2023-06-15",
    estimatedHours: 12,
    completedHours: 8.5,
    status: "in-progress"
  },
  {
    id: "WO-1235",
    description: "Gold Wedding Band",
    customer: "James Wilson",
    stages: ["Design/CAD", "Wax/3D Print", "Casting", "Polishing", "QC"],
    priority: "medium",
    dueDate: "2023-06-20",
    estimatedHours: 8,
    completedHours: 3.2,
    status: "in-progress"
  },
  {
    id: "WO-1236",
    description: "Pearl Necklace",
    customer: "Sophia Rodriguez",
    stages: ["Design/CAD", "Assembly", "Polishing", "QC"],
    priority: "low",
    dueDate: "2023-06-25",
    estimatedHours: 6,
    completedHours: 0,
    status: "pending"
  },
]

// Mock data for productivity goals
const productivityGoals = {
  dailyHours: 8,
  weeklyHours: 40,
  efficiency: 90,
  currentDaily: 6.5,
  currentWeekly: 32.5
}

export function TimerInterface() {
  const [isRunning, setIsRunning] = React.useState(false)
  const [isBreak, setIsBreak] = React.useState(false)
  const [elapsedTime, setElapsedTime] = React.useState(0) // in seconds
  const [breakTime, setBreakTime] = React.useState(0) // in seconds
  const [selectedWorkOrder, setSelectedWorkOrder] = React.useState<string | null>(null)
  const [selectedStage, setSelectedStage] = React.useState<string | null>(null)
  const [notes, setNotes] = React.useState("")
  const [showTaskSwitcher, setShowTaskSwitcher] = React.useState(false)
  const [recentEntries, setRecentEntries] = React.useState<any[]>([])
  const [showSettings, setShowSettings] = React.useState(false)
  const [autoPause, setAutoPause] = React.useState(true)
  const [breakReminders, setBreakReminders] = React.useState(true)
  const [goalNotifications, setGoalNotifications] = React.useState(true)
  const [sessionStartTime, setSessionStartTime] = React.useState<Date | null>(null)
  const [lastActivity, setLastActivity] = React.useState<Date>(new Date())

  const timerRef = React.useRef<NodeJS.Timeout | null>(null)
  const breakTimerRef = React.useRef<NodeJS.Timeout | null>(null)
  const inactivityRef = React.useRef<NodeJS.Timeout | null>(null)

  // Get the selected work order object
  const workOrder = workOrders.find((wo) => wo.id === selectedWorkOrder)

  // Format time as HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`
  }

  // Format time as decimal hours
  const formatHours = (seconds: number) => {
    return (seconds / 3600).toFixed(2)
  }

  // Calculate progress for work order
  const getWorkOrderProgress = (wo: any) => {
    return Math.round((wo.completedHours / wo.estimatedHours) * 100)
  }

  // Check if approaching overtime
  const isApproachingOvertime = () => {
    const currentHours = elapsedTime / 3600
    return currentHours >= productivityGoals.dailyHours * 0.9 // 90% of daily goal
  }

  // Check if daily goal is met
  const isDailyGoalMet = () => {
    const currentHours = elapsedTime / 3600
    return currentHours >= productivityGoals.dailyHours
  }

  // Handle user activity
  const handleUserActivity = () => {
    setLastActivity(new Date())
    if (inactivityRef.current) {
      clearTimeout(inactivityRef.current)
    }
    
    if (autoPause && isRunning) {
      inactivityRef.current = setTimeout(() => {
        if (isRunning) {
          toggleTimer() // Pause timer
          toast({
            title: "Timer Paused",
            description: "Timer paused due to inactivity. Click to resume.",
          })
        }
      }, 5 * 60 * 1000) // 5 minutes
    }
  }

  // Start/stop the timer
  const toggleTimer = () => {
    if (!selectedWorkOrder || !selectedStage) {
      toast({
        title: "Selection Required",
        description: "Please select a work order and stage before starting the timer",
        variant: "destructive"
      })
      return
    }

    if (isRunning) {
      // Stop the timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      setIsRunning(false)
      setSessionStartTime(null)
    } else {
      // Start the timer
      setIsRunning(true)
      setSessionStartTime(new Date())
      setLastActivity(new Date())
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1)
      }, 1000)
    }
  }

  // Toggle break timer
  const toggleBreak = () => {
    if (isBreak) {
      // End break
      if (breakTimerRef.current) {
        clearInterval(breakTimerRef.current)
        breakTimerRef.current = null
      }
      setIsBreak(false)

      // Resume main timer if it was running
      if (isRunning) {
        timerRef.current = setInterval(() => {
          setElapsedTime((prev) => prev + 1)
        }, 1000)
      }
      
      toast({
        title: "Break Ended",
        description: "Break timer stopped. Back to work!"
      })
    } else {
      // Start break
      setIsBreak(true)

      // Pause main timer if it's running
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      // Start break timer
      breakTimerRef.current = setInterval(() => {
        setBreakTime((prev) => prev + 1)
      }, 1000)
      
      toast({
        title: "Break Started",
        description: "Take a well-deserved break!"
      })
    }
  }

  // Reset the timer
  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (breakTimerRef.current) {
      clearInterval(breakTimerRef.current)
      breakTimerRef.current = null
    }
    setIsRunning(false)
    setIsBreak(false)
    setElapsedTime(0)
    setBreakTime(0)
    setSessionStartTime(null)
  }

  // Save the current time entry
  const saveTimeEntry = () => {
    if (!selectedWorkOrder || !selectedStage || elapsedTime === 0) {
      toast({
        title: "Invalid Entry",
        description: "Please select a work order and stage, and track some time before saving",
        variant: "destructive"
      })
      return
    }

    const newEntry = {
      id: `entry-${Date.now()}`,
      workOrderId: selectedWorkOrder,
      workOrderDescription: workOrder?.description || "",
      stage: selectedStage,
      timeSpent: elapsedTime,
      breakTime: breakTime,
      notes: notes,
      timestamp: new Date().toISOString(),
      sessionStartTime: sessionStartTime?.toISOString(),
    }

    // In a real app, you would send this to your API
    console.log("Saving time entry:", newEntry)

    // Add to recent entries
    setRecentEntries((prev) => [newEntry, ...prev].slice(0, 5))

    // Reset the form
    resetTimer()
    setNotes("")
    
    toast({
      title: "Time Entry Saved",
      description: `${formatHours(elapsedTime)} hours saved for ${workOrder?.description}`
    })
  }

  // Complete the current task
  const completeTask = () => {
    saveTimeEntry()
    // In a real app, you would also mark the task as complete in your API
    toast({
      title: "Task Completed",
      description: "Great task! Task marked as complete."
    })
  }

  // Quick start timer for a work order
  const quickStart = (workOrderId: string, stage: string) => {
    setSelectedWorkOrder(workOrderId)
    setSelectedStage(stage)
    
    // Auto-start if enabled
    setTimeout(() => {
      if (!isRunning) {
        toggleTimer()
      }
    }, 100)
  }

  // Set up activity listeners
  React.useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, true)
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true)
      })
    }
  }, [isRunning, autoPause])

  // Check for goal achievements
  React.useEffect(() => {
    if (goalNotifications && isDailyGoalMet() && !isBreak) {
      toast({
        title: "🎉 Daily Goal Achieved!",
        description: `You've reached your daily goal of ${productivityGoals.dailyHours} hours!`,
      })
    }
  }, [elapsedTime, goalNotifications])

  // Check for overtime warnings
  React.useEffect(() => {
    if (isApproachingOvertime() && !isBreak) {
      toast({
        title: "⚠️ Approaching Overtime",
        description: "You're approaching your daily hours limit. Consider taking a break.",
        variant: "destructive"
      })
    }
  }, [elapsedTime])

  // Clean up on unmount
  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (breakTimerRef.current) clearInterval(breakTimerRef.current)
      if (inactivityRef.current) clearTimeout(inactivityRef.current)
    }
  }, [])

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Time Tracker</CardTitle>
            <CardDescription>Track time spent on production tasks</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timer Display */}
        <div className="flex flex-col items-center justify-center space-y-4 rounded-lg bg-muted p-6">
          <div className="text-center">
            <div className="text-4xl font-mono font-bold">
              {isBreak ? formatTime(breakTime) : formatTime(elapsedTime)}
            </div>
            <p className="text-sm text-muted-foreground">
              {isBreak ? "Break Time" : "Work Time"}
            </p>
          </div>

          {/* Progress Indicators */}
          <div className="w-full space-y-2">
            <div className="flex justify-between text-sm">
              <span>Daily Progress</span>
              <span>{formatHours(elapsedTime)} / {productivityGoals.dailyHours}h</span>
            </div>
            <Progress 
              value={(elapsedTime / (productivityGoals.dailyHours * 3600)) * 100} 
              className="h-2"
            />
          </div>

          {/* Timer Controls */}
          <div className="flex items-center gap-2">
            <Button
              size="lg"
              onClick={toggleTimer}
              disabled={!selectedWorkOrder || !selectedStage}
              className={cn(
                "min-w-[120px]",
                isRunning ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
              )}
            >
              {isRunning ? (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={toggleBreak}
              disabled={!selectedWorkOrder}
            >
              <Coffee className="mr-2 h-4 w-4" />
              {isBreak ? "End Break" : "Break"}
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={resetTimer}
              disabled={elapsedTime === 0 && breakTime === 0}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        {/* Work Order Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Work Order</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTaskSwitcher(!showTaskSwitcher)}
            >
              {showTaskSwitcher ? (
                <>
                  <ChevronUp className="mr-1 h-4 w-4" />
                  Hide
                </>
              ) : (
                <>
                  <ChevronDown className="mr-1 h-4 w-4" />
                  Switch Task
                </>
              )}
            </Button>
          </div>

          <Select value={selectedWorkOrder || ""} onValueChange={setSelectedWorkOrder}>
            <SelectTrigger>
              <SelectValue placeholder="Select a work order" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Active Work Orders</SelectLabel>
                {workOrders.map((wo) => (
                  <SelectItem key={wo.id} value={wo.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{wo.id} - {wo.description}</span>
                      <Badge variant={wo.priority === "high" ? "destructive" : "secondary"}>
                        {wo.priority}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {workOrder && (
            <div className="p-3 rounded-lg bg-muted space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{workOrder.description}</span>
                <Badge variant={workOrder.status === "in-progress" ? "default" : "secondary"}>
                  {workOrder.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Customer: {workOrder.customer}</span>
                <span>Due: {workOrder.dueDate}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{getWorkOrderProgress(workOrder)}%</span>
                </div>
                <Progress value={getWorkOrderProgress(workOrder)} className="h-1" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{workOrder.completedHours}h completed</span>
                  <span>{workOrder.estimatedHours}h estimated</span>
                </div>
              </div>
            </div>
          )}

          {selectedWorkOrder && (
            <Select value={selectedStage || ""} onValueChange={setSelectedStage}>
              <SelectTrigger>
                <SelectValue placeholder="Select a production stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Production Stages</SelectLabel>
                  {workOrder?.stages.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {stage}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Quick Actions */}
        {showTaskSwitcher && (
          <div className="space-y-2">
            <Label>Quick Start</Label>
            <div className="grid grid-cols-1 gap-2">
              {workOrders.slice(0, 3).map((wo) => (
                <div key={wo.id} className="flex items-center justify-between p-2 rounded border">
                  <div>
                    <p className="font-medium text-sm">{wo.id}</p>
                    <p className="text-xs text-muted-foreground">{wo.description}</p>
                  </div>
                  <div className="flex gap-1">
                    {wo.stages.slice(0, 2).map((stage) => (
                      <Button
                        key={stage}
                        size="sm"
                        variant="outline"
                        onClick={() => quickStart(wo.id, stage)}
                      >
                        {stage}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="space-y-2">
          <Label>Notes</Label>
          <Textarea
            placeholder="Add notes about what you're working on..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={saveTimeEntry} disabled={!selectedWorkOrder || !selectedStage || elapsedTime === 0} className="flex-1">
            <Save className="mr-2 h-4 w-4" />
            Save Entry
          </Button>
          <Button onClick={completeTask} disabled={!selectedWorkOrder || !selectedStage || elapsedTime === 0} variant="outline">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Complete Task
          </Button>
        </div>

        {/* Alerts */}
        {isApproachingOvertime() && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You're approaching your daily hours limit. Consider taking a break or stopping for the day.
            </AlertDescription>
          </Alert>
        )}

        {isDailyGoalMet() && (
          <Alert className="border-green-200 bg-green-50">
            <Target className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Congratulations! You've reached your daily goal of {productivityGoals.dailyHours} hours.
            </AlertDescription>
          </Alert>
        )}

        {/* Recent Entries */}
        {recentEntries.length > 0 && (
          <div className="space-y-2">
            <Label>Recent Entries</Label>
            <div className="space-y-2">
              {recentEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-2 rounded border text-sm">
                  <div>
                    <p className="font-medium">{entry.workOrderDescription}</p>
                    <p className="text-muted-foreground">{entry.stage}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatHours(entry.timeSpent)}h</p>
                    <p className="text-muted-foreground">{new Date(entry.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Timer Settings</DialogTitle>
            <DialogDescription>
              Configure your timer preferences and automation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-pause on Inactivity</Label>
                <p className="text-sm text-muted-foreground">
                  Pause timer after 5 minutes of inactivity
                </p>
              </div>
              <Switch
                checked={autoPause}
                onCheckedChange={setAutoPause}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Break Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Remind me to take regular breaks
                </p>
              </div>
              <Switch
                checked={breakReminders}
                onCheckedChange={setBreakReminders}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Goal Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Notify when goals are achieved
                </p>
              </div>
              <Switch
                checked={goalNotifications}
                onCheckedChange={setGoalNotifications}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowSettings(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
