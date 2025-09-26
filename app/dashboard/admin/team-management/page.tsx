"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  UserPlus,
  Building2,
  Briefcase,
  Calendar,
  Phone,
  Mail,
  Shield,
  Star,
  AlertCircle
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { 
  EnhancedUser, 
  JewelryRole, 
  getRoleDisplayName, 
  getRoleColor,
  getJewelryRoleDisplayName,
  getJewelryRoleColor,
  CreateUserRequest,
  UpdateUserRequest
} from '@/types/team-management'

export default function TeamManagementPage() {
  const [users, setUsers] = useState<EnhancedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    role: 'all',
    jewelry_role: 'all',
    department: 'all',
    is_active: 'all'
  })
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<EnhancedUser | null>(null)
  const [createForm, setCreateForm] = useState<CreateUserRequest>({
    email: '',
    password: '',
    full_name: '',
    role: 'staff',
    jewelry_role: 'assistant',
    phone: '',
    bio: '',
    department: '',
    hire_date: new Date().toISOString().split('T')[0]
  })
  const [editForm, setEditForm] = useState<UpdateUserRequest>({})
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    usersByRole: {} as Record<string, number>,
    usersByDepartment: {} as Record<string, number>
  })
  const { toast } = useToast()

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers()
  }, [filters, searchTerm])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users?' + new URLSearchParams({
        ...filters,
        search: searchTerm
      }))
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data.data.users)
        calculateStats(data.data.users)
      } else {
        throw new Error('Failed to fetch users')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch users')
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (userList: EnhancedUser[]) => {
    const totalUsers = userList.length
    const activeUsers = userList.filter(u => u.is_active).length
    
    const usersByRole: Record<string, number> = {}
    const usersByDepartment: Record<string, number> = {}
    
    userList.forEach(user => {
      const role = user.jewelry_role
      const dept = user.department || 'Unassigned'
      
      usersByRole[role] = (usersByRole[role] || 0) + 1
      usersByDepartment[dept] = (usersByDepartment[dept] || 0) + 1
    })
    
    setStats({ totalUsers, activeUsers, usersByRole, usersByDepartment })
  }

  const handleCreateUser = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userData: createForm })
      })
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "User created successfully"
        })
        setShowCreateDialog(false)
        setCreateForm({
          email: '',
          password: '',
          full_name: '',
          role: 'staff',
          jewelry_role: 'assistant',
          phone: '',
          bio: '',
          department: '',
          hire_date: new Date().toISOString().split('T')[0]
        })
        fetchUsers()
      } else {
        throw new Error('Failed to create user')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to create user',
        variant: "destructive"
      })
    }
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: selectedUser.id, 
          updateData: editForm 
        })
      })
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "User updated successfully"
        })
        setShowEditDialog(false)
        setSelectedUser(null)
        setEditForm({})
        fetchUsers()
      } else {
        throw new Error('Failed to update user')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to update user',
        variant: "destructive"
      })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }
    
    try {
      const response = await fetch(`/api/admin/users?user_id=${userId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "User deleted successfully"
        })
        fetchUsers()
      } else {
        throw new Error('Failed to delete user')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to delete user',
        variant: "destructive"
      })
    }
  }

  const openEditDialog = (user: EnhancedUser) => {
    setSelectedUser(user)
    setEditForm({
      full_name: user.full_name,
      jewelry_role: user.jewelry_role,
      phone: user.phone,
      bio: user.bio,
      department: user.department,
      is_active: user.is_active
    })
    setShowEditDialog(true)
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading team management...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
              <p className="text-gray-600 text-lg">Manage your jewelry business team</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Team Members</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Star className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Members</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Briefcase className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Departments</p>
                  <p className="text-2xl font-bold text-gray-900">{Object.keys(stats.usersByDepartment).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Shield className="w-8 h-8 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Roles</p>
                  <p className="text-2xl font-bold text-gray-900">{Object.keys(stats.usersByRole).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Actions */}
        <Card className="bg-white shadow-sm border border-gray-100 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search team members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 py-3 border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-lg"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={filters.role} onValueChange={(value) => setFilters(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger className="w-40 border-gray-200">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                                            <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filters.department} onValueChange={(value) => setFilters(prev => ({ ...prev, department: value }))}>
                  <SelectTrigger className="w-40 border-gray-200">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                                            <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Production">Production</SelectItem>
                    <SelectItem value="Quality Control">Quality Control</SelectItem>
                    <SelectItem value="Management">Management</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filters.is_active} onValueChange={(value) => setFilters(prev => ({ ...prev, is_active: value }))}>
                  <SelectTrigger className="w-32 border-gray-200">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                    <UserPlus className="w-5 h-5 mr-2" />
                    Add Team Member
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Team Member</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="full_name">Full Name *</Label>
                        <Input
                          id="full_name"
                          value={createForm.full_name}
                          onChange={(e) => setCreateForm(prev => ({ ...prev, full_name: e.target.value }))}
                          placeholder="Enter full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={createForm.email}
                          onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Enter email"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="password">Password *</Label>
                        <Input
                          id="password"
                          type="password"
                          value={createForm.password}
                          onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Enter password"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={createForm.phone}
                          onChange={(e) => setCreateForm(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="role">System Role *</Label>
                        <Select value={createForm.role} onValueChange={(value) => setCreateForm(prev => ({ ...prev, role: value as any }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="staff">Staff</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="jewelry_role">Jewelry Role *</Label>
                        <Select value={createForm.jewelry_role} onValueChange={(value) => setCreateForm(prev => ({ ...prev, jewelry_role: value as any }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                                                  <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="sales_representative">Sales Representative</SelectItem>
                      <SelectItem value="jewelry_designer">Jewelry Designer</SelectItem>
                      <SelectItem value="gemologist">Gemologist</SelectItem>
                      <SelectItem value="metalsmith">Metalsmith</SelectItem>
                      <SelectItem value="quality_control">Quality Control</SelectItem>
                      <SelectItem value="inventory_specialist">Inventory Specialist</SelectItem>
                      <SelectItem value="customer_service">Customer Service</SelectItem>
                      <SelectItem value="assistant">Assistant</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Select value={createForm.department} onValueChange={(value) => setCreateForm(prev => ({ ...prev, department: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Management">Management</SelectItem>
                          <SelectItem value="Sales">Sales</SelectItem>
                          <SelectItem value="Design">Design</SelectItem>
                          <SelectItem value="Production">Production</SelectItem>
                          <SelectItem value="Quality Control">Quality Control</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="hire_date">Hire Date</Label>
                      <Input
                        id="hire_date"
                        type="date"
                        value={createForm.hire_date}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, hire_date: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={createForm.bio}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Enter bio"
                        rows={3}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateUser} className="bg-green-600 hover:bg-green-700">
                      Create User
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Tabs defaultValue="list" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="list">Team Members</TabsTrigger>
            <TabsTrigger value="roles">Role Distribution</TabsTrigger>
            <TabsTrigger value="departments">Department Overview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list">
            <Card className="bg-white shadow-sm border border-gray-100">
              <CardContent className="p-6">
                {error ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600">{error}</p>
                    <Button onClick={fetchUsers} className="mt-4">
                      Try Again
                    </Button>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No team members found</h3>
                    <p className="text-gray-500">Get started by adding your first team member.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <Card key={user.id} className="border border-gray-100 hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={user.avatar_url} />
                                <AvatarFallback className="bg-green-100 text-green-700">
                                  {getInitials(user.full_name)}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div>
                                <div className="flex items-center space-x-2 mb-1">
                                  <h3 className="font-semibold text-gray-900">{user.full_name}</h3>
                                  {!user.is_active && (
                                    <Badge variant="outline" className="text-red-600 border-red-200">
                                      Inactive
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                  <span className="flex items-center space-x-1">
                                    <Mail className="w-3 h-3" />
                                    <span>{user.email}</span>
                                  </span>
                                  {user.phone && (
                                    <span className="flex items-center space-x-1">
                                      <Phone className="w-3 h-3" />
                                      <span>{user.phone}</span>
                                    </span>
                                  )}
                                  {user.department && (
                                    <span className="flex items-center space-x-1">
                                      <Building2 className="w-3 h-3" />
                                      <span>{user.department}</span>
                                    </span>
                                  )}
                                  {user.hire_date && (
                                    <span className="flex items-center space-x-1">
                                      <Calendar className="w-3 h-3" />
                                      <span>{new Date(user.hire_date).toLocaleDateString()}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <div className="text-right">
                                <Badge 
                                  className="mb-1"
                                  style={{ backgroundColor: getJewelryRoleColor(user.jewelry_role) }}
                                >
                                  {getJewelryRoleDisplayName(user.jewelry_role)}
                                </Badge>
                                <div className="text-xs text-gray-500">{user.role}</div>
                              </div>
                              
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(user)}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="roles">
            <Card className="bg-white shadow-sm border border-gray-100">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Role Distribution</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(stats.usersByRole).map(([role, count]) => (
                    <Card key={role} className="border border-gray-100">
                      <CardContent className="p-4 text-center">
                        <div 
                          className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-lg"
                          style={{ backgroundColor: getJewelryRoleColor(role as JewelryRole) }}
                        >
                          {count}
                        </div>
                        <h4 className="font-medium text-gray-900">{getJewelryRoleDisplayName(role as JewelryRole)}</h4>
                        <p className="text-sm text-gray-600">{count} member{count !== 1 ? 's' : ''}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="departments">
            <Card className="bg-white shadow-sm border border-gray-100">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Department Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(stats.usersByDepartment).map(([dept, count]) => (
                    <Card key={dept} className="border border-gray-100">
                      <CardContent className="p-4 text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                          <Building2 className="w-8 h-8 text-blue-600" />
                        </div>
                        <h4 className="font-medium text-gray-900">{dept}</h4>
                        <p className="text-sm text-gray-600">{count} member{count !== 1 ? 's' : ''}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit User Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Team Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_full_name">Full Name</Label>
                  <Input
                    id="edit_full_name"
                    value={editForm.full_name || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_jewelry_role">Jewelry Role</Label>
                  <Select 
                    value={editForm.jewelry_role || ''} 
                    onValueChange={(value) => setEditForm(prev => ({ ...prev, jewelry_role: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="sales_representative">Sales Representative</SelectItem>
                      <SelectItem value="jewelry_designer">Jewelry Designer</SelectItem>
                      <SelectItem value="gemologist">Gemologist</SelectItem>
                      <SelectItem value="metalsmith">Metalsmith</SelectItem>
                      <SelectItem value="quality_control">Quality Control</SelectItem>
                      <SelectItem value="inventory_specialist">Inventory Specialist</SelectItem>
                      <SelectItem value="customer_service">Customer Service</SelectItem>
                      <SelectItem value="assistant">Assistant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_phone">Phone</Label>
                  <Input
                    id="edit_phone"
                    value={editForm.phone || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_department">Department</Label>
                  <Select 
                    value={editForm.department || ''} 
                    onValueChange={(value) => setEditForm(prev => ({ ...prev, department: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Management">Management</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Production">Production</SelectItem>
                      <SelectItem value="Quality Control">Quality Control</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit_bio">Bio</Label>
                <Textarea
                  id="edit_bio"
                  value={editForm.bio || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="edit_is_active">Status</Label>
                <Select 
                  value={editForm.is_active?.toString() || ''} 
                  onValueChange={(value) => setEditForm(prev => ({ ...prev, is_active: value === 'true' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateUser} className="bg-blue-600 hover:bg-blue-700">
                Update User
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
