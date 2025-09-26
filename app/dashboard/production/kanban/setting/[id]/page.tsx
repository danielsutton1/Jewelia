"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Gem, 
  User, 
  Calendar, 
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  Upload,
  Eye,
  MessageSquare,
  Droplets,
  Settings,
  FileText,
  Star,
  ThumbsUp,
  ThumbsDown,
  Edit3,
  Save,
  X,
  Users,
  Paperclip,
  FileImage,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

// Types for setting data
type SettingSpecifications = {
  stoneType?: string;
  stoneSize?: string;
  settingType?: string;
  metalType?: string;
  finish?: string;
  prongCount?: string;
};

type SettingRevision = {
  version: string;
  date: string;
  changes: string;
  setter: string;
  status: 'pending' | 'approved' | 'rejected';
};

type SettingFile = {
  name: string;
  type: 'CAD' | 'Photo' | 'Instruction' | 'Report';
  uploaded: string;
  size?: string;
};

// Mock setting data
const mockSettings = {
  'SET-2024-0001': {
    settingId: 'SET-2024-0001',
    customerName: 'Sophia Chen',
    customerId: 'CUST-001',
    customerEmail: 'sophia.chen@email.com',
    customerPhone: '+1 (555) 123-4567',
    status: 'In Progress',
    priority: 'High',
    assignedTo: 'Sarah Johnson',
    assignedToEmail: 'sarah.johnson@jewelia.com',
    assignedToAvatar: '/avatars/sarah.jpg',
    dueDate: '2024-07-25T20:00:00Z',
    createdAt: '2024-07-15T10:00:00Z',
    lastModified: '2024-07-20T14:30:00Z',
    progress: 65,
    notes: 'Stone setting for custom engagement ring with emerald center stone. Customer requested vintage-inspired prong setting with diamond accents.',
    revisions: [
      {
        version: '1.1',
        date: '2024-07-19',
        changes: 'Adjusted prong tension for better stone security',
        setter: 'Sarah Johnson',
        status: 'approved'
      }
    ],
    orderNumber: 'ORD-1001',
    castingId: 'CAST-2024-0001',
    designId: 'DS-2024-0001',
    specifications: {
      stoneType: 'Emerald',
      stoneSize: '2.5 carats',
      settingType: 'Prong',
      metalType: 'Platinum',
      finish: 'High Polish',
      prongCount: '6'
    } as SettingSpecifications,
    files: [
      { name: 'SET-2024-0001-instructions.pdf', type: 'Instruction', uploaded: '2024-07-15' },
      { name: 'SET-2024-0001-stone-specs.pdf', type: 'Report', uploaded: '2024-07-15' },
      { name: 'SET-2024-0001-cad.step', type: 'CAD', uploaded: '2024-07-16' },
      { name: 'SET-2024-0001-progress-1.jpg', type: 'Photo', uploaded: '2024-07-18' }
    ] as SettingFile[],
    qualityChecks: [
      { check: 'Stone Security', status: 'Passed', date: '2024-07-18' },
      { check: 'Prong Alignment', status: 'Passed', date: '2024-07-18' },
      { check: 'Finish Quality', status: 'Pending', date: null }
    ]
  },
  'SET-2024-0002': {
    settingId: 'SET-2024-0002',
    customerName: 'Ethan Davis',
    customerId: 'CUST-002',
    customerEmail: 'ethan.davis@email.com',
    customerPhone: '+1 (555) 234-5678',
    status: 'Review',
    priority: 'Medium',
    assignedTo: 'David Chen',
    assignedToEmail: 'david.chen@jewelia.com',
    assignedToAvatar: '/avatars/david.jpg',
    dueDate: '2024-07-29T20:00:00Z',
    createdAt: '2024-07-18T09:00:00Z',
    lastModified: '2024-07-22T16:45:00Z',
    progress: 85,
    notes: 'Sapphire pendant stone setting with diamond accents. Channel setting technique required.',
    revisions: [
      {
        version: '1.1',
        date: '2024-07-20',
        changes: 'Adjusted channel width for better stone fit',
        setter: 'David Chen',
        status: 'approved'
      },
      {
        version: '1.2',
        date: '2024-07-22',
        changes: 'Refined channel edges for smoother finish',
        setter: 'David Chen',
        status: 'pending'
      }
    ],
    orderNumber: 'ORD-1002',
    castingId: 'CAST-2024-0002',
    designId: 'DS-2024-0002',
    specifications: {
      stoneType: 'Sapphire',
      stoneSize: '1.8 carats',
      settingType: 'Channel',
      metalType: '18k White Gold',
      finish: 'Polished',
      prongCount: 'N/A'
    } as SettingSpecifications,
    files: [
      { name: 'SET-2024-0002-model.stl', type: 'CAD', uploaded: '2024-07-18' },
      { name: 'SET-2024-0002-final.jpg', type: 'Photo', uploaded: '2024-07-22' }
    ] as SettingFile[],
    qualityChecks: [
      { check: 'Stone Security', status: 'Passed', date: '2024-07-21' },
      { check: 'Channel Alignment', status: 'Passed', date: '2024-07-21' },
      { check: 'Finish Quality', status: 'Passed', date: '2024-07-22' }
    ]
  }
};

const statusColors: { [key: string]: string } = {
  'In Progress': 'bg-blue-100 text-blue-800',
  'Review': 'bg-yellow-100 text-yellow-800',
  'Approved': 'bg-green-100 text-green-800',
  'Rejected': 'bg-red-100 text-red-800',
};

const priorityColors: { [key: string]: string } = {
  'High': 'bg-red-100 text-red-800 border-red-200',
  'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Low': 'bg-green-100 text-green-800 border-green-200',
};

export default function SettingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const settingId = params.id as string;
  const [settingData, setSettingData] = useState(() => mockSettings[settingId as keyof typeof mockSettings]);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState(settingData);

  if (!settingData) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <h1 className="text-3xl font-bold text-red-700 mb-4">Setting Not Found</h1>
        <p className="text-gray-600 mb-8">The setting you're looking for doesn't exist or has been removed.</p>
        <Link href="/dashboard/production/kanban/setting">
          <Button className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-emerald-700 transition">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Setting Kanban
          </Button>
        </Link>
      </div>
    );
  }

  const handleEdit = () => {
    setEditForm(settingData);
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
  };

  const handleSave = () => {
    setSettingData(editForm);
    setEditMode(false);
    toast.success("Setting updated successfully");
  };

  const handleInputChange = (field: string, value: any) => {
    setEditForm(prev => ({ ...prev!, [field]: value }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/production/kanban/setting">
            <Button variant="outline" size="sm" className="text-gray-600 hover:text-gray-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Kanban
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-emerald-900 flex items-center gap-2">
              <Gem className="h-8 w-8 text-emerald-600" />
              {settingData.settingId}
            </h1>
            <p className="text-gray-600 mt-1">Stone Setting Detail</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {editMode ? (
            <>
              <Button onClick={handleCancel} variant="outline" size="sm">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-emerald-600 text-white">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={handleEdit} className="bg-emerald-600 text-white">
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Setting
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status and Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-600" />
                Setting Status & Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge className={`text-sm font-semibold ${statusColors[settingData.status]}`}>
                    {settingData.status}
                  </Badge>
                  <Badge className={`text-sm font-semibold ${priorityColors[settingData.priority]}`}>
                    {settingData.priority} Priority
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Progress</div>
                  <div className="text-lg font-bold text-emerald-600">{settingData.progress}%</div>
                </div>
              </div>
              <Progress value={settingData.progress} className="h-2" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Created:</span>
                  <span className="ml-2 font-medium">{formatDate(settingData.createdAt)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Due Date:</span>
                  <span className="ml-2 font-medium">{formatDate(settingData.dueDate)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-emerald-600" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Customer Name</label>
                  <div className="mt-1">
                    {editMode ? (
                      <Input
                        value={editForm?.customerName || ''}
                        onChange={(e) => handleInputChange('customerName', e.target.value)}
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{settingData.customerName}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Customer ID</label>
                  <div className="mt-1">
                    {editMode ? (
                      <Input
                        value={editForm?.customerId || ''}
                        onChange={(e) => handleInputChange('customerId', e.target.value)}
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{settingData.customerId}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <div className="mt-1">
                    {editMode ? (
                      <Input
                        value={editForm?.customerEmail || ''}
                        onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                      />
                    ) : (
                      <p className="text-gray-900">{settingData.customerEmail}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <div className="mt-1">
                    {editMode ? (
                      <Input
                        value={editForm?.customerPhone || ''}
                        onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                      />
                    ) : (
                      <p className="text-gray-900">{settingData.customerPhone}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-emerald-600" />
                Setting Specifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Stone Type</label>
                  <div className="mt-1">
                    {editMode ? (
                      <Input
                        value={editForm?.specifications?.stoneType || ''}
                        onChange={(e) => handleInputChange('specifications', { ...editForm?.specifications, stoneType: e.target.value })}
                      />
                    ) : (
                      <p className="text-gray-900">{settingData.specifications.stoneType}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Stone Size</label>
                  <div className="mt-1">
                    {editMode ? (
                      <Input
                        value={editForm?.specifications?.stoneSize || ''}
                        onChange={(e) => handleInputChange('specifications', { ...editForm?.specifications, stoneSize: e.target.value })}
                      />
                    ) : (
                      <p className="text-gray-900">{settingData.specifications.stoneSize}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Setting Type</label>
                  <div className="mt-1">
                    {editMode ? (
                      <Input
                        value={editForm?.specifications?.settingType || ''}
                        onChange={(e) => handleInputChange('specifications', { ...editForm?.specifications, settingType: e.target.value })}
                      />
                    ) : (
                      <p className="text-gray-900">{settingData.specifications.settingType}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Metal Type</label>
                  <div className="mt-1">
                    {editMode ? (
                      <Input
                        value={editForm?.specifications?.metalType || ''}
                        onChange={(e) => handleInputChange('specifications', { ...editForm?.specifications, metalType: e.target.value })}
                      />
                    ) : (
                      <p className="text-gray-900">{settingData.specifications.metalType}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Finish</label>
                  <div className="mt-1">
                    {editMode ? (
                      <Input
                        value={editForm?.specifications?.finish || ''}
                        onChange={(e) => handleInputChange('specifications', { ...editForm?.specifications, finish: e.target.value })}
                      />
                    ) : (
                      <p className="text-gray-900">{settingData.specifications.finish}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Prong Count</label>
                  <div className="mt-1">
                    {editMode ? (
                      <Input
                        value={editForm?.specifications?.prongCount || ''}
                        onChange={(e) => handleInputChange('specifications', { ...editForm?.specifications, prongCount: e.target.value })}
                      />
                    ) : (
                      <p className="text-gray-900">{settingData.specifications.prongCount}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-600" />
                Notes & Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editMode ? (
                <Textarea
                  value={editForm?.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={4}
                  placeholder="Enter setting notes and instructions..."
                />
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">{settingData.notes}</p>
              )}
            </CardContent>
          </Card>

          {/* Files */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Paperclip className="h-5 w-5 text-emerald-600" />
                Files & Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {settingData.files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileImage className="h-5 w-5 text-emerald-600" />
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">{file.type} • Uploaded {file.uploaded}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Revisions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-emerald-600" />
                Revisions History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settingData.revisions.map((revision, index) => (
                  <div key={index} className="border-l-4 border-emerald-200 pl-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Version {revision.version}</p>
                        <p className="text-sm text-gray-500">{revision.date} • {revision.setter}</p>
                        <p className="text-gray-700 mt-1">{revision.changes}</p>
                      </div>
                      <Badge className={revision.status === 'approved' ? 'bg-green-100 text-green-800' : revision.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                        {revision.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assigned To */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-600" />
                Assigned To
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{settingData.assignedTo}</p>
                  <p className="text-sm text-gray-500">{settingData.assignedToEmail}</p>
                </div>
              </div>
              <Button className="w-full mt-4" variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Setter
              </Button>
            </CardContent>
          </Card>

          {/* Quality Checks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                Quality Checks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {settingData.qualityChecks.map((check, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{check.check}</span>
                    <Badge className={check.status === 'Passed' ? 'bg-green-100 text-green-800' : check.status === 'Failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                      {check.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Related Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-emerald-600" />
                Related Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Order Number</span>
                  <Link href={`/dashboard/orders/${settingData.orderNumber}`} className="text-emerald-600 hover:text-emerald-800 font-medium">
                    {settingData.orderNumber}
                  </Link>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Casting ID</span>
                  <Link href={`/dashboard/production/kanban/casting/${settingData.castingId}`} className="text-emerald-600 hover:text-emerald-800 font-medium">
                    {settingData.castingId}
                  </Link>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Design ID</span>
                  <Link href={`/dashboard/designs/${settingData.designId}`} className="text-emerald-600 hover:text-emerald-800 font-medium">
                    {settingData.designId}
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-emerald-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF Report
                </Button>
                <Button className="w-full" variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Progress Photo
                </Button>
                <Button className="w-full" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Add Revision Note
                </Button>
                <Button className="w-full" variant="outline">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Complete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 