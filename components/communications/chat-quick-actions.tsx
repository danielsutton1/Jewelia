"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  CheckSquare,
  FileText,
  Calendar,
  Bell,
  AtSign,
  Pin,
  Star,
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  Paperclip,
  Send,
  Plus
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface Employee {
  id: string
  name: string
  avatar?: string
  role: string
  department: string
}

interface ChatQuickActionsProps {
  stageId: string
  stageName: string
  employees: Employee[]
  onActionComplete?: (action: string, data: any) => void
}

export function ChatQuickActions({ 
  stageId, 
  stageName, 
  employees, 
  onActionComplete 
}: ChatQuickActionsProps) {
  const [activeDialog, setActiveDialog] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  // Task creation state
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    assignee: "",
    priority: "medium",
    dueDate: "",
    notifyAssignee: true
  })

  // File sharing state
  const [fileData, setFileData] = useState({
    title: "",
    description: "",
    files: [] as File[],
    notifyTeam: true
  })

  // Meeting scheduling state
  const [meetingData, setMeetingData] = useState({
    title: "",
    description: "",
    attendees: [] as string[],
    date: "",
    time: "",
    duration: "30"
  })

  const handleCreateTask = async () => {
    setLoading("task")
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const task = {
        id: Date.now().toString(),
        ...taskData,
        stageId,
        createdAt: new Date().toISOString(),
        status: "pending"
      }
      
      toast({
        title: "Task Created",
        description: `Task "${taskData.title}" has been created and assigned.`,
      })
      
      onActionComplete?.("task", task)
      setActiveDialog(null)
      setTaskData({
        title: "",
        description: "",
        assignee: "",
        priority: "medium",
        dueDate: "",
        notifyAssignee: true
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(null)
    }
  }

  const handleShareFiles = async () => {
    setLoading("file")
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const fileShare = {
        id: Date.now().toString(),
        ...fileData,
        stageId,
        createdAt: new Date().toISOString()
      }
      
      toast({
        title: "Files Shared",
        description: `${fileData.files.length} files have been shared with the team.`,
      })
      
      onActionComplete?.("file", fileShare)
      setActiveDialog(null)
      setFileData({
        title: "",
        description: "",
        files: [],
        notifyTeam: true
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share files. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(null)
    }
  }

  const handleScheduleMeeting = async () => {
    setLoading("meeting")
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const meeting = {
        id: Date.now().toString(),
        ...meetingData,
        stageId,
        createdAt: new Date().toISOString()
      }
      
      toast({
        title: "Meeting Scheduled",
        description: `Meeting "${meetingData.title}" has been scheduled.`,
      })
      
      onActionComplete?.("meeting", meeting)
      setActiveDialog(null)
      setMeetingData({
        title: "",
        description: "",
        attendees: [],
        date: "",
        time: "",
        duration: "30"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule meeting. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(null)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFileData(prev => ({
        ...prev,
        files: [...Array.from(e.target.files!)]
      }))
    }
  }

  const toggleAttendee = (employeeId: string) => {
    setMeetingData(prev => ({
      ...prev,
      attendees: prev.attendees.includes(employeeId)
        ? prev.attendees.filter(id => id !== employeeId)
        : [...prev.attendees, employeeId]
    }))
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
      <Dialog open={activeDialog === "task"} onOpenChange={() => setActiveDialog(null)}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setActiveDialog("task")}
            className="flex items-center gap-2"
          >
            <CheckSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Create Task</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Task</DialogTitle>
            <DialogDescription>
              Create a new task for the {stageName} stage.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="task-title">Task Title</Label>
              <Input
                id="task-title"
                value={taskData.title}
                onChange={(e) => setTaskData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter task title"
              />
            </div>
            <div>
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                value={taskData.description}
                onChange={(e) => setTaskData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter task description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="task-assignee">Assign To</Label>
                <Select value={taskData.assignee} onValueChange={(value) => setTaskData(prev => ({ ...prev, assignee: value }))}>
                  <SelectTrigger id="task-assignee">
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={employee.avatar} />
                            <AvatarFallback className="text-xs">
                              {employee.name.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span>{employee.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="task-priority">Priority</Label>
                <Select value={taskData.priority} onValueChange={(value) => setTaskData(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger id="task-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="task-due-date">Due Date</Label>
              <Input
                id="task-due-date"
                type="date"
                value={taskData.dueDate}
                onChange={(e) => setTaskData(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="notify-assignee"
                checked={taskData.notifyAssignee}
                onCheckedChange={(checked) => setTaskData(prev => ({ ...prev, notifyAssignee: checked as boolean }))}
              />
              <Label htmlFor="notify-assignee">Notify assignee via email</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveDialog(null)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTask} disabled={loading === "task" || !taskData.title || !taskData.assignee}>
              {loading === "task" ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === "file"} onOpenChange={() => setActiveDialog(null)}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setActiveDialog("file")}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Share Files</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Share Files</DialogTitle>
            <DialogDescription>
              Share files with the {stageName} stage team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="file-title">Title</Label>
              <Input
                id="file-title"
                value={fileData.title}
                onChange={(e) => setFileData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter file share title"
              />
            </div>
            <div>
              <Label htmlFor="file-description">Description</Label>
              <Textarea
                id="file-description"
                value={fileData.description}
                onChange={(e) => setFileData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter description"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="file-upload">Select Files</Label>
              <Input
                id="file-upload"
                type="file"
                multiple
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              {fileData.files.length > 0 && (
                <div className="mt-2 space-y-1">
                  {fileData.files.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <Paperclip className="h-3 w-3" />
                      <span>{file.name}</span>
                      <span>({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="notify-team"
                checked={fileData.notifyTeam}
                onCheckedChange={(checked) => setFileData(prev => ({ ...prev, notifyTeam: checked as boolean }))}
              />
              <Label htmlFor="notify-team">Notify team members</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveDialog(null)}>
              Cancel
            </Button>
            <Button onClick={handleShareFiles} disabled={loading === "file" || fileData.files.length === 0}>
              {loading === "file" ? "Sharing..." : "Share Files"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === "meeting"} onOpenChange={() => setActiveDialog(null)}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setActiveDialog("meeting")}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Schedule Meeting</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule Meeting</DialogTitle>
            <DialogDescription>
              Schedule a meeting for the {stageName} stage.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="meeting-title">Meeting Title</Label>
              <Input
                id="meeting-title"
                value={meetingData.title}
                onChange={(e) => setMeetingData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter meeting title"
              />
            </div>
            <div>
              <Label htmlFor="meeting-description">Description</Label>
              <Textarea
                id="meeting-description"
                value={meetingData.description}
                onChange={(e) => setMeetingData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter meeting description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="meeting-date">Date</Label>
                <Input
                  id="meeting-date"
                  type="date"
                  value={meetingData.date}
                  onChange={(e) => setMeetingData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="meeting-time">Time</Label>
                <Input
                  id="meeting-time"
                  type="time"
                  value={meetingData.time}
                  onChange={(e) => setMeetingData(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="meeting-duration">Duration (minutes)</Label>
              <Select value={meetingData.duration} onValueChange={(value) => setMeetingData(prev => ({ ...prev, duration: value }))}>
                <SelectTrigger id="meeting-duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Attendees</Label>
              <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                {employees.map((employee) => (
                  <div key={employee.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`attendee-${employee.id}`}
                      checked={meetingData.attendees.includes(employee.id)}
                      onCheckedChange={() => toggleAttendee(employee.id)}
                    />
                    <Label htmlFor={`attendee-${employee.id}`} className="flex items-center gap-2 cursor-pointer">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={employee.avatar} />
                        <AvatarFallback className="text-xs">
                          {employee.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span>{employee.name}</span>
                      <Badge variant="outline" className="text-xs">{employee.role}</Badge>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveDialog(null)}>
              Cancel
            </Button>
            <Button onClick={handleScheduleMeeting} disabled={loading === "meeting" || !meetingData.title || !meetingData.date || !meetingData.time}>
              {loading === "meeting" ? "Scheduling..." : "Schedule Meeting"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
          <AtSign className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
          <Pin className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
          <Star className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
} 