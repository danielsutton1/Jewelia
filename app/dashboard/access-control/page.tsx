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
import { Switch } from "@/components/ui/switch"
import { 
  Shield, 
  Users, 
  UserPlus, 
  Settings, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Crown,
  Zap,
  Star,
  Building2,
  Briefcase,
  Globe,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Activity,
  BarChart3,
  Calendar,
  Target,
  TrendingUp,
  Lock,
  Unlock,
  Key,
  UserCheck,
  UserX,
  AlertCircle,
  Info
} from "lucide-react"
import { toast } from "sonner"
import { 
  JewelryUserRole, 
  Permission, 
  UserProfile, 
  Department, 
  Team,
  AuditLog,
  SecurityEvent,
  ROLE_DISPLAY_NAMES,
  ROLE_COLORS,
  ROLE_DESCRIPTIONS,
  ROLE_HIERARCHY
} from "@/types/rbac"
import { RolePermissionMatrix } from "@/components/access-control/role-permission-matrix"

// Mock data for demonstration
const mockUsers = [
  {
    id: "1",
    user_id: "user1",
    role: "store_owner" as JewelryUserRole,
    department_id: "dept1",
    manager_id: undefined,
    employee_id: "EMP001",
    hire_date: "2024-01-01",
    is_active: true,
    last_login_at: "2025-01-29T10:30:00Z",
    login_count: 150,
    failed_login_attempts: 0,
    two_factor_enabled: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2025-01-29T10:30:00Z"
  },
  {
    id: "2",
    user_id: "user2",
    role: "store_manager" as JewelryUserRole,
    department_id: "dept1",
    manager_id: "user1",
    employee_id: "EMP002",
    hire_date: "2024-02-01",
    is_active: true,
    last_login_at: "2025-01-29T09:15:00Z",
    login_count: 120,
    failed_login_attempts: 1,
    two_factor_enabled: true,
    created_at: "2024-02-01T00:00:00Z",
    updated_at: "2025-01-29T09:15:00Z"
  },
  {
    id: "3",
    user_id: "user3",
    role: "sales_associate" as JewelryUserRole,
    department_id: "dept2",
    manager_id: "user2",
    employee_id: "EMP003",
    hire_date: "2024-03-01",
    is_active: true,
    last_login_at: "2025-01-29T08:45:00Z",
    login_count: 85,
    failed_login_attempts: 0,
    two_factor_enabled: false,
    created_at: "2024-03-01T00:00:00Z",
    updated_at: "2025-01-29T08:45:00Z"
  }
]

const mockDepartments = [
  { id: "dept1", name: "Management", description: "Store management and administration", is_active: true, created_at: "2024-01-01T00:00:00Z", updated_at: "2025-01-29T00:00:00Z" },
  { id: "dept2", name: "Sales", description: "Customer sales and service", is_active: true, created_at: "2024-01-01T00:00:00Z", updated_at: "2025-01-29T00:00:00Z" },
  { id: "dept3", name: "Production", description: "Jewelry manufacturing and repair", is_active: true, created_at: "2024-01-01T00:00:00Z", updated_at: "2025-01-29T00:00:00Z" },
  { id: "dept4", name: "Inventory", description: "Inventory management and procurement", is_active: true, created_at: "2024-01-01T00:00:00Z", updated_at: "2025-01-29T00:00:00Z" },
  { id: "dept5", name: "Finance", description: "Financial management and accounting", is_active: true, created_at: "2024-01-01T00:00:00Z", updated_at: "2025-01-29T00:00:00Z" }
]

const mockTeams = [
  {
    id: "team1",
    name: "Sales Team A",
    description: "Primary sales team for retail customers",
    department_id: "dept2",
    team_lead_id: "user2",
    is_active: true,
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2025-01-20T00:00:00Z"
  },
  {
    id: "team2",
    name: "Production Team",
    description: "Jewelry manufacturing and repair team",
    department_id: "dept3",
    team_lead_id: undefined,
    is_active: true,
    created_at: "2024-01-10T00:00:00Z",
    updated_at: "2025-01-18T00:00:00Z"
  }
]

const mockAuditLogs = [
  {
    id: "1",
    user_id: "user1",
    action: "UPDATE",
    resource_type: "user_profiles",
    resource_id: "user2",
    old_values: { role: "sales_associate" },
    new_values: { role: "store_manager" },
    ip_address: "192.168.1.100",
    user_agent: "Mozilla/5.0...",
    success: true,
    created_at: "2025-01-29T10:30:00Z"
  },
  {
    id: "2",
    user_id: "user2",
    action: "INSERT",
    resource_type: "customers",
    resource_id: "customer123",
    old_values: undefined,
    new_values: { name: "John Doe", email: "john@example.com" },
    ip_address: "192.168.1.101",
    user_agent: "Mozilla/5.0...",
    success: true,
    created_at: "2025-01-29T09:15:00Z"
  }
]

const mockSecurityEvents = [
  {
    id: "1",
    user_id: "user3",
    event_type: "failed_login",
    severity: "medium" as const,
    description: "Multiple failed login attempts detected",
    ip_address: "192.168.1.102",
    user_agent: "Mozilla/5.0...",
    metadata: { attempts: 3, lockout_duration: "15 minutes" },
    created_at: "2025-01-29T08:45:00Z"
  },
  {
    id: "2",
    user_id: "user2",
    event_type: "permission_denied",
    severity: "low" as const,
    description: "Attempted to access restricted financial data",
    ip_address: "192.168.1.101",
    user_agent: "Mozilla/5.0...",
    metadata: { resource: "financial_reports", permission: "financial.view" },
    created_at: "2025-01-29T07:30:00Z"
  }
]

export default function AccessControlPage() {
  const [users, setUsers] = useState<UserProfile[]>(mockUsers)
  const [departments, setDepartments] = useState<Department[]>(mockDepartments)
  const [teams, setTeams] = useState<Team[]>(mockTeams)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(mockAuditLogs)
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>(mockSecurityEvents)
  const [activeTab, setActiveTab] = useState("users")
  
  // Dialog states
  const [createUserOpen, setCreateUserOpen] = useState(false)
  const [editUserOpen, setEditUserOpen] = useState(false)
  const [createTeamOpen, setCreateTeamOpen] = useState(false)
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false)
  
  // Form states
  const [userForm, setUserForm] = useState({
    email: "",
    full_name: "",
    role: "viewer" as JewelryUserRole,
    department_id: "",
    manager_id: "",
    employee_id: "",
    hire_date: ""
  })
  
  const [teamForm, setTeamForm] = useState({
    name: "",
    description: "",
    department_id: "",
    team_lead_id: ""
  })

  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)

  // Get role icon
  const getRoleIcon = (role: JewelryUserRole) => {
    const iconMap: Record<JewelryUserRole, string> = {
      store_owner: '👑',
      store_manager: '👔',
      assistant_manager: '👨‍💼',
      senior_sales_associate: '💎',
      sales_associate: '💍',
      customer_service_rep: '📞',
      jewelry_designer: '🎨',
      goldsmith: '🔨',
      jeweler: '⚒️',
      appraiser: '🔍',
      inventory_manager: '📦',
      bookkeeper: '📊',
      accountant: '💰',
      system_admin: '⚙️',
      viewer: '👁️',
      guest: '👋'
    }
    return iconMap[role] || '👤'
  }

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const createUser = async () => {
    try {
      // Simulate API call
      const newUser: UserProfile = {
        id: Date.now().toString(),
        user_id: `user${Date.now()}`,
        role: userForm.role,
        department_id: userForm.department_id || undefined,
        manager_id: userForm.manager_id || undefined,
        employee_id: userForm.employee_id || undefined,
        hire_date: userForm.hire_date || undefined,
        is_active: true,
        last_login_at: undefined,
        login_count: 0,
        failed_login_attempts: 0,
        two_factor_enabled: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      setUsers([...users, newUser])
      toast.success('User created successfully!')
      setCreateUserOpen(false)
      setUserForm({ 
        email: "", 
        full_name: "", 
        role: "viewer", 
        department_id: "", 
        manager_id: "", 
        employee_id: "", 
        hire_date: "" 
      })
    } catch (error) {
      toast.error('Failed to create user')
    }
  }

  const createTeam = async () => {
    try {
      // Simulate API call
      const newTeam: Team = {
        id: Date.now().toString(),
        name: teamForm.name,
        description: teamForm.description || undefined,
        department_id: teamForm.department_id || undefined,
        team_lead_id: teamForm.team_lead_id || undefined,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      setTeams([...teams, newTeam])
      toast.success('Team created successfully!')
      setCreateTeamOpen(false)
      setTeamForm({ name: "", description: "", department_id: "", team_lead_id: "" })
    } catch (error) {
      toast.error('Failed to create team')
    }
  }

  const updateUserRole = async (userId: string, newRole: JewelryUserRole) => {
    try {
      setUsers(users.map(user => 
        user.user_id === userId 
          ? { ...user, role: newRole, updated_at: new Date().toISOString() }
          : user
      ))
      toast.success('User role updated successfully!')
    } catch (error) {
      toast.error('Failed to update user role')
    }
  }

  const toggleUserStatus = async (userId: string) => {
    try {
      setUsers(users.map(user => 
        user.user_id === userId 
          ? { ...user, is_active: !user.is_active, updated_at: new Date().toISOString() }
          : user
      ))
      toast.success('User status updated successfully!')
    } catch (error) {
      toast.error('Failed to update user status')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/50 relative overflow-hidden">
      {/* Luxury Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-indigo-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-200/20 to-purple-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-200/10 to-pink-200/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex flex-col gap-1 p-1 w-full">
        {/* Enhanced Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"></div>
          <div className="relative p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Access Control Management
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Comprehensive role-based access control for your jewelry business
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{users.length}</p>
                  <p className="text-sm text-green-600 mt-1">+2 this month</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-3xl font-bold text-gray-900">{users.filter(u => u.is_active).length}</p>
                  <p className="text-sm text-green-600 mt-1">98% active rate</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Security Events</p>
                  <p className="text-3xl font-bold text-gray-900">{securityEvents.length}</p>
                  <p className="text-sm text-yellow-600 mt-1">2 this week</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Teams</p>
                  <p className="text-3xl font-bold text-gray-900">{teams.length}</p>
                  <p className="text-sm text-blue-600 mt-1">5 departments</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Building2 className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b border-gray-200 px-6 py-4">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="users" className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Users</span>
                  </TabsTrigger>
                  <TabsTrigger value="roles" className="flex items-center space-x-2">
                    <Crown className="h-4 w-4" />
                    <span>Roles</span>
                  </TabsTrigger>
                  <TabsTrigger value="teams" className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4" />
                    <span>Teams</span>
                  </TabsTrigger>
                  <TabsTrigger value="audit" className="flex items-center space-x-2">
                    <Activity className="h-4 w-4" />
                    <span>Audit Logs</span>
                  </TabsTrigger>
                  <TabsTrigger value="security" className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Security</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Users Tab */}
              <TabsContent value="users" className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search users..."
                        className="pl-10 w-64"
                      />
                    </div>
                    <Select>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="store_owner">Store Owner</SelectItem>
                        <SelectItem value="store_manager">Store Manager</SelectItem>
                        <SelectItem value="sales_associate">Sales Associate</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add User
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create New User</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            value={userForm.email}
                            onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                            placeholder="user@company.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="full_name">Full Name</Label>
                          <Input
                            id="full_name"
                            value={userForm.full_name}
                            onChange={(e) => setUserForm({...userForm, full_name: e.target.value})}
                            placeholder="John Doe"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role">Role</Label>
                          <Select value={userForm.role} onValueChange={(value: JewelryUserRole) => setUserForm({...userForm, role: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(ROLE_DISPLAY_NAMES).map(([key, name]) => (
                                <SelectItem key={key} value={key}>
                                  {getRoleIcon(key as JewelryUserRole)} {name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="department">Department</Label>
                          <Select value={userForm.department_id} onValueChange={(value) => setUserForm({...userForm, department_id: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                              {departments.map((dept) => (
                                <SelectItem key={dept.id} value={dept.id}>
                                  {dept.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="employee_id">Employee ID</Label>
                          <Input
                            id="employee_id"
                            value={userForm.employee_id}
                            onChange={(e) => setUserForm({...userForm, employee_id: e.target.value})}
                            placeholder="EMP001"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="hire_date">Hire Date</Label>
                          <Input
                            id="hire_date"
                            type="date"
                            value={userForm.hire_date}
                            onChange={(e) => setUserForm({...userForm, hire_date: e.target.value})}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateUserOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={createUser}>
                          Create User
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-4">
                  {users.map((user) => (
                    <Card key={user.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                                {getRoleIcon(user.role)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="font-semibold text-gray-900">
                                  {user.employee_id || 'N/A'}
                                </h3>
                                <Badge 
                                  variant="outline" 
                                  style={{ 
                                    backgroundColor: ROLE_COLORS[user.role] + '20',
                                    borderColor: ROLE_COLORS[user.role],
                                    color: ROLE_COLORS[user.role]
                                  }}
                                >
                                  {getRoleIcon(user.role)} {ROLE_DISPLAY_NAMES[user.role]}
                                </Badge>
                                <Badge variant={user.is_active ? "default" : "secondary"}>
                                  {user.is_active ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">
                                {departments.find(d => d.id === user.department_id)?.name || 'No Department'}
                              </p>
                              <p className="text-xs text-gray-500">
                                Last login: {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Select 
                              value={user.role} 
                              onValueChange={(value: JewelryUserRole) => updateUserRole(user.user_id, value)}
                            >
                              <SelectTrigger className="w-48">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(ROLE_DISPLAY_NAMES).map(([key, name]) => (
                                  <SelectItem key={key} value={key}>
                                    {getRoleIcon(key as JewelryUserRole)} {name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Switch
                              checked={user.is_active}
                              onCheckedChange={() => toggleUserStatus(user.user_id)}
                            />
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Roles Tab */}
              <TabsContent value="roles" className="p-6">
                <RolePermissionMatrix />
              </TabsContent>

              {/* Teams Tab */}
              <TabsContent value="teams" className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Teams</h2>
                  <Dialog open={createTeamOpen} onOpenChange={setCreateTeamOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Team
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Team</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="team_name">Team Name</Label>
                          <Input
                            id="team_name"
                            value={teamForm.name}
                            onChange={(e) => setTeamForm({...teamForm, name: e.target.value})}
                            placeholder="Sales Team A"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="team_description">Description</Label>
                          <Textarea
                            id="team_description"
                            value={teamForm.description}
                            onChange={(e) => setTeamForm({...teamForm, description: e.target.value})}
                            placeholder="Team description..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="team_department">Department</Label>
                          <Select value={teamForm.department_id} onValueChange={(value) => setTeamForm({...teamForm, department_id: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                              {departments.map((dept) => (
                                <SelectItem key={dept.id} value={dept.id}>
                                  {dept.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateTeamOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={createTeam}>
                          Create Team
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {teams.map((team) => (
                    <Card key={team.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-gray-900">{team.name}</h3>
                            <p className="text-sm text-gray-600">
                              {departments.find(d => d.id === team.department_id)?.name || 'No Department'}
                            </p>
                          </div>
                          <Badge variant="outline">Active</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{team.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">5 members</span>
                          </div>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Audit Logs Tab */}
              <TabsContent value="audit" className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Audit Logs</h2>
                  <div className="flex items-center space-x-2">
                    <Select>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Actions</SelectItem>
                        <SelectItem value="INSERT">Create</SelectItem>
                        <SelectItem value="UPDATE">Update</SelectItem>
                        <SelectItem value="DELETE">Delete</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {auditLogs.map((log) => (
                    <Card key={log.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-full ${
                              log.success ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                              {log.success ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">{log.action}</Badge>
                                <span className="text-sm font-medium text-gray-900">
                                  {log.resource_type}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                {log.ip_address} • {new Date(log.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Security Events</h2>
                  <div className="flex items-center space-x-2">
                    <Select>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Severities</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {securityEvents.map((event) => (
                    <Card key={event.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-full ${
                              event.severity === 'critical' ? 'bg-red-100' :
                              event.severity === 'high' ? 'bg-orange-100' :
                              event.severity === 'medium' ? 'bg-yellow-100' :
                              'bg-green-100'
                            }`}>
                              <AlertTriangle className={`h-4 w-4 ${
                                event.severity === 'critical' ? 'text-red-600' :
                                event.severity === 'high' ? 'text-orange-600' :
                                event.severity === 'medium' ? 'text-yellow-600' :
                                'text-green-600'
                              }`} />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <Badge className={getSeverityColor(event.severity)}>
                                  {event.severity.toUpperCase()}
                                </Badge>
                                <span className="text-sm font-medium text-gray-900">
                                  {event.event_type.replace('_', ' ')}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">{event.description}</p>
                              <p className="text-xs text-gray-500">
                                {event.ip_address} • {new Date(event.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Info className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
