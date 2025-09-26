"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { 
  FolderOpen, 
  Plus, 
  Users, 
  Clock, 
  DollarSign,
  CheckCircle,
  AlertCircle,
  Calendar,
  FileText,
  Timer,
  TrendingUp,
  Target,
  Briefcase
} from "lucide-react"

interface Project {
  id: string
  title: string
  description: string
  type: string
  status: 'draft' | 'active' | 'in_progress' | 'review' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  progress_percentage: number
  budget?: number
  due_date?: string
  collaborators: Array<{
    user: {
      id: string
      name: string
      avatar_url?: string
    }
    role: string
  }>
  tasks_count?: number
  completed_tasks?: number
  created_at: string
}

interface ProjectTask {
  id: string
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'blocked'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignee_id?: string
  due_date?: string
  progress_percentage: number
  created_at: string
}

export function ProjectDashboard({ userId }: { userId: string }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<ProjectTask[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    type: 'custom_design',
    priority: 'medium',
    budget: '',
    due_date: ''
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchProjects()
    fetchTasks()
  }, [userId])

  const fetchProjects = async () => {
    try {
      // Demo data for now
      const demoProjects: Project[] = [
        {
          id: '1',
          title: 'Custom Engagement Ring - Sarah & Mike',
          description: 'Vintage-inspired solitaire with halo setting',
          type: 'custom_design',
          status: 'in_progress',
          priority: 'high',
          progress_percentage: 65,
          budget: 8500,
          due_date: '2024-12-15',
          collaborators: [
            {
              user: { id: '1', name: 'Emily Chen', avatar_url: undefined },
              role: 'designer'
            },
            {
              user: { id: '2', name: 'David Rodriguez', avatar_url: undefined },
              role: 'setter'
            }
          ],
          tasks_count: 12,
          completed_tasks: 8,
          created_at: '2024-11-01'
        },
        {
          id: '2',
          title: 'Wedding Band Set Manufacturing',
          description: 'Matching his & hers platinum bands with diamonds',
          type: 'manufacturing',
          status: 'review',
          priority: 'medium',
          progress_percentage: 90,
          budget: 3200,
          due_date: '2024-11-30',
          collaborators: [
            {
              user: { id: '3', name: 'James Wilson', avatar_url: undefined },
              role: 'manufacturer'
            }
          ],
          tasks_count: 8,
          completed_tasks: 7,
          created_at: '2024-10-15'
        },
        {
          id: '3',
          title: 'Vintage Watch Restoration',
          description: 'Complete restoration of 1950s Omega Seamaster',
          type: 'repair',
          status: 'active',
          priority: 'low',
          progress_percentage: 25,
          budget: 850,
          due_date: '2024-12-30',
          collaborators: [
            {
              user: { id: '4', name: 'Sarah Miller', avatar_url: undefined },
              role: 'technician'
            }
          ],
          tasks_count: 6,
          completed_tasks: 1,
          created_at: '2024-11-20'
        }
      ]

      setProjects(demoProjects)
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const fetchTasks = async () => {
    try {
      // Demo tasks data
      const demoTasks: ProjectTask[] = [
        {
          id: '1',
          title: 'Create initial design sketches',
          description: 'Hand-drawn concepts for client review',
          status: 'done',
          priority: 'high',
          due_date: '2024-11-05',
          progress_percentage: 100,
          created_at: '2024-11-01'
        },
        {
          id: '2',
          title: 'Source center diamond',
          description: '2-carat round brilliant, F color, VS1 clarity',
          status: 'in_progress',
          priority: 'high',
          due_date: '2024-11-25',
          progress_percentage: 60,
          created_at: '2024-11-01'
        },
        {
          id: '3',
          title: 'CAD modeling and rendering',
          description: 'Create 3D model for client approval',
          status: 'todo',
          priority: 'medium',
          due_date: '2024-11-30',
          progress_percentage: 0,
          created_at: '2024-11-01'
        }
      ]

      setTasks(demoTasks)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const createProject = async () => {
    try {
      // In production, this would be an API call
      const project: Project = {
        id: String(projects.length + 1),
        title: newProject.title,
        description: newProject.description,
        type: newProject.type,
        status: 'draft',
        priority: newProject.priority as any,
        progress_percentage: 0,
        budget: newProject.budget ? parseFloat(newProject.budget) : undefined,
        due_date: newProject.due_date || undefined,
        collaborators: [],
        tasks_count: 0,
        completed_tasks: 0,
        created_at: new Date().toISOString()
      }

      setProjects(prev => [project, ...prev])
      setShowCreateProject(false)
      setNewProject({
        title: '',
        description: '',
        type: 'custom_design',
        priority: 'medium',
        budget: '',
        due_date: ''
      })

      toast({
        title: "Project Created",
        description: `${project.title} has been created successfully.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive"
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'review': return 'bg-yellow-100 text-yellow-800'
      case 'active': return 'bg-purple-100 text-purple-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'review': return 'bg-yellow-100 text-yellow-800'
      case 'blocked': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Dashboard</h1>
          <p className="text-gray-600">Manage your collaborative projects and tasks</p>
        </div>
        <Dialog open={showCreateProject} onOpenChange={setShowCreateProject}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Project Title</label>
                <Input
                  value={newProject.title}
                  onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter project title"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Project description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select 
                    value={newProject.type} 
                    onValueChange={(value) => setNewProject(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom_design">Custom Design</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="repair">Repair</SelectItem>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="appraisal">Appraisal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select 
                    value={newProject.priority} 
                    onValueChange={(value) => setNewProject(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Budget</label>
                  <Input
                    type="number"
                    value={newProject.budget}
                    onChange={(e) => setNewProject(prev => ({ ...prev, budget: e.target.value }))}
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Due Date</label>
                  <Input
                    type="date"
                    value={newProject.due_date}
                    onChange={(e) => setNewProject(prev => ({ ...prev, due_date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={createProject} className="flex-1">
                  Create Project
                </Button>
                <Button variant="outline" onClick={() => setShowCreateProject(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FolderOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold">{projects.filter(p => ['active', 'in_progress'].includes(p.status)).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{projects.filter(p => p.status === 'completed').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Timer className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
                <p className="text-2xl font-bold">{tasks.filter(t => t.status !== 'done').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold">
                  ${projects.reduce((sum, p) => sum + (p.budget || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="tasks">My Tasks</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          <div className="space-y-4">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{project.title}</h3>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getPriorityColor(project.priority)}>
                          {project.priority}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{project.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-gray-500" />
                          <span className="text-sm capitalize">{project.type.replace('_', ' ')}</span>
                        </div>
                        
                        {project.budget && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">${project.budget.toLocaleString()}</span>
                          </div>
                        )}
                        
                        {project.due_date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{new Date(project.due_date).toLocaleDateString()}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{project.collaborators.length} members</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{project.progress_percentage}%</span>
                        </div>
                        <Progress value={project.progress_percentage} className="h-2" />
                        
                        {project.tasks_count && (
                          <div className="text-sm text-gray-600">
                            {project.completed_tasks}/{project.tasks_count} tasks completed
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="ml-6">
                      <div className="flex -space-x-2 mb-4">
                        {project.collaborators.slice(0, 3).map((collaborator, index) => (
                          <Avatar key={index} className="h-8 w-8 border-2 border-white">
                            <AvatarImage src={collaborator.user.avatar_url} />
                            <AvatarFallback className="text-xs">
                              {collaborator.user.name[0]}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {project.collaborators.length > 3 && (
                          <div className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                            <span className="text-xs text-gray-600">
                              +{project.collaborators.length - 3}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <div className="space-y-4">
            {tasks.map((task) => (
              <Card key={task.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{task.title}</h4>
                        <Badge className={getTaskStatusColor(task.status)}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {task.due_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Due {new Date(task.due_date).toLocaleDateString()}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          <span>{task.progress_percentage}% complete</span>
                        </div>
                      </div>
                    </div>

                    <div className="ml-4">
                      <Progress value={task.progress_percentage} className="w-24 h-2 mb-2" />
                      <Button size="sm" variant="outline">
                        Update
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Project Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Calendar view coming soon</p>
                <p className="text-sm text-gray-400">Integrated timeline view of all project milestones and deadlines</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
