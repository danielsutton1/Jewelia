"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  UserPlus, 
  Settings, 
  BarChart3, 
  Calendar, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Crown,
  Shield,
  Zap,
  Star,
  Building2,
  Briefcase,
  Globe,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Download,
  Upload,
  RefreshCw,
  Activity
} from "lucide-react"
import { toast } from "sonner"

// Mock data for demonstration
const mockTeams = [
  {
    id: "1",
    name: "Frontend Development",
    description: "Team responsible for building the user interface",
    team_type: "development",
    status: "active",
    created_at: "2025-01-15",
    updated_at: "2025-01-20",
    member_count: 5,
    project_count: 3,
    owner_id: "user1",
    owner_name: "John Doe",
    owner_email: "john@jewelia.com"
  },
  {
    id: "2",
    name: "Design Team",
    description: "Creative team for UI/UX design",
    team_type: "design",
    status: "active",
    created_at: "2025-01-10",
    updated_at: "2025-01-18",
    member_count: 3,
    project_count: 2,
    owner_id: "user2",
    owner_name: "Jane Smith",
    owner_email: "jane@jewelia.com"
  },
  {
    id: "3",
    name: "Quality Assurance",
    description: "Testing and quality control team",
    team_type: "operations",
    status: "active",
    created_at: "2025-01-05",
    updated_at: "2025-01-15",
    member_count: 4,
    project_count: 1,
    owner_id: "user3",
    owner_name: "Mike Johnson",
    owner_email: "mike@jewelia.com"
  }
]

const mockProjects = [
  {
    id: "1",
    name: "CRM Dashboard Redesign",
    description: "Modernize the main dashboard interface",
    project_type: "development",
    priority: "high",
    status: "active",
    start_date: "2025-01-20",
    due_date: "2025-03-20",
    team_id: "1",
    team_name: "Frontend Development",
    progress: 65,
    budget: 15000,
    tags: ["ui", "dashboard", "modernization"]
  },
  {
    id: "2",
    name: "Mobile App Design",
    description: "Create mobile app wireframes and designs",
    project_type: "design",
    priority: "medium",
    status: "active",
    start_date: "2025-01-25",
    due_date: "2025-02-25",
    team_id: "2",
    team_name: "Design Team",
    progress: 30,
    budget: 8000,
    tags: ["mobile", "design", "wireframes"]
  },
  {
    id: "3",
    name: "Testing Automation",
    description: "Implement automated testing framework",
    project_type: "operations",
    priority: "medium",
    status: "active",
    start_date: "2025-01-15",
    due_date: "2025-04-15",
    team_id: "3",
    team_name: "Quality Assurance",
    progress: 45,
    budget: 12000,
    tags: ["testing", "automation", "framework"]
  }
]

const mockMembers = [
  {
    id: "1",
    name: "John Doe",
    email: "john@jewelia.com",
    role: "owner",
    status: "active",
    joined_at: "2025-01-01",
    avatar: "",
    department: "Engineering",
    permissions: ["read", "write", "admin"]
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@jewelia.com",
    role: "admin",
    status: "active",
    joined_at: "2025-01-05",
    avatar: "",
    department: "Design",
    permissions: ["read", "write", "admin"]
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike@jewelia.com",
    role: "member",
    status: "active",
    joined_at: "2025-01-10",
    avatar: "",
    department: "Operations",
    permissions: ["read", "write"]
  },
  {
    id: "4",
    name: "Sarah Wilson",
    email: "sarah@jewelia.com",
    role: "member",
    status: "active",
    joined_at: "2025-01-12",
    avatar: "",
    department: "Engineering",
    permissions: ["read", "write"]
  }
]

export default function TeamManagementPage() {
  const [teams, setTeams] = useState(mockTeams)
  const [projects, setProjects] = useState(mockProjects)
  const [members, setMembers] = useState(mockMembers)
  const [activeTab, setActiveTab] = useState("overview")
  
  // Dialog states
  const [createTeamOpen, setCreateTeamOpen] = useState(false)
  const [createProjectOpen, setCreateProjectOpen] = useState(false)
  const [inviteMemberOpen, setInviteMemberOpen] = useState(false)
  
  // Form states
  const [teamForm, setTeamForm] = useState({
    name: "",
    description: "",
    team_type: "development",
    status: "active"
  })
  
  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
    project_type: "development",
    priority: "medium",
    start_date: "",
    due_date: "",
    team_id: "",
    budget: 0,
    tags: [] as string[]
  })

  const [memberForm, setMemberForm] = useState({
    email: "",
    role: "member",
    permissions: [] as string[]
  })

  const createTeam = async () => {
    try {
      // Simulate API call
      const newTeam = {
        id: Date.now().toString(),
        name: teamForm.name,
        description: teamForm.description,
        team_type: teamForm.team_type,
        status: teamForm.status,
        created_at: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString().split('T')[0],
        member_count: 0,
        project_count: 0,
        owner_id: "current-user",
        owner_name: "Current User",
        owner_email: "current@jewelia.com"
      }
      
      setTeams([...teams, newTeam])
      toast.success('Team created successfully!')
      setCreateTeamOpen(false)
      setTeamForm({ name: "", description: "", team_type: "development", status: "active" })
    } catch (error) {
      toast.error('Failed to create team')
    }
  }

  const createProject = async () => {
    try {
      const selectedTeam = teams.find(t => t.id === projectForm.team_id)
      const newProject = {
        id: Date.now().toString(),
        name: projectForm.name,
        description: projectForm.description,
        project_type: projectForm.project_type,
        priority: projectForm.priority,
        status: "active",
        start_date: projectForm.start_date,
        due_date: projectForm.due_date,
        team_id: projectForm.team_id,
        team_name: selectedTeam?.name || "Unknown Team",
        progress: 0,
        budget: projectForm.budget,
        tags: projectForm.tags
      }
      
      setProjects([...projects, newProject])
      toast.success('Project created successfully!')
      setCreateProjectOpen(false)
      setProjectForm({ name: "", description: "", project_type: "development", priority: "medium", start_date: "", due_date: "", team_id: "", budget: 0, tags: [] })
    } catch (error) {
      toast.error('Failed to create project')
    }
  }

  const inviteMember = async () => {
    try {
      const newMember = {
        id: Date.now().toString(),
        name: memberForm.email.split('@')[0], // Simple name extraction
        email: memberForm.email,
        role: memberForm.role,
        status: "pending",
        joined_at: new Date().toISOString().split('T')[0],
        avatar: "",
        department: "General",
        permissions: memberForm.permissions
      }
      
      setMembers([...members, newMember])
      toast.success('Member invited successfully!')
      setInviteMemberOpen(false)
      setMemberForm({ email: "", role: "member", permissions: [] })
    } catch (error) {
      toast.error('Failed to invite member')
    }
  }

  // Dashboard stats
  const dashboardStats = {
    totalTeams: teams.length,
    totalProjects: projects.length,
    totalMembers: members.length,
    activeTeams: teams.filter(t => t.status === 'active').length,
    activeProjects: projects.filter(p => p.status === 'active').length,
    completedProjects: projects.filter(p => p.status === 'completed').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground">Manage your teams, projects, and team members</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setCreateTeamOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Team
          </Button>
          <Button onClick={() => setCreateProjectOpen(true)} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Stats Cards - Matching Dashboard Style */}
      <div className="relative">
        <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"></div>
        <div className="relative p-4">
          <div className="w-full overflow-x-auto md:overflow-visible">
            <div className="flex md:grid md:grid-cols-4 gap-3 md:gap-4 min-w-[320px] md:min-w-0 flex-nowrap">
              <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 truncate">Total Teams</h4>
                        <Badge variant="secondary" className="text-xs mt-1">
                          Organization
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                      {dashboardStats.totalTeams}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <TrendingUp className="h-3 w-3" />
                      <span>{dashboardStats.activeTeams} active</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                    Total number of teams in organization
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                        <Briefcase className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 truncate">Total Projects</h4>
                        <Badge variant="secondary" className="text-xs mt-1">
                          Work
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                      {dashboardStats.totalProjects}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <TrendingUp className="h-3 w-3" />
                      <span>{dashboardStats.activeProjects} active</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                    Total projects across all teams
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                        <UserPlus className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 truncate">Team Members</h4>
                        <Badge variant="secondary" className="text-xs mt-1">
                          People
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                      {dashboardStats.totalMembers}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <Users className="h-3 w-3" />
                      <span>across all teams</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                    Total team members in organization
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 truncate">Completion Rate</h4>
                        <Badge variant="secondary" className="text-xs mt-1">
                          Performance
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                      {dashboardStats.totalProjects > 0 
                        ? Math.round((dashboardStats.completedProjects / dashboardStats.totalProjects) * 100)
                        : 0}%
                    </div>
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      <span>projects completed</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                    Project completion success rate
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-auto p-2 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl shadow-lg border border-white/20">
          <TabsTrigger 
            value="overview" 
            className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
          >
            <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="teams" 
            className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
          >
            <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
              <Users className="h-4 w-4 text-white" />
            </div>
            Teams
          </TabsTrigger>
          <TabsTrigger 
            value="projects" 
            className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
          >
            <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            Projects
          </TabsTrigger>
          <TabsTrigger 
            value="members" 
            className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
          >
            <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
              <UserPlus className="h-4 w-4 text-white" />
            </div>
            Members
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Recent Teams */}
            <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-600" />
                  Recent Teams
                </CardTitle>
                <CardDescription>Your most recently created teams</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {teams.slice(0, 3).map((team) => (
                  <div key={team.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-full">
                        <Users className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{team.name}</p>
                        <p className="text-xs text-muted-foreground">{team.member_count} members</p>
                      </div>
                    </div>
                    <Badge variant={team.status === 'active' ? 'default' : 'secondary'}>
                      {team.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Projects */}
            <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  Recent Projects
                </CardTitle>
                <CardDescription>Latest projects across all teams</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {projects.slice(0, 3).map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Briefcase className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{project.name}</p>
                        <p className="text-xs text-muted-foreground">{project.team_name}</p>
                      </div>
                    </div>
                    <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                      {project.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common team management tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                <Button 
                  onClick={() => setCreateTeamOpen(true)} 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <Plus className="h-6 w-6 text-emerald-600" />
                  <span>Create New Team</span>
                </Button>
                <Button 
                  onClick={() => setCreateProjectOpen(true)} 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <Briefcase className="h-6 w-6 text-blue-600" />
                  <span>Start New Project</span>
                </Button>
                <Button 
                  onClick={() => setInviteMemberOpen(true)} 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <UserPlus className="h-6 w-6 text-purple-600" />
                  <span>Invite Member</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Teams Tab */}
        <TabsContent value="teams" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Teams</CardTitle>
                  <CardDescription>Manage your teams and their settings</CardDescription>
                </div>
                <Button onClick={() => setCreateTeamOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Team
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teams.map((team) => (
                  <div key={team.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-100 rounded-full">
                        <Users className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{team.name}</h3>
                        <p className="text-sm text-muted-foreground">{team.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{team.member_count} members</span>
                          <span>{team.project_count} projects</span>
                          <span>Owner: {team.owner_name}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={team.status === 'active' ? 'default' : 'secondary'}>
                        {team.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Projects</CardTitle>
                  <CardDescription>Track project progress and manage deadlines</CardDescription>
                </div>
                <Button onClick={() => setCreateProjectOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 rounded-full">
                        <Briefcase className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{project.name}</h3>
                        <p className="text-sm text-muted-foreground">{project.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Team: {project.team_name}</span>
                          <span>Priority: {project.priority}</span>
                          <span>Budget: ${project.budget.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                        {project.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>Manage team member access and permissions</CardDescription>
                </div>
                <Button onClick={() => setInviteMemberOpen(true)} className="bg-purple-600 hover:bg-purple-700">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Member
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Role: {member.role}</span>
                          <span>Department: {member.department || 'N/A'}</span>
                          <span>Joined: {new Date(member.joined_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                        {member.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Team Dialog */}
      <Dialog open={createTeamOpen} onOpenChange={setCreateTeamOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="team-name">Team Name</Label>
              <Input
                id="team-name"
                value={teamForm.name}
                onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                placeholder="Enter team name"
              />
            </div>
            <div>
              <Label htmlFor="team-description">Description</Label>
              <Textarea
                id="team-description"
                value={teamForm.description}
                onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })}
                placeholder="Describe your team's purpose"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="team-type">Team Type</Label>
                <Select value={teamForm.team_type} onValueChange={(value) => setTeamForm({ ...teamForm, team_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="team-status">Status</Label>
                <Select value={teamForm.status} onValueChange={(value) => setTeamForm({ ...teamForm, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateTeamOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createTeam} className="bg-emerald-600 hover:bg-emerald-700">
              Create Team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Project Dialog */}
      <Dialog open={createProjectOpen} onOpenChange={setCreateProjectOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  value={projectForm.name}
                  onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <Label htmlFor="project-type">Project Type</Label>
                <Select value={projectForm.project_type} onValueChange={(value) => setProjectForm({ ...projectForm, project_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="project-description">Description</Label>
              <Textarea
                id="project-description"
                value={projectForm.description}
                onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                placeholder="Describe your project"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="project-priority">Priority</Label>
                <Select value={projectForm.priority} onValueChange={(value) => setProjectForm({ ...projectForm, priority: value })}>
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
              <div>
                <Label htmlFor="project-start">Start Date</Label>
                <Input
                  id="project-start"
                  type="date"
                  value={projectForm.start_date}
                  onChange={(e) => setProjectForm({ ...projectForm, start_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="project-due">Due Date</Label>
                <Input
                  id="project-due"
                  type="date"
                  value={projectForm.due_date}
                  onChange={(e) => setProjectForm({ ...projectForm, due_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="project-team">Team</Label>
                <Select value={projectForm.team_id} onValueChange={(value) => setProjectForm({ ...projectForm, team_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="project-budget">Budget</Label>
                <Input
                  id="project-budget"
                  type="number"
                  value={projectForm.budget}
                  onChange={(e) => setProjectForm({ ...projectForm, budget: parseInt(e.target.value) || 0 })}
                  placeholder="Enter budget amount"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateProjectOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createProject} className="bg-blue-600 hover:bg-blue-700">
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Member Dialog */}
      <Dialog open={inviteMemberOpen} onOpenChange={setInviteMemberOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="member-email">Email Address</Label>
              <Input
                id="member-email"
                type="email"
                value={memberForm.email}
                onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="member-role">Role</Label>
              <Select value={memberForm.role} onValueChange={(value) => setMemberForm({ ...memberForm, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteMemberOpen(false)}>
              Cancel
            </Button>
            <Button onClick={inviteMember} className="bg-purple-600 hover:bg-purple-700">
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
