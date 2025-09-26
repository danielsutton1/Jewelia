"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Clock, 
  User, 
  FileText,
  Calendar,
  Palette,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Filter,
  Search,
  Plus,
  Eye
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

// Mock data for revisions
const mockRevisionsData: {
  designId: string;
  customerName: string;
  orderNumber: string;
  totalRevisions: number;
  currentStatus: string;
  revisions: Revision[];
} = {
  designId: 'DS-2024-0002',
  customerName: 'Ethan Davis',
  orderNumber: 'ORD-1002',
  totalRevisions: 3,
  currentStatus: 'Review',
  revisions: [
    {
      id: 1,
      date: '2024-07-15T10:30:00Z',
      reviewer: 'Sarah Johnson',
      action: 'Revise' as const,
      notes: 'Customer requested larger sapphire stone and more prominent diamond accents. The current design feels too subtle for the customer\'s preference.',
      status: 'Completed' as const,
      changes: [
        'Increase sapphire size from 2.8ct to 3.2ct',
        'Add more diamond accents around the main stone',
        'Adjust setting height for better stone prominence'
      ],
      attachments: [
        { name: 'revision-notes-v1.pdf', type: 'document' },
        { name: 'customer-feedback.pdf', type: 'feedback' }
      ]
    },
    {
      id: 2,
      date: '2024-07-18T14:15:00Z',
      reviewer: 'Michael Kim',
      action: 'Revise' as const,
      notes: 'Design team needs to adjust the prong setting to accommodate the larger stone. Current design may not provide adequate security.',
      status: 'Completed' as const,
      changes: [
        'Redesign prong setting for 3.2ct stone',
        'Increase prong thickness for security',
        'Adjust overall ring size for balance'
      ],
      attachments: [
        { name: 'technical-specs-v2.pdf', type: 'document' },
        { name: '3d-model-update.stl', type: 'model' }
      ]
    },
    {
      id: 3,
      date: '2024-07-20T09:45:00Z',
      reviewer: 'David Chen',
      action: 'Accept' as const,
      notes: 'Final design meets all customer requirements and technical specifications. Ready for production.',
      status: 'Completed' as const,
      changes: [
        'All previous revisions incorporated',
        'Final approval for production',
        'Quality standards met'
      ],
      attachments: [
        { name: 'final-approval.pdf', type: 'document' },
        { name: 'production-ready-model.stl', type: 'model' }
      ]
    }
  ]
};

interface Revision {
  id: number;
  date: string;
  reviewer: string;
  action: 'Accept' | 'Revise';
  notes: string;
  status: 'Pending' | 'Completed';
  changes: string[];
  attachments: Array<{
    name: string;
    type: string;
  }>;
}

export default function DesignRevisionsPage() {
  const params = useParams();
  const router = useRouter();
  const designId = params.id as string;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterReviewer, setFilterReviewer] = useState<string>('all');
  const [selectedRevision, setSelectedRevision] = useState<Revision | null>(null);
  const [revisionsData, setRevisionsData] = useState(mockRevisionsData);

  useEffect(() => {
    // In a real app, fetch revisions data based on designId
    console.log('Loading revisions for design:', designId);
  }, [designId]);

  const filteredRevisions = revisionsData.revisions.filter(revision => {
    const matchesSearch = revision.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         revision.reviewer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = filterAction === 'all' || revision.action === filterAction;
    const matchesReviewer = filterReviewer === 'all' || revision.reviewer === filterReviewer;
    
    return matchesSearch && matchesAction && matchesReviewer;
  });

  const getActionColor = (action: string) => {
    return action === 'Accept' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusColor = (status: string) => {
    return status === 'Completed' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800';
  };

  const handleDownloadAttachment = (attachment: any) => {
    toast.success(`Downloading ${attachment.name}...`);
    // In real app, this would trigger actual file download
  };

  const handleViewRevision = (revision: Revision) => {
    setSelectedRevision(revision);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Design
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-emerald-900 flex items-center gap-2">
              <MessageSquare className="h-7 w-7 text-emerald-600" />
              Design Revisions
            </h1>
            <p className="text-gray-600 mt-1">Revision history and tracking for {designId}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-emerald-100 text-emerald-800">
            {revisionsData.totalRevisions} Revisions
          </Badge>
          <Badge className="bg-blue-100 text-blue-800">
            {revisionsData.currentStatus}
          </Badge>
        </div>
      </div>

      {/* Design Summary */}
      <Card className="mb-8 shadow-lg border-emerald-100">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <Label className="text-sm font-medium text-gray-700">Design ID</Label>
              <p className="text-lg font-semibold text-emerald-900">{revisionsData.designId}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Customer</Label>
              <p className="text-lg font-semibold text-emerald-900">{revisionsData.customerName}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Order Number</Label>
              <p className="text-lg font-semibold text-emerald-900">{revisionsData.orderNumber}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Current Status</Label>
              <Badge className="bg-blue-100 text-blue-800">{revisionsData.currentStatus}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revisions List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters */}
          <Card className="shadow-lg border-emerald-100">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search revisions..."
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Action</Label>
                  <select
                    value={filterAction}
                    onChange={(e) => setFilterAction(e.target.value)}
                    className="border rounded-md px-3 py-2 text-sm"
                  >
                    <option value="all">All Actions</option>
                    <option value="Accept">Accept</option>
                    <option value="Revise">Revise</option>
                  </select>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Reviewer</Label>
                  <select
                    value={filterReviewer}
                    onChange={(e) => setFilterReviewer(e.target.value)}
                    className="border rounded-md px-3 py-2 text-sm"
                  >
                    <option value="all">All Reviewers</option>
                    {Array.from(new Set(revisionsData.revisions.map(r => r.reviewer))).map(reviewer => (
                      <option key={reviewer} value={reviewer}>{reviewer}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revisions Timeline */}
          <div className="space-y-4">
            {filteredRevisions.length === 0 ? (
              <Card className="shadow-lg border-emerald-100">
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No revisions found matching your criteria</p>
                </CardContent>
              </Card>
            ) : (
              filteredRevisions.map((revision, index) => (
                <Card key={revision.id} className="shadow-lg border-emerald-100 hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 font-semibold">
                          {revision.id}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Revision #{revision.id}
                          </h3>
                          <p className="text-sm text-gray-500 flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            {format(parseISO(revision.date), "PPP 'at' p")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getActionColor(revision.action)}>
                          {revision.action}
                        </Badge>
                        <Badge className={getStatusColor(revision.status)}>
                          {revision.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Reviewer</Label>
                        <p className="text-sm text-gray-900 flex items-center gap-2">
                          <User className="h-3 w-3" />
                          {revision.reviewer}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Changes Made</Label>
                        <p className="text-sm text-gray-900">{revision.changes.length} changes</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Attachments</Label>
                        <p className="text-sm text-gray-900">{revision.attachments.length} files</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <Label className="text-sm font-medium text-gray-700">Notes</Label>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md mt-1">
                        {revision.notes}
                      </p>
                    </div>

                    {revision.changes.length > 0 && (
                      <div className="mb-4">
                        <Label className="text-sm font-medium text-gray-700">Changes</Label>
                        <ul className="list-disc list-inside text-sm text-gray-700 mt-1 space-y-1">
                          {revision.changes.map((change, changeIndex) => (
                            <li key={changeIndex}>{change}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {revision.attachments.length > 0 && (
                      <div className="mb-4">
                        <Label className="text-sm font-medium text-gray-700">Attachments</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {revision.attachments.map((attachment, attachIndex) => (
                            <Button
                              key={attachIndex}
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadAttachment(attachment)}
                              className="text-xs"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              {attachment.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewRevision(revision)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-3 w-3" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Revision Details Sidebar */}
        <div className="space-y-6">
          {selectedRevision ? (
            <Card className="shadow-lg border-emerald-100 sticky top-8">
              <CardHeader className="bg-emerald-50 border-b border-emerald-100">
                <CardTitle className="text-xl text-emerald-900 flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Revision Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Revision #{selectedRevision.id}</Label>
                    <p className="text-lg font-semibold text-emerald-900">{selectedRevision.action}</p>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Reviewer</Label>
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <User className="h-3 w-3" />
                      {selectedRevision.reviewer}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Date</Label>
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {format(parseISO(selectedRevision.date), "PPP 'at' p")}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Status</Label>
                    <Badge className={getStatusColor(selectedRevision.status)}>
                      {selectedRevision.status}
                    </Badge>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Notes</Label>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md mt-1">
                      {selectedRevision.notes}
                    </p>
                  </div>

                  {selectedRevision.changes.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Changes</Label>
                      <ul className="list-disc list-inside text-sm text-gray-700 mt-1 space-y-1">
                        {selectedRevision.changes.map((change, index) => (
                          <li key={index}>{change}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedRevision.attachments.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Attachments</Label>
                      <div className="space-y-2 mt-1">
                        {selectedRevision.attachments.map((attachment, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadAttachment(attachment)}
                            className="w-full justify-start text-xs"
                          >
                            <Download className="h-3 w-3 mr-2" />
                            {attachment.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-lg border-emerald-100">
              <CardContent className="p-8 text-center">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Select a revision to view details</p>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card className="shadow-lg border-emerald-100">
            <CardHeader className="bg-emerald-50 border-b border-emerald-100">
              <CardTitle className="text-xl text-emerald-900 flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push(`/dashboard/production/kanban/design/${designId}/review`)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Add New Review
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push(`/dashboard/production/kanban/design`)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Design Kanban
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 