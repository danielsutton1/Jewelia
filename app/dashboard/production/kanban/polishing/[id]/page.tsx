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
  Sparkles, 
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
  Gem,
  Zap
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

// Types for polishing data
type PolishingSpecifications = {
  finishType?: string;
  gritLevel?: string;
  metalType?: string;
  technique?: string;
  finalFinish?: string;
  qualityLevel?: string;
};

type PolishingRevision = {
  version: string;
  date: string;
  changes: string;
  polisher: string;
  status: 'pending' | 'approved' | 'rejected';
};

type PolishingFile = {
  name: string;
  type: 'CAD' | 'Photo' | 'Instruction' | 'Report' | 'Sample';
  uploaded: string;
  size?: string;
};

// Mock polishing data
const mockPolishingTasks = {
  'POL-2024-0001': {
    polishingId: 'POL-2024-0001',
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
    createdAt: '2024-07-20T10:00:00Z',
    lastModified: '2024-07-22T14:30:00Z',
    progress: 75,
    notes: 'High-gloss polishing for platinum engagement ring with diamond accents. Customer requested mirror finish with exceptional brilliance. Pay special attention to prong areas and stone security.',
    revisions: [
      {
        version: '1.1',
        date: '2024-07-22',
        changes: 'Adjusted grit level for better surface preparation before final polish',
        polisher: 'Sarah Johnson',
        status: 'approved'
      }
    ] as PolishingRevision[],
    orderNumber: 'ORD-1001',
    settingId: 'SET-2024-0001',
    designId: 'DS-2024-0001',
    specifications: {
      finishType: 'High Gloss',
      gritLevel: '1200-1500',
      metalType: 'Platinum',
      technique: 'Mirror Polish',
      finalFinish: 'Brilliant',
      qualityLevel: 'Premium'
    } as PolishingSpecifications,
    files: [
      { name: 'POL-2024-0001-specs.pdf', type: 'Instruction', uploaded: '2024-07-20' },
      { name: 'POL-2024-0001-finish-requirements.pdf', type: 'Report', uploaded: '2024-07-20' },
      { name: 'POL-2024-0001-before.jpg', type: 'Photo', uploaded: '2024-07-21' },
      { name: 'POL-2024-0001-progress-1.jpg', type: 'Photo', uploaded: '2024-07-22' },
      { name: 'POL-2024-0001-sample-finish.stl', type: 'Sample', uploaded: '2024-07-21' }
    ] as PolishingFile[],
    qualityChecks: [
      { check: 'Surface Smoothness', status: 'Passed', date: '2024-07-22' },
      { check: 'Finish Consistency', status: 'Passed', date: '2024-07-22' },
      { check: 'Final Inspection', status: 'Pending', date: null }
    ]
  },
  'POL-2024-0002': {
    polishingId: 'POL-2024-0002',
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
    createdAt: '2024-07-22T09:00:00Z',
    lastModified: '2024-07-24T16:45:00Z',
    progress: 90,
    notes: 'Matte finish polishing for gold pendant with sapphire center stone. Customer prefers satin finish with subtle texture.',
    revisions: [
      {
        version: '1.1',
        date: '2024-07-23',
        changes: 'Adjusted grit level for more pronounced matte finish',
        polisher: 'David Chen',
        status: 'approved'
      },
      {
        version: '1.2',
        date: '2024-07-24',
        changes: 'Refined satin texture for better visual appeal',
        polisher: 'David Chen',
        status: 'pending'
      }
    ] as PolishingRevision[],
    orderNumber: 'ORD-1002',
    settingId: 'SET-2024-0002',
    designId: 'DS-2024-0002',
    specifications: {
      finishType: 'Matte',
      gritLevel: '400-600',
      metalType: '18k Yellow Gold',
      technique: 'Satin Finish',
      finalFinish: 'Matte',
      qualityLevel: 'Standard'
    } as PolishingSpecifications,
    files: [
      { name: 'POL-2024-0002-model.stl', type: 'CAD', uploaded: '2024-07-22' },
      { name: 'POL-2024-0002-final.jpg', type: 'Photo', uploaded: '2024-07-24' },
      { name: 'POL-2024-0002-finish-sample.jpg', type: 'Sample', uploaded: '2024-07-23' }
    ] as PolishingFile[],
    qualityChecks: [
      { check: 'Surface Smoothness', status: 'Passed', date: '2024-07-23' },
      { check: 'Finish Consistency', status: 'Passed', date: '2024-07-23' },
      { check: 'Final Inspection', status: 'Passed', date: '2024-07-24' }
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

export default function PolishingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const polishingId = params.id as string;
  const [polishingData, setPolishingData] = useState(() => mockPolishingTasks[polishingId as keyof typeof mockPolishingTasks]);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState(polishingData);

  if (!polishingData) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <h1 className="text-3xl font-bold text-red-700 mb-4">Polishing Task Not Found</h1>
        <p className="text-gray-600 mb-8">The polishing task you're looking for doesn't exist or has been removed.</p>
        <Link href="/dashboard/production/kanban/polishing">
          <Button className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-emerald-700 transition">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Polishing Kanban
          </Button>
        </Link>
      </div>
    );
  }

  const handleEdit = () => {
    setEditForm(polishingData);
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
  };

  const handleSave = () => {
    setPolishingData(editForm);
    setEditMode(false);
    toast.success("Polishing task updated successfully");
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
          <Link href="/dashboard/production/kanban/polishing">
            <Button variant="outline" size="sm" className="text-gray-600 hover:text-gray-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Kanban
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-emerald-900 flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-emerald-600" />
              {polishingData.polishingId}
            </h1>
            <p className="text-gray-600 mt-1">Polishing Task Detail</p>
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
              Edit Polishing
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
                <Zap className="h-5 w-5 text-emerald-600" />
                Polishing Status & Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge className={`text-sm font-semibold ${statusColors[polishingData.status]}`}>
                    {polishingData.status}
                  </Badge>
                  <Badge className={`text-sm font-semibold ${priorityColors[polishingData.priority]}`}>
                    {polishingData.priority} Priority
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Progress</div>
                  <div className="text-lg font-bold text-emerald-600">{polishingData.progress}%</div>
                </div>
              </div>
              <Progress value={polishingData.progress} className="h-2" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Created:</span>
                  <span className="ml-2 font-medium">{formatDate(polishingData.createdAt)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Due Date:</span>
                  <span className="ml-2 font-medium">{formatDate(polishingData.dueDate)}</span>
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
                      <p className="text-gray-900 font-medium">{polishingData.customerName}</p>
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
                      <p className="text-gray-900 font-medium">{polishingData.customerId}</p>
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
                      <p className="text-gray-900">{polishingData.customerEmail}</p>
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
                      <p className="text-gray-900">{polishingData.customerPhone}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Polishing Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-emerald-600" />
                Polishing Specifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Finish Type</label>
                  <div className="mt-1">
                    {editMode ? (
                      <Input
                        value={editForm?.specifications?.finishType || ''}
                        onChange={(e) => handleInputChange('specifications', { ...editForm?.specifications, finishType: e.target.value })}
                      />
                    ) : (
                      <p className="text-gray-900">{polishingData.specifications.finishType}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Grit Level</label>
                  <div className="mt-1">
                    {editMode ? (
                      <Input
                        value={editForm?.specifications?.gritLevel || ''}
                        onChange={(e) => handleInputChange('specifications', { ...editForm?.specifications, gritLevel: e.target.value })}
                      />
                    ) : (
                      <p className="text-gray-900">{polishingData.specifications.gritLevel}</p>
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
                      <p className="text-gray-900">{polishingData.specifications.metalType}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Technique</label>
                  <div className="mt-1">
                    {editMode ? (
                      <Input
                        value={editForm?.specifications?.technique || ''}
                        onChange={(e) => handleInputChange('specifications', { ...editForm?.specifications, technique: e.target.value })}
                      />
                    ) : (
                      <p className="text-gray-900">{polishingData.specifications.technique}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Final Finish</label>
                  <div className="mt-1">
                    {editMode ? (
                      <Input
                        value={editForm?.specifications?.finalFinish || ''}
                        onChange={(e) => handleInputChange('specifications', { ...editForm?.specifications, finalFinish: e.target.value })}
                      />
                    ) : (
                      <p className="text-gray-900">{polishingData.specifications.finalFinish}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Quality Level</label>
                  <div className="mt-1">
                    {editMode ? (
                      <Input
                        value={editForm?.specifications?.qualityLevel || ''}
                        onChange={(e) => handleInputChange('specifications', { ...editForm?.specifications, qualityLevel: e.target.value })}
                      />
                    ) : (
                      <p className="text-gray-900">{polishingData.specifications.qualityLevel}</p>
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
                  placeholder="Enter polishing notes and instructions..."
                />
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">{polishingData.notes}</p>
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
                {polishingData.files.map((file, index) => (
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
                {polishingData.revisions.map((revision, index) => (
                  <div key={index} className="border-l-4 border-emerald-200 pl-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Version {revision.version}</p>
                        <p className="text-sm text-gray-500">{revision.date} • {revision.polisher}</p>
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
                  <p className="font-medium text-gray-900">{polishingData.assignedTo}</p>
                  <p className="text-sm text-gray-500">{polishingData.assignedToEmail}</p>
                </div>
              </div>
              <Button className="w-full mt-4" variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Polisher
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
                {polishingData.qualityChecks.map((check, index) => (
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
                <Gem className="h-5 w-5 text-emerald-600" />
                Related Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Order Number</span>
                  <Link href={`/dashboard/orders/${polishingData.orderNumber}`} className="text-emerald-600 hover:text-emerald-800 font-medium">
                    {polishingData.orderNumber}
                  </Link>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Setting ID</span>
                  <Link href={`/dashboard/production/kanban/setting/${polishingData.settingId}`} className="text-emerald-600 hover:text-emerald-800 font-medium">
                    {polishingData.settingId}
                  </Link>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Design ID</span>
                  <Link href={`/dashboard/designs/${polishingData.designId}`} className="text-emerald-600 hover:text-emerald-800 font-medium">
                    {polishingData.designId}
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