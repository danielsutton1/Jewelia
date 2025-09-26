"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const initialTasks = [
  {
    id: 1,
    title: "Follow up with new customers",
    completed: false,
    priority: "high",
  },
  {
    id: 2,
    title: "Review inventory levels",
    completed: false,
    priority: "medium",
  },
  {
    id: 3,
    title: "Prepare monthly sales report",
    completed: false,
    priority: "high",
  },
  {
    id: 4,
    title: "Update product descriptions",
    completed: true,
    priority: "low",
  },
]

export function TaskList() {
  const [tasks, setTasks] = useState(initialTasks)

  const toggleTask = (id: number) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-destructive border-destructive"
      case "medium":
        return "text-amber-500 border-amber-500"
      case "low":
        return "text-emerald-500 border-emerald-500"
      default:
        return "text-muted-foreground border-muted"
    }
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`flex items-start gap-2 rounded-lg border p-2 ${task.completed ? "bg-muted/50" : ""}`}
        >
          <Checkbox
            id={`task-${task.id}`}
            checked={task.completed}
            onCheckedChange={() => toggleTask(task.id)}
            className="mt-0.5"
          />
          <div className="flex-1">
            <label
              htmlFor={`task-${task.id}`}
              className={`text-sm font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}
            >
              {task.title}
            </label>
          </div>
          <Badge variant="outline" className={`${getPriorityColor(task.priority)}`}>
            {task.priority}
          </Badge>
        </div>
      ))}
    </div>
  )
}
