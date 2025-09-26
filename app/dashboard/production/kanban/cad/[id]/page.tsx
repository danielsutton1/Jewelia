"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  CuboidIcon as Cube, 
  Calendar, 
  Users, 
  Download, 
  Upload, 
  Eye, 
  Edit, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  ArrowLeft, 
  ArrowRight, 
  FileText, 
  Image, 
  Settings, 
  Share2, 
  History, 
  Star,
  Phone,
  Mail,
  MapPin,
  Building,
  Tag,
  DollarSign,
  Target,
  Layers,
  RotateCcw,
  Play,
  Pause,
  Maximize,
  Minimize,
  Grid,
  List,
  Filter,
  Search,
  Plus,
  MoreHorizontal,
  Trash2,
  Copy,
  ExternalLink,
  Lock,
  Unlock,
  EyeOff,
  Camera,
  Printer,
  Send,
  Bookmark,
  Flag,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  AtSign,
  Hash,
  Zap,
  Shield,
  Award,
  Trophy,
  Crown,
  Gem,
  Diamond,
  Sparkles,
  X
} from "lucide-react";
import { format, parseISO, differenceInDays, isAfter, isBefore } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Replace single mockCADData with an array of CADs
const mockCADs = [
  {
    cadId: 'CAD-2024-0001',
    customerName: 'Sophia Chen',
    customerId: 'CUST-001',
    customerEmail: 'sophia.chen@email.com',
    customerPhone: '+1 (555) 123-4567',
    status: 'Review',
    priority: 'High',
    assignedTo: 'Sarah Johnson',
    assignedToEmail: 'sarah.johnson@jewelia.com',
    assignedToAvatar: '/avatars/sarah.jpg',
    dueDate: '2024-07-18T20:00:00Z',
    createdAt: '2024-07-10T10:00:00Z',
    lastModified: '2024-07-15T14:30:00Z',
    progress: 75,
    notes: '3D modeling for custom engagement ring with emerald center stone. Customer requested vintage-inspired design with modern comfort fit.',
    specifications: {
      ringSize: '6.5',
      metal: '18K White Gold',
      centerStone: 'Emerald, 2.5ct',
      accentStones: 'Diamond pave, 0.8ct total',
      finish: 'Polished with satin accents',
      comfortFit: true,
      engraving: 'Forever & Always'
    },
    files: [
      {
        id: 'file-1',
        name: 'engagement-ring-main.stl',
        type: 'STL',
        size: 2457600,
        uploadedAt: '2024-07-15T14:30:00Z',
        uploadedBy: 'Sarah Johnson',
        version: '1.2',
        isLatest: true,
        thumbnail: '/thumbnails/ring-main.jpg'
      },
      {
        id: 'file-2',
        name: 'engagement-ring-side.stl',
        type: 'STL',
        size: 1894400,
        uploadedAt: '2024-07-15T14:25:00Z',
        uploadedBy: 'Sarah Johnson',
        version: '1.2',
        isLatest: true,
        thumbnail: '/thumbnails/ring-side.jpg'
      },
      {
        id: 'file-3',
        name: 'customer-reference.pdf',
        type: 'PDF',
        size: 512000,
        uploadedAt: '2024-07-12T09:15:00Z',
        uploadedBy: 'Sophia Chen',
        version: '1.0',
        isLatest: true,
        thumbnail: '/thumbnails/reference.jpg'
      }
    ],
    revisions: [
      {
        id: 'rev-1',
        version: '1.2',
        date: '2024-07-15T14:30:00Z',
        author: 'Sarah Johnson',
        changes: 'Adjusted comfort fit, refined pave setting, updated stone placement',
        status: 'Approved',
        files: ['file-1', 'file-2']
      },
      {
        id: 'rev-2',
        version: '1.1',
        date: '2024-07-13T16:45:00Z',
        author: 'Sarah Johnson',
        changes: 'Increased center stone size, modified band width',
        status: 'Approved',
        files: ['file-1']
      },
      {
        id: 'rev-3',
        version: '1.0',
        date: '2024-07-10T10:00:00Z',
        author: 'Sarah Johnson',
        changes: 'Initial CAD model created',
        status: 'Approved',
        files: ['file-1']
      }
    ],
    comments: [
      {
        id: 'comment-1',
        author: 'Sophia Chen',
        authorAvatar: '/avatars/sophia.jpg',
        date: '2024-07-15T15:00:00Z',
        content: 'The comfort fit looks perfect! Can we make the pave stones slightly smaller?',
        type: 'customer'
      },
      {
        id: 'comment-2',
        author: 'Sarah Johnson',
        authorAvatar: '/avatars/sarah.jpg',
        date: '2024-07-15T14:45:00Z',
        content: 'Updated the model with your feedback. The comfort fit should feel much better now.',
        type: 'internal'
      }
    ],
    orderNumber: 'ORD-1001',
    designId: 'DS-2024-0001',
    estimatedCost: 8500,
    actualCost: 0,
    timeSpent: 12.5,
    estimatedTime: 16,
    tags: ['Engagement Ring', 'Custom Design', 'Emerald', 'Vintage Style']
  }
  // Add more CADs here as needed
];

const statusColors = {
  'Review': 'bg-yellow-100 text-yellow-800',
  'Approved': 'bg-green-100 text-green-800',
  'Revise': 'bg-red-100 text-red-800'
};

const priorityColors = {
  'High': 'bg-red-100 text-red-800 border-red-200',
  'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Low': 'bg-green-100 text-green-800 border-green-200'
};

export default function CADDetailPage() {
  const params = useParams();
  const router = useRouter();
  const cadId = params.id as string;

  // Find the CAD by ID
  const foundCAD = mockCADs.find(cad => cad.cadId === cadId);

  // If not found, show a user-friendly error
  if (!foundCAD) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <h1 className="text-3xl font-bold text-red-700 mb-4">CAD Not Found</h1>
        <p className="text-lg text-gray-600 mb-6">The requested CAD record (ID: {cadId}) does not exist. Please check the link or return to the CAD Kanban board.</p>
        <Link href="/dashboard/production/kanban/cad">
          <Button variant="outline">Back to CAD Kanban</Button>
        </Link>
      </div>
    );
  }

  // Use foundCAD for the rest of the component
  const [cadData, setCadData] = useState(foundCAD);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editNotes, setEditNotes] = useState(cadData.notes);
  const [newComment, setNewComment] = useState('');
  const [uploadDialog, setUploadDialog] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [viewerMode, setViewerMode] = useState<'3d' | '2d'>('3d');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSpecs, setShowSpecs] = useState(true);

  const daysUntilDue = differenceInDays(parseISO(cadData.dueDate), new Date());
  const isOverdue = isAfter(new Date(), parseISO(cadData.dueDate));
  const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleStatusChange = (newStatus: string) => {
    setCadData(prev => ({ ...prev, status: newStatus }));
    toast.success(`Status updated to ${newStatus}`);
  };

  const handlePriorityChange = (newPriority: string) => {
    setCadData(prev => ({ ...prev, priority: newPriority }));
    toast.success(`Priority updated to ${newPriority}`);
  };

  const handleSaveNotes = () => {
    setCadData(prev => ({ ...prev, notes: editNotes }));
    setIsEditing(false);
    toast.success('Notes updated successfully');
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const comment = {
      id: `comment-${Date.now()}`,
      author: 'Current User',
      authorAvatar: '/avatars/current-user.jpg',
      date: new Date().toISOString(),
      content: newComment,
      type: 'internal' as const
    };
    
    setCadData(prev => ({
      ...prev,
      comments: [comment, ...prev.comments]
    }));
    
    setNewComment('');
    toast.success('Comment added');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
    setUploadDialog(true);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/production/kanban/cad">
            <Button variant="outline" size="sm" className="text-gray-600 hover:text-gray-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to CAD Kanban
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-emerald-900 flex items-center gap-2">
              <Cube className="h-8 w-8 text-emerald-600" />
              {cadData.cadId}
            </h1>
            <p className="text-gray-600 mt-1">{cadData.customerName} • {cadData.specifications.metal} Engagement Ring</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge className={cn("text-sm font-semibold", statusColors[cadData.status as keyof typeof statusColors])}>
            {cadData.status}
          </Badge>
          <Badge className={cn("text-sm font-semibold", priorityColors[cadData.priority as keyof typeof priorityColors])}>
            {cadData.priority} Priority
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Download className="w-4 h-4 mr-2" />
                Export CAD
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Printer className="w-4 h-4 mr-2" />
                Print Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete CAD
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Progress and Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-emerald-600" />
              Project Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-emerald-600 font-semibold">{cadData.progress}%</span>
              </div>
              <Progress value={cadData.progress} className="h-2" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Time Spent:</span>
                  <span className="ml-2 font-semibold">{cadData.timeSpent}h / {cadData.estimatedTime}h</span>
                </div>
                <div>
                  <span className="text-gray-600">Cost:</span>
                  <span className="ml-2 font-semibold">${cadData.actualCost} / ${cadData.estimatedCost}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald-600" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Due Date</span>
                <span className={cn(
                  "text-sm font-semibold",
                  isOverdue ? "text-red-600" : isDueSoon ? "text-yellow-600" : "text-emerald-600"
                )}>
                  {format(parseISO(cadData.dueDate), "MMM dd, yyyy")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Created</span>
                <span className="text-sm text-gray-600">{format(parseISO(cadData.createdAt), "MMM dd, yyyy")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Last Modified</span>
                <span className="text-sm text-gray-600">{format(parseISO(cadData.lastModified), "MMM dd, yyyy")}</span>
              </div>
              {isOverdue && (
                <Badge variant="destructive" className="w-full justify-center">
                  Overdue by {Math.abs(daysUntilDue)} days
                </Badge>
              )}
              {isDueSoon && !isOverdue && (
                <Badge variant="secondary" className="w-full justify-center bg-yellow-100 text-yellow-800">
                  Due in {daysUntilDue} days
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="revisions">Revisions</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="specs">Specifications</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* CAD Viewer */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-emerald-600" />
                    3D CAD Viewer
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewerMode(viewerMode === '3d' ? '2d' : '3d')}
                    >
                      {viewerMode === '3d' ? <Grid className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
                      {viewerMode.toUpperCase()}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsFullscreen(!isFullscreen)}
                    >
                      {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-lg h-96 flex items-center justify-center border-2 border-dashed border-emerald-200">
                  <div className="text-center">
                    <Cube className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-emerald-900 mb-2">3D CAD Viewer</h3>
                    <p className="text-emerald-700 mb-4">Interactive 3D model viewer would be integrated here</p>
                    <div className="flex items-center gap-2 justify-center">
                      <Button size="sm" variant="outline">
                        <Play className="w-4 h-4 mr-2" />
                        Play Animation
                      </Button>
                      <Button size="sm" variant="outline">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset View
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-emerald-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload New Version
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Add Comment
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share with Customer
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download All Files
                  </Button>
                  <Separator />
                  <Button className="w-full justify-start bg-emerald-600 hover:bg-emerald-700">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Move to Casting
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-600" />
                  Team & Assignment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={cadData.assignedToAvatar} />
                      <AvatarFallback>{cadData.assignedTo.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{cadData.assignedTo}</p>
                      <p className="text-sm text-gray-600">{cadData.assignedToEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                    <Button size="sm" variant="outline">
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-emerald-600" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold">{cadData.customerName}</p>
                    <p className="text-sm text-gray-600">Customer ID: {cadData.customerId}</p>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {cadData.customerEmail}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {cadData.customerPhone}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Customer Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notes Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  Project Notes
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-3">
                  <Textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSaveNotes} className="bg-emerald-600 hover:bg-emerald-700">
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">{cadData.notes}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Files Tab */}
        <TabsContent value="files" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  CAD Files
                </CardTitle>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    multiple
                    accept=".stl,.obj,.step,.stp,.iges,.igs,.dwg,.dxf,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Files
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cadData.files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold">{file.name}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{file.type}</span>
                          <span>{formatFileSize(file.size)}</span>
                          <span>v{file.version}</span>
                          {file.isLatest && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                              Latest
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          Uploaded by {file.uploadedBy} on {format(parseISO(file.uploadedAt), "MMM dd, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Link
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revisions Tab */}
        <TabsContent value="revisions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-emerald-600" />
                Revision History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cadData.revisions.map((revision, index) => (
                  <div key={revision.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-emerald-600">{revision.version}</span>
                      </div>
                      {index < cadData.revisions.length - 1 && (
                        <div className="w-0.5 h-8 bg-gray-200 mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold">Version {revision.version}</p>
                          <p className="text-sm text-gray-600">
                            {format(parseISO(revision.date), "MMM dd, yyyy 'at' h:mm a")} by {revision.author}
                          </p>
                        </div>
                        <Badge className={cn(
                          "text-xs",
                          revision.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        )}>
                          {revision.status}
                        </Badge>
                      </div>
                      <p className="text-gray-700 mb-2">{revision.changes}</p>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          View Files
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="comments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-emerald-600" />
                Comments & Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Add Comment */}
                <div className="space-y-3">
                  <Textarea
                    placeholder="Add a comment or feedback..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                  />
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <AtSign className="w-4 h-4 mr-2" />
                        @Mention
                      </Button>
                      <Button size="sm" variant="outline">
                        <Image className="w-4 h-4 mr-2" />
                        Attach
                      </Button>
                    </div>
                    <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                      <Send className="w-4 h-4 mr-2" />
                      Post Comment
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Comments List */}
                <div className="space-y-4">
                  {cadData.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={comment.authorAvatar} />
                        <AvatarFallback>{comment.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{comment.author}</span>
                          <Badge variant="outline" className="text-xs">
                            {comment.type === 'customer' ? 'Customer' : 'Internal'}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {format(parseISO(comment.date), "MMM dd, yyyy 'at' h:mm a")}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm">{comment.content}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button size="sm" variant="ghost" className="h-6 px-2">
                            <MessageCircle className="w-3 h-3 mr-1" />
                            Reply
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 px-2">
                            <ThumbsUp className="w-3 h-3 mr-1" />
                            Like
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Specifications Tab */}
        <TabsContent value="specs" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-emerald-600" />
                  Technical Specifications
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSpecs(!showSpecs)}
                >
                  {showSpecs ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  {showSpecs ? 'Hide' : 'Show'} Details
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showSpecs ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-emerald-900 border-b pb-2">Ring Specifications</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ring Size:</span>
                        <span className="font-semibold">{cadData.specifications.ringSize}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Metal:</span>
                        <span className="font-semibold">{cadData.specifications.metal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Center Stone:</span>
                        <span className="font-semibold">{cadData.specifications.centerStone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Accent Stones:</span>
                        <span className="font-semibold">{cadData.specifications.accentStones}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Finish:</span>
                        <span className="font-semibold">{cadData.specifications.finish}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Comfort Fit:</span>
                        <span className="font-semibold">
                          {cadData.specifications.comfortFit ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Engraving:</span>
                        <span className="font-semibold">{cadData.specifications.engraving}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-emerald-900 border-b pb-2">Project Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order Number:</span>
                        <span className="font-semibold">{cadData.orderNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Design ID:</span>
                        <span className="font-semibold">{cadData.designId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estimated Cost:</span>
                        <span className="font-semibold">${cadData.estimatedCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Actual Cost:</span>
                        <span className="font-semibold">${cadData.actualCost.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="pt-4">
                      <h4 className="font-semibold text-emerald-900 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {cadData.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="bg-emerald-50 text-emerald-700">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Lock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Specifications are hidden</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upload Dialog */}
      <Dialog open={uploadDialog} onOpenChange={setUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload New CAD Files</DialogTitle>
            <DialogDescription>
              Upload new version of CAD files for this project.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">Drop files here or click to browse</p>
            </div>
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Selected Files:</p>
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{file.name}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setUploadDialog(false)}>
              Upload Files
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 