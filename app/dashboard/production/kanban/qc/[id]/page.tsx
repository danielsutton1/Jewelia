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
  CheckCircle, 
  User, 
  Calendar, 
  ArrowLeft,
  Clock,
  AlertTriangle,
  Download,
  Upload,
  Eye,
  MessageSquare,
  Gem,
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
  Zap,
  Shield,
  Target,
  Microscope,
  Award,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

// Types for QC data
type QCSpecifications = {
  inspectionType?: string;
  qualityStandard?: string;
  toleranceLevel?: string;
  inspectionMethod?: string;
  certificationRequired?: string;
  complianceLevel?: string;
};

type QCInspection = {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'pending' | 'conditional';
  inspector: string;
  date: string;
  notes: string;
  photos?: string[];
  measurements?: { [key: string]: string };
};

type QCRevision = {
  version: string;
  date: string;
  changes: string;
  inspector: string;
  status: 'pending' | 'approved' | 'rejected';
};

type QCFile = {
  name: string;
  type: 'Report' | 'Photo' | 'Certificate' | 'Checklist' | 'Video';
  uploaded: string;
  size?: string;
};

// Mock QC data
const mockQCTasks = {
  'QC-2024-0001': {
    qcId: 'QC-2024-0001',
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
    createdAt: '2024-07-23T10:00:00Z',
    lastModified: '2024-07-24T14:30:00Z',
    progress: 60,
    notes: 'Final quality inspection for platinum engagement ring with diamond accents. Customer requested premium quality standards. Check stone security, finish quality, prong alignment, and overall craftsmanship. Pay special attention to diamond clarity and metal purity.',
    revisions: [
      {
        version: '1.1',
        date: '2024-07-24',
        changes: 'Added additional magnification inspection for stone security',
        inspector: 'Sarah Johnson',
        status: 'approved'
      }
    ],
    orderNumber: 'ORD-1001',
    polishingId: 'POL-2024-0001',
    settingId: 'SET-2024-0001',
    designId: 'DS-2024-0001',
    specifications: {
      inspectionType: 'Final Quality Control',
      qualityStandard: 'Premium',
      toleranceLevel: '±0.01mm',
      inspectionMethod: 'Visual + Magnification',
      certificationRequired: 'GIA Certificate',
      complianceLevel: 'Industry Standard'
    } as QCSpecifications,
    inspections: [
      {
        id: 'INS-001',
        name: 'Stone Security Check',
        status: 'passed',
        inspector: 'Sarah Johnson',
        date: '2024-07-24',
        notes: 'All prongs properly secured. No movement detected under 10x magnification.',
        photos: ['stone-security-1.jpg', 'stone-security-2.jpg'],
        measurements: { 'Prong Tension': 'Optimal', 'Stone Movement': 'None' }
      },
      {
        id: 'INS-002',
        name: 'Finish Quality Assessment',
        status: 'passed',
        inspector: 'Sarah Johnson',
        date: '2024-07-24',
        notes: 'Mirror finish achieved. No visible scratches or imperfections.',
        photos: ['finish-1.jpg', 'finish-2.jpg'],
        measurements: { 'Surface Finish': 'Mirror', 'Imperfections': 'None' }
      },
      {
        id: 'INS-003',
        name: 'Metal Purity Verification',
        status: 'pending',
        inspector: 'Sarah Johnson',
        date: null,
        notes: '',
        measurements: { 'Platinum Purity': 'Pending', 'Hallmark Verification': 'Pending' }
      },
      {
        id: 'INS-004',
        name: 'Overall Craftsmanship',
        status: 'pending',
        inspector: 'Sarah Johnson',
        date: null,
        notes: '',
        measurements: { 'Symmetry': 'Pending', 'Proportions': 'Pending' }
      }
    ] as QCInspection[],
    files: [
      { name: 'QC-2024-0001-checklist.pdf', type: 'Checklist', uploaded: '2024-07-23' },
      { name: 'QC-2024-0001-inspection-photos.pdf', type: 'Photo', uploaded: '2024-07-24' },
      { name: 'QC-2024-0001-gia-cert.pdf', type: 'Certificate', uploaded: '2024-07-23' },
      { name: 'QC-2024-0001-inspection-video.mp4', type: 'Video', uploaded: '2024-07-24' }
    ] as QCFile[],
    qualityMetrics: {
      overallScore: 95,
      stoneSecurity: 100,
      finishQuality: 95,
      metalPurity: 98,
      craftsmanship: 92
    }
  },
  'QC-2024-0002': {
    qcId: 'QC-2024-0002',
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
    createdAt: '2024-07-25T09:00:00Z',
    lastModified: '2024-07-26T16:45:00Z',
    progress: 85,
    notes: 'Quality control for gold pendant with sapphire center stone. Verify stone setting, metal finish, and chain integrity. Standard quality requirements.',
    revisions: [
      {
        version: '1.1',
        date: '2024-07-25',
        changes: 'Added chain integrity inspection',
        inspector: 'David Chen',
        status: 'approved'
      },
      {
        version: '1.2',
        date: '2024-07-26',
        changes: 'Updated inspection checklist for pendant-specific requirements',
        inspector: 'David Chen',
        status: 'pending'
      }
    ],
    orderNumber: 'ORD-1002',
    polishingId: 'POL-2024-0002',
    settingId: 'SET-2024-0002',
    designId: 'DS-2024-0002',
    specifications: {
      inspectionType: 'Standard Quality Control',
      qualityStandard: 'Standard',
      toleranceLevel: '±0.02mm',
      inspectionMethod: 'Visual Inspection',
      certificationRequired: 'None',
      complianceLevel: 'Standard'
    } as QCSpecifications,
    inspections: [
      {
        id: 'INS-005',
        name: 'Stone Setting Verification',
        status: 'passed',
        inspector: 'David Chen',
        date: '2024-07-26',
        notes: 'Sapphire properly set in channel setting. No movement detected.',
        photos: ['setting-1.jpg'],
        measurements: { 'Stone Movement': 'None', 'Setting Security': 'Secure' }
      },
      {
        id: 'INS-006',
        name: 'Chain Integrity Check',
        status: 'passed',
        inspector: 'David Chen',
        date: '2024-07-26',
        notes: 'Chain links properly connected. No weak points detected.',
        photos: ['chain-1.jpg'],
        measurements: { 'Link Strength': 'Good', 'Connection Points': 'Secure' }
      }
    ] as QCInspection[],
    files: [
      { name: 'QC-2024-0002-report.pdf', type: 'Report', uploaded: '2024-07-26' },
      { name: 'QC-2024-0002-final-photos.pdf', type: 'Photo', uploaded: '2024-07-26' }
    ] as QCFile[],
    qualityMetrics: {
      overallScore: 88,
      stoneSecurity: 95,
      finishQuality: 85,
      metalPurity: 90,
      craftsmanship: 88
    }
  }
};

const statusColors: { [key: string]: string } = {
  'In Progress': 'bg-blue-100 text-blue-800',
  'Review': 'bg-yellow-100 text-yellow-800',
  'Approved': 'bg-green-100 text-green-800',
  'Revise': 'bg-red-100 text-red-800',
};

const priorityColors: { [key: string]: string } = {
  'High': 'bg-red-100 text-red-800 border-red-200',
  'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Low': 'bg-green-100 text-green-800 border-green-200',
};

const inspectionStatusColors: { [key: string]: string } = {
  'passed': 'bg-green-100 text-green-800',
  'failed': 'bg-red-100 text-red-800',
  'pending': 'bg-yellow-100 text-yellow-800',
  'conditional': 'bg-orange-100 text-orange-800',
};

export default function QCDetailPage() {
  const params = useParams();
  const router = useRouter();
  const qcId = params.id as string;
  const [qcData, setQCData] = useState(() => mockQCTasks[qcId as keyof typeof mockQCTasks]);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState(qcData);

  if (!qcData) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <h1 className="text-3xl font-bold text-red-700 mb-4">QC Task Not Found</h1>
        <p className="text-gray-600 mb-8">The QC task you're looking for doesn't exist or has been removed.</p>
        <Link href="/dashboard/production/kanban/qc">
          <Button className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-emerald-700 transition">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to QC Kanban
          </Button>
        </Link>
      </div>
    );
  }

  const handleEdit = () => {
    setEditForm(qcData);
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
  };

  const handleSave = () => {
    setQCData(editForm);
    setEditMode(false);
    toast.success("QC task updated successfully");
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

  const getQualityScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/production/kanban/qc">
            <Button variant="outline" size="sm" className="text-gray-600 hover:text-gray-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Kanban
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-emerald-900 flex items-center gap-2">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
              {qcData.qcId}
            </h1>
            <p className="text-gray-600 mt-1">Quality Control Detail</p>
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
              Edit QC
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
                <Target className="h-5 w-5 text-emerald-600" />
                QC Status & Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge className={`text-sm font-semibold ${statusColors[qcData.status]}`}>
                    {qcData.status}
                  </Badge>
                  <Badge className={`text-sm font-semibold ${priorityColors[qcData.priority]}`}>
                    {qcData.priority} Priority
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Progress</div>
                  <div className="text-lg font-bold text-emerald-600">{qcData.progress}%</div>
                </div>
              </div>
              <Progress value={qcData.progress} className="h-2" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Created:</span>
                  <span className="ml-2 font-medium">{formatDate(qcData.createdAt)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Due Date:</span>
                  <span className="ml-2 font-medium">{formatDate(qcData.dueDate)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quality Score Dashboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-emerald-600" />
                Quality Score Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getQualityScoreColor(qcData.qualityMetrics.overallScore)}`}>
                    {qcData.qualityMetrics.overallScore}
                  </div>
                  <div className="text-sm text-gray-600">Overall</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getQualityScoreColor(qcData.qualityMetrics.stoneSecurity)}`}>
                    {qcData.qualityMetrics.stoneSecurity}
                  </div>
                  <div className="text-sm text-gray-600">Stone Security</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getQualityScoreColor(qcData.qualityMetrics.finishQuality)}`}>
                    {qcData.qualityMetrics.finishQuality}
                  </div>
                  <div className="text-sm text-gray-600">Finish Quality</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getQualityScoreColor(qcData.qualityMetrics.metalPurity)}`}>
                    {qcData.qualityMetrics.metalPurity}
                  </div>
                  <div className="text-sm text-gray-600">Metal Purity</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getQualityScoreColor(qcData.qualityMetrics.craftsmanship)}`}>
                    {qcData.qualityMetrics.craftsmanship}
                  </div>
                  <div className="text-sm text-gray-600">Craftsmanship</div>
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
                      <p className="text-gray-900 font-medium">{qcData.customerName}</p>
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
                      <p className="text-gray-900 font-medium">{qcData.customerId}</p>
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
                      <p className="text-gray-900">{qcData.customerEmail}</p>
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
                      <p className="text-gray-900">{qcData.customerPhone}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QC Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-emerald-600" />
                QC Specifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Inspection Type</label>
                  <div className="mt-1">
                    {editMode ? (
                      <Input
                        value={editForm?.specifications?.inspectionType || ''}
                        onChange={(e) => handleInputChange('specifications', { ...editForm?.specifications, inspectionType: e.target.value })}
                      />
                    ) : (
                      <p className="text-gray-900">{qcData.specifications.inspectionType}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Quality Standard</label>
                  <div className="mt-1">
                    {editMode ? (
                      <Input
                        value={editForm?.specifications?.qualityStandard || ''}
                        onChange={(e) => handleInputChange('specifications', { ...editForm?.specifications, qualityStandard: e.target.value })}
                      />
                    ) : (
                      <p className="text-gray-900">{qcData.specifications.qualityStandard}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Tolerance Level</label>
                  <div className="mt-1">
                    {editMode ? (
                      <Input
                        value={editForm?.specifications?.toleranceLevel || ''}
                        onChange={(e) => handleInputChange('specifications', { ...editForm?.specifications, toleranceLevel: e.target.value })}
                      />
                    ) : (
                      <p className="text-gray-900">{qcData.specifications.toleranceLevel}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Inspection Method</label>
                  <div className="mt-1">
                    {editMode ? (
                      <Input
                        value={editForm?.specifications?.inspectionMethod || ''}
                        onChange={(e) => handleInputChange('specifications', { ...editForm?.specifications, inspectionMethod: e.target.value })}
                      />
                    ) : (
                      <p className="text-gray-900">{qcData.specifications.inspectionMethod}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Certification Required</label>
                  <div className="mt-1">
                    {editMode ? (
                      <Input
                        value={editForm?.specifications?.certificationRequired || ''}
                        onChange={(e) => handleInputChange('specifications', { ...editForm?.specifications, certificationRequired: e.target.value })}
                      />
                    ) : (
                      <p className="text-gray-900">{qcData.specifications.certificationRequired}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Compliance Level</label>
                  <div className="mt-1">
                    {editMode ? (
                      <Input
                        value={editForm?.specifications?.complianceLevel || ''}
                        onChange={(e) => handleInputChange('specifications', { ...editForm?.specifications, complianceLevel: e.target.value })}
                      />
                    ) : (
                      <p className="text-gray-900">{qcData.specifications.complianceLevel}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inspection Checklist */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Microscope className="h-5 w-5 text-emerald-600" />
                Inspection Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {qcData.inspections.map((inspection) => (
                  <div key={inspection.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{inspection.name}</h4>
                        <p className="text-sm text-gray-500">Inspector: {inspection.inspector}</p>
                      </div>
                      <Badge className={inspectionStatusColors[inspection.status]}>
                        {inspection.status.charAt(0).toUpperCase() + inspection.status.slice(1)}
                      </Badge>
                    </div>
                    {inspection.date && (
                      <p className="text-sm text-gray-600 mb-2">Date: {inspection.date}</p>
                    )}
                    {inspection.notes && (
                      <p className="text-sm text-gray-700 mb-3">{inspection.notes}</p>
                    )}
                    {inspection.measurements && Object.keys(inspection.measurements).length > 0 && (
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(inspection.measurements).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-600">{key}:</span>
                            <span className="font-medium">{value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
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
                  placeholder="Enter QC notes and instructions..."
                />
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">{qcData.notes}</p>
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
                {qcData.files.map((file, index) => (
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
                {qcData.revisions.map((revision, index) => (
                  <div key={index} className="border-l-4 border-emerald-200 pl-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Version {revision.version}</p>
                        <p className="text-sm text-gray-500">{revision.date} • {revision.inspector}</p>
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
                  <p className="font-medium text-gray-900">{qcData.assignedTo}</p>
                  <p className="text-sm text-gray-500">{qcData.assignedToEmail}</p>
                </div>
              </div>
              <Button className="w-full mt-4" variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Inspector
              </Button>
            </CardContent>
          </Card>

          {/* Quality Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-emerald-600" />
                Quality Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {qcData.inspections.filter(ins => ins.status === 'failed' || ins.status === 'conditional').map((inspection) => (
                  <div key={inspection.id} className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-800">{inspection.name} - {inspection.status}</span>
                  </div>
                ))}
                {qcData.inspections.filter(ins => ins.status === 'failed' || ins.status === 'conditional').length === 0 && (
                  <p className="text-sm text-gray-500">No quality alerts</p>
                )}
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
                  <Link href={`/dashboard/orders/${qcData.orderNumber}`} className="text-emerald-600 hover:text-emerald-800 font-medium">
                    {qcData.orderNumber}
                  </Link>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Polishing ID</span>
                  <Link href={`/dashboard/production/kanban/polishing/${qcData.polishingId}`} className="text-emerald-600 hover:text-emerald-800 font-medium">
                    {qcData.polishingId}
                  </Link>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Setting ID</span>
                  <Link href={`/dashboard/production/kanban/setting/${qcData.settingId}`} className="text-emerald-600 hover:text-emerald-800 font-medium">
                    {qcData.settingId}
                  </Link>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Design ID</span>
                  <Link href={`/dashboard/designs/${qcData.designId}`} className="text-emerald-600 hover:text-emerald-800 font-medium">
                    {qcData.designId}
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
                  Download QC Report
                </Button>
                <Button className="w-full" variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Inspection Photos
                </Button>
                <Button className="w-full" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Add Inspection Note
                </Button>
                <Button className="w-full" variant="outline">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Complete
                </Button>
                <Button className="w-full" variant="outline">
                  <Shield className="h-4 w-4 mr-2" />
                  Generate Certificate
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 