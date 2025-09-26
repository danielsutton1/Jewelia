"use client";
import React, { useState } from "react";
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
  GitBranch,
  GitCommit,
  GitCompare,
  GitMerge,
  GitPullRequest,
  RefreshCw,
  Save,
  FileCheck,
  FileX,
  FilePlus,
  FileMinus,
  FileEdit,
  FileSearch,
  FileBarChart,
  FileSpreadsheet,
  FileCode,
  FileArchive,
  FileVideo,
  FileAudio,
  FileImage,
  FileType,
  FileDigit,
  FileJson,
  Folder,
  FolderOpen,
  FolderPlus,
  FolderMinus,
  FolderSearch,
  FolderGit,
  FolderGit2,
  FolderLock,
  FolderHeart,
  FolderX,
  FolderCheck,
  FolderClock,
  FolderKey,
  FolderInput,
  FolderOutput,
  FolderKanban,
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

// TypeScript interfaces
interface CADFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  version: string;
  isLatest: boolean;
  thumbnail: string;
}

interface RevisionComment {
  id: string;
  author: string;
  authorAvatar: string;
  date: string;
  content: string;
  type: 'customer' | 'internal';
}

interface CADRevision {
  id: string;
  version: string;
  date: string;
  author: string;
  authorAvatar: string;
  changes: string;
  status: string;
  files: CADFile[];
  comments: RevisionComment[];
  approvalDate: string | null;
  approvedBy: string | null;
  approvalNotes: string | null;
}

interface CADData {
  cadId: string;
  customerName: string;
  customerId: string;
  customerEmail: string;
  customerPhone: string;
  status: string;
  priority: string;
  assignedTo: string;
  assignedToEmail: string;
  assignedToAvatar: string;
  dueDate: string;
  createdAt: string;
  lastModified: string;
  progress: number;
  notes: string;
  specifications: {
    ringSize: string;
    metal: string;
    centerStone: string;
    accentStones: string;
    finish: string;
    comfortFit: boolean;
    engraving: string;
  };
  revisions: CADRevision[];
  orderNumber: string;
  designId: string;
  estimatedCost: number;
  actualCost: number;
  timeSpent: number;
  estimatedTime: number;
  tags: string[];
}

// Mock data for CAD revisions
const mockCADData: CADData = {
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
  revisions: [
    {
      id: 'rev-1',
      version: '1.2',
      date: '2024-07-15T14:30:00Z',
      author: 'Sarah Johnson',
      authorAvatar: '/avatars/sarah.jpg',
      changes: 'Adjusted comfort fit, refined pave setting, updated stone placement',
      status: 'Approved',
      files: [
        {
          id: 'file-1',
          name: 'engagement-ring-main-v1.2.stl',
          type: 'STL',
          size: 2457600,
          uploadedAt: '2024-07-15T14:30:00Z',
          uploadedBy: 'Sarah Johnson',
          version: '1.2',
          isLatest: true,
          thumbnail: '/thumbnails/ring-main-v1.2.jpg'
        },
        {
          id: 'file-2',
          name: 'engagement-ring-side-v1.2.stl',
          type: 'STL',
          size: 1894400,
          uploadedAt: '2024-07-15T14:25:00Z',
          uploadedBy: 'Sarah Johnson',
          version: '1.2',
          isLatest: true,
          thumbnail: '/thumbnails/ring-side-v1.2.jpg'
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
      approvalDate: '2024-07-15T16:00:00Z',
      approvedBy: 'Sophia Chen',
      approvalNotes: 'Customer approved with minor adjustments to pave stones'
    },
    {
      id: 'rev-2',
      version: '1.1',
      date: '2024-07-13T16:45:00Z',
      author: 'Sarah Johnson',
      authorAvatar: '/avatars/sarah.jpg',
      changes: 'Increased center stone size, modified band width',
      status: 'Approved',
      files: [
        {
          id: 'file-3',
          name: 'engagement-ring-main-v1.1.stl',
          type: 'STL',
          size: 2200000,
          uploadedAt: '2024-07-13T16:45:00Z',
          uploadedBy: 'Sarah Johnson',
          version: '1.1',
          isLatest: false,
          thumbnail: '/thumbnails/ring-main-v1.1.jpg'
        }
      ],
      comments: [
        {
          id: 'comment-3',
          author: 'Sophia Chen',
          authorAvatar: '/avatars/sophia.jpg',
          date: '2024-07-13T17:30:00Z',
          content: 'Love the larger center stone! The band width looks perfect.',
          type: 'customer'
        }
      ],
      approvalDate: '2024-07-13T18:00:00Z',
      approvedBy: 'Sophia Chen',
      approvalNotes: 'Customer approved the larger center stone and band width'
    },
    {
      id: 'rev-3',
      version: '1.0',
      date: '2024-07-10T10:00:00Z',
      author: 'Sarah Johnson',
      authorAvatar: '/avatars/sarah.jpg',
      changes: 'Initial CAD model created',
      status: 'Approved',
      files: [
        {
          id: 'file-4',
          name: 'engagement-ring-main-v1.0.stl',
          type: 'STL',
          size: 2000000,
          uploadedAt: '2024-07-10T10:00:00Z',
          uploadedBy: 'Sarah Johnson',
          version: '1.0',
          isLatest: false,
          thumbnail: '/thumbnails/ring-main-v1.0.jpg'
        }
      ],
      comments: [
        {
          id: 'comment-4',
          author: 'Sophia Chen',
          authorAvatar: '/avatars/sophia.jpg',
          date: '2024-07-10T11:00:00Z',
          content: 'Great start! I love the vintage-inspired design.',
          type: 'customer'
        }
      ],
      approvalDate: '2024-07-10T12:00:00Z',
      approvedBy: 'Sophia Chen',
      approvalNotes: 'Customer approved initial design concept'
    }
  ],
  orderNumber: 'ORD-1001',
  designId: 'DS-2024-0001',
  estimatedCost: 8500,
  actualCost: 0,
  timeSpent: 12.5,
  estimatedTime: 16,
  tags: ['Engagement Ring', 'Custom Design', 'Emerald', 'Vintage Style']
};

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

export default function CADRevisionsPage() {
  const params = useParams();
  const router = useRouter();
  const cadId = params.id as string;
  
  const [cadData, setCadData] = useState<CADData>(mockCADData);
  const [activeTab, setActiveTab] = useState('timeline');
  const [selectedRevision, setSelectedRevision] = useState(cadData.revisions[0]);
  const [newComment, setNewComment] = useState('');
  const [uploadDialog, setUploadDialog] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [newRevisionNotes, setNewRevisionNotes] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [compareRevision1, setCompareRevision1] = useState<string>('');
  const [compareRevision2, setCompareRevision2] = useState<string>('');

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleAddComment = (revisionId: string) => {
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
      revisions: prev.revisions.map(rev => 
        rev.id === revisionId 
          ? { ...rev, comments: [comment, ...rev.comments] }
          : rev
      )
    }));
    
    setNewComment('');
    toast.success('Comment added to revision');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
    setUploadDialog(true);
  };

  const handleCreateRevision = () => {
    if (!newRevisionNotes.trim() || selectedFiles.length === 0) {
      toast.error('Please add revision notes and select files');
      return;
    }

    const newRevision = {
      id: `rev-${Date.now()}`,
      version: `${parseFloat(selectedRevision.version) + 0.1}`.slice(0, 3),
      date: new Date().toISOString(),
      author: 'Current User',
      authorAvatar: '/avatars/current-user.jpg',
      changes: newRevisionNotes,
      status: 'Review',
      files: selectedFiles.map((file, index) => ({
        id: `file-${Date.now()}-${index}`,
        name: file.name,
        type: file.name.split('.').pop()?.toUpperCase() || 'STL',
        size: file.size,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'Current User',
        version: `${parseFloat(selectedRevision.version) + 0.1}`.slice(0, 3),
        isLatest: true,
        thumbnail: '/thumbnails/default.jpg'
      })),
      comments: [],
      approvalDate: null as string | null,
      approvedBy: null as string | null,
      approvalNotes: null as string | null
    };

    setCadData(prev => ({
      ...prev,
      revisions: [newRevision, ...prev.revisions]
    }));

    setSelectedFiles([]);
    setNewRevisionNotes('');
    setUploadDialog(false);
    toast.success('New revision created successfully');
  };

  const handleApproveRevision = (revisionId: string) => {
    setCadData(prev => ({
      ...prev,
      revisions: prev.revisions.map(rev => 
        rev.id === revisionId 
          ? { 
              ...rev, 
              status: 'Approved',
              approvalDate: new Date().toISOString(),
              approvedBy: 'Current User',
              approvalNotes: 'Approved by current user'
            }
          : rev
      )
    }));
    toast.success('Revision approved');
  };

  const handleRejectRevision = (revisionId: string) => {
    setCadData(prev => ({
      ...prev,
      revisions: prev.revisions.map(rev => 
        rev.id === revisionId 
          ? { ...rev, status: 'Revise' }
          : rev
      )
    }));
    toast.success('Revision marked for revision');
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/production/kanban/cad/${cadId}`}>
            <Button variant="outline" size="sm" className="text-gray-600 hover:text-gray-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to CAD Detail
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-emerald-900 flex items-center gap-2">
              <GitBranch className="h-8 w-8 text-emerald-600" />
              CAD Revisions
            </h1>
            <p className="text-gray-600 mt-1">{cadData.cadId} • {cadData.customerName}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge className={cn("text-sm font-semibold", statusColors[cadData.status as keyof typeof statusColors])}>
            {cadData.status}
          </Badge>
          <Badge className={cn("text-sm font-semibold", priorityColors[cadData.priority as keyof typeof priorityColors])}>
            {cadData.priority} Priority
          </Badge>
          <Button 
            onClick={() => setUploadDialog(true)}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Revision
          </Button>
        </div>
      </div>

      {/* Revision Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <GitCommit className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-900">{cadData.revisions.length}</p>
                <p className="text-sm text-gray-600">Total Revisions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-900">
                  {cadData.revisions.filter(r => r.status === 'Approved').length}
                </p>
                <p className="text-sm text-gray-600">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-900">
                  {cadData.revisions.filter(r => r.status === 'Review').length}
                </p>
                <p className="text-sm text-gray-600">In Review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-900">
                  {cadData.revisions.filter(r => r.status === 'Revise').length}
                </p>
                <p className="text-sm text-gray-600">Needs Revision</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revision Timeline */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-emerald-600" />
                Revision Timeline
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCompareMode(!compareMode)}
                >
                  <GitCompare className="w-4 h-4 mr-2" />
                  Compare
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>All Revisions</DropdownMenuItem>
                    <DropdownMenuItem>Approved Only</DropdownMenuItem>
                    <DropdownMenuItem>In Review</DropdownMenuItem>
                    <DropdownMenuItem>Needs Revision</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {cadData.revisions.map((revision, index) => (
                <div key={revision.id} className="relative">
                  {/* Timeline Connector */}
                  {index < cadData.revisions.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                  )}
                  
                  <div className="flex gap-4">
                    {/* Version Badge */}
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm",
                        revision.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        revision.status === 'Review' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      )}>
                        v{revision.version}
                      </div>
                      {revision.status === 'Approved' && (
                        <CheckCircle className="w-4 h-4 text-green-600 mt-1" />
                      )}
                    </div>

                    {/* Revision Content */}
                    <div className="flex-1 pb-6">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">Version {revision.version}</h3>
                          <p className="text-sm text-gray-600">
                            {format(parseISO(revision.date), "MMM dd, yyyy 'at' h:mm a")} by {revision.author}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={cn(
                            "text-xs",
                            revision.status === 'Approved' ? 'bg-green-100 text-green-800' :
                            revision.status === 'Review' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          )}>
                            {revision.status}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="outline">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedRevision(revision)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="w-4 h-4 mr-2" />
                                Download Files
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                              </DropdownMenuItem>
                              {revision.status === 'Review' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleApproveRevision(revision.id)}
                                    className="text-green-700"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleRejectRevision(revision.id)}
                                    className="text-red-700"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Changes */}
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <h4 className="font-semibold text-sm text-gray-900 mb-2">Changes Made</h4>
                        <p className="text-gray-700 text-sm">{revision.changes}</p>
                      </div>

                      {/* Files */}
                      <div className="mb-4">
                        <h4 className="font-semibold text-sm text-gray-900 mb-2">Files ({revision.files.length})</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {revision.files.map((file) => (
                            <div key={file.id} className="flex items-center gap-2 p-2 bg-white border rounded text-sm">
                              <FileText className="w-4 h-4 text-emerald-600" />
                              <span className="flex-1 truncate">{file.name}</span>
                              <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Comments */}
                      {revision.comments.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-sm text-gray-900 mb-2">Comments ({revision.comments.length})</h4>
                          <div className="space-y-2">
                            {revision.comments.slice(0, 2).map((comment) => (
                              <div key={comment.id} className="flex gap-2 p-2 bg-white border rounded">
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src={comment.authorAvatar} />
                                  <AvatarFallback>{comment.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <p className="text-xs font-semibold">{comment.author}</p>
                                  <p className="text-xs text-gray-600">{comment.content}</p>
                                </div>
                              </div>
                            ))}
                            {revision.comments.length > 2 && (
                              <p className="text-xs text-emerald-600 cursor-pointer">
                                View {revision.comments.length - 2} more comments
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Approval Info */}
                      {revision.status === 'Approved' && revision.approvalDate && (
                        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-semibold text-green-800">Approved</span>
                          </div>
                          <p className="text-xs text-green-700">
                            by {revision.approvedBy} on {format(parseISO(revision.approvalDate), "MMM dd, yyyy")}
                          </p>
                          {revision.approvalNotes && (
                            <p className="text-xs text-green-700 mt-1">{revision.approvalNotes}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Revision Details Sidebar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-emerald-600" />
              Revision Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedRevision ? (
              <div className="space-y-6">
                {/* Version Info */}
                <div className="text-center">
                  <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-2",
                    selectedRevision.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    selectedRevision.status === 'Review' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  )}>
                    v{selectedRevision.version}
                  </div>
                  <h3 className="font-semibold text-lg">Version {selectedRevision.version}</h3>
                  <p className="text-sm text-gray-600">
                    {format(parseISO(selectedRevision.date), "MMM dd, yyyy")}
                  </p>
                  <Badge className={cn(
                    "mt-2",
                    selectedRevision.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    selectedRevision.status === 'Review' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  )}>
                    {selectedRevision.status}
                  </Badge>
                </div>

                <Separator />

                {/* Author Info */}
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedRevision.authorAvatar} />
                    <AvatarFallback>{selectedRevision.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{selectedRevision.author}</p>
                    <p className="text-sm text-gray-600">CAD Designer</p>
                  </div>
                </div>

                <Separator />

                {/* Changes */}
                <div>
                  <h4 className="font-semibold text-sm text-gray-900 mb-2">Changes Made</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                    {selectedRevision.changes}
                  </p>
                </div>

                <Separator />

                {/* Files */}
                <div>
                  <h4 className="font-semibold text-sm text-gray-900 mb-2">Files</h4>
                  <div className="space-y-2">
                    {selectedRevision.files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-600" />
                          <span className="truncate">{file.name}</span>
                        </div>
                        <Button size="sm" variant="outline">
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Actions */}
                <div className="space-y-2">
                  <Button className="w-full" variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    View 3D Model
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download All Files
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share with Customer
                  </Button>
                  {selectedRevision.status === 'Review' && (
                    <>
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => handleApproveRevision(selectedRevision.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve Revision
                      </Button>
                      <Button 
                        className="w-full bg-red-600 hover:bg-red-700"
                        onClick={() => handleRejectRevision(selectedRevision.id)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject Revision
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <GitBranch className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Select a revision to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* New Revision Dialog */}
      <Dialog open={uploadDialog} onOpenChange={setUploadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-600" />
              Create New Revision
            </DialogTitle>
            <DialogDescription>
              Upload new CAD files and describe the changes made in this revision.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* File Upload */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold">CAD Files</Label>
              <div className="border-2 border-dashed border-emerald-200 rounded-lg p-6 text-center hover:border-emerald-300 transition-colors">
                <Upload className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">Drop CAD files here or click to browse</p>
                <input
                  type="file"
                  multiple
                  accept=".stl,.obj,.step,.stp,.iges,.igs,.dwg,.dxf,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="revision-file-upload"
                />
                <label htmlFor="revision-file-upload">
                  <Button variant="outline" className="cursor-pointer">
                    Choose Files
                  </Button>
                </label>
              </div>
              
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Selected Files ({selectedFiles.length})</Label>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm font-medium">{file.name}</span>
                          <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Revision Notes */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Revision Notes</Label>
              <Textarea
                placeholder="Describe the changes made in this revision..."
                value={newRevisionNotes}
                onChange={(e) => setNewRevisionNotes(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateRevision}
              disabled={selectedFiles.length === 0 || !newRevisionNotes.trim()}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <GitCommit className="h-4 w-4 mr-2" />
              Create Revision
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 