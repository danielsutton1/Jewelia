'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Plus, 
  FileText, 
  Calendar, 
  Users, 
  CheckSquare,
  Upload,
  Link,
  MessageSquare
} from 'lucide-react'

export function ChatQuickActions() {
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false)
  const [isMeetingDialogOpen, setIsMeetingDialogOpen] = useState(false)

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium">Quick Actions</h4>
        <Badge variant="secondary" className="text-xs">Productivity</Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {/* Create Task */}
        <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-auto p-3 flex flex-col items-center space-y-1">
              <CheckSquare className="h-4 w-4" />
              <span className="text-xs">Create Task</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Create a task for the current production stage.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="task-title">Task Title</Label>
                <Input id="task-title" placeholder="Enter task title" />
              </div>
              <div>
                <Label htmlFor="task-description">Description</Label>
                <Textarea id="task-description" placeholder="Enter task description" />
              </div>
              <div>
                <Label htmlFor="task-assignee">Assignee</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sarah">Sarah Johnson</SelectItem>
                    <SelectItem value="mike">Mike Chen</SelectItem>
                    <SelectItem value="lisa">Lisa Rodriguez</SelectItem>
                    <SelectItem value="david">David Kim</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="task-priority">Priority</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
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
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsTaskDialogOpen(false)}>
                Create Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Share File */}
        <Dialog open={isFileDialogOpen} onOpenChange={setIsFileDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-auto p-3 flex flex-col items-center space-y-1">
              <Upload className="h-4 w-4" />
              <span className="text-xs">Share File</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share File</DialogTitle>
              <DialogDescription>
                Upload or share a file with the team.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">Drag and drop files here or click to browse</p>
                <Button variant="outline" size="sm" className="mt-2">
                  Choose Files
                </Button>
              </div>
              <div>
                <Label htmlFor="file-description">Description (optional)</Label>
                <Textarea id="file-description" placeholder="Add a description for the file" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsFileDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsFileDialogOpen(false)}>
                Share File
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Schedule Meeting */}
        <Dialog open={isMeetingDialogOpen} onOpenChange={setIsMeetingDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-auto p-3 flex flex-col items-center space-y-1">
              <Calendar className="h-4 w-4" />
              <span className="text-xs">Schedule Meeting</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Meeting</DialogTitle>
              <DialogDescription>
                Schedule a meeting with the project team.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="meeting-title">Meeting Title</Label>
                <Input id="meeting-title" placeholder="Enter meeting title" />
              </div>
              <div>
                <Label htmlFor="meeting-date">Date</Label>
                <Input id="meeting-date" type="date" />
              </div>
              <div>
                <Label htmlFor="meeting-time">Time</Label>
                <Input id="meeting-time" type="time" />
              </div>
              <div>
                <Label htmlFor="meeting-duration">Duration</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="meeting-description">Description</Label>
                <Textarea id="meeting-description" placeholder="Enter meeting description" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsMeetingDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsMeetingDialogOpen(false)}>
                Schedule Meeting
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Quick Message */}
        <Button variant="outline" size="sm" className="h-auto p-3 flex flex-col items-center space-y-1">
          <MessageSquare className="h-4 w-4" />
          <span className="text-xs">Quick Message</span>
        </Button>
      </div>
    </div>
  )
} 