"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  ArrowLeft, 
  Save, 
  Clock, 
  User, 
  FileText,
  Calendar,
  Palette,
  MessageSquare
} from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

interface RevisionData {
  id: number;
  date: string;
  reviewer: string;
  action: 'Accept' | 'Revise';
  notes: string;
  status: 'Pending' | 'Completed';
}

export default function DesignReviewPage() {
  const params = useParams();
  const router = useRouter();
  const designId = params.id as string;
  
  const [reviewAction, setReviewAction] = useState<'Accept' | 'Revise' | null>(null);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [designData, setDesignData] = useState<{
    designId: string;
    customerName: string;
    customerId: string;
    status: string;
    priority: string;
    assignedTo: string;
    dueDate: string;
    notes: string;
    revisions: number;
    files: { name: string; type: string; }[];
    orderNumber: string;
    designDetails: {
      materials: string[];
      dimensions: string;
      weight: string;
      stones: string;
      complexity: string;
    };
    previousRevisions: RevisionData[];
  }>({
    designId: 'DS-2024-0002',
    customerName: 'Ethan Davis',
    customerId: '2',
    status: 'Review',
    priority: 'Medium',
    assignedTo: 'David Chen',
    dueDate: '2024-07-20T20:00:00Z',
    notes: 'Sapphire pendant with diamond accents.',
    revisions: 1,
    files: [
      { name: "design-specs.pdf", type: "specification" },
      { name: "3d-render.png", type: "visual" },
      { name: "cost-breakdown.xlsx", type: "financial" }
    ],
    orderNumber: 'ORD-1002',
    designDetails: {
      materials: ['18K White Gold', 'Sapphire', 'Diamond Accents'],
      dimensions: '18mm x 12mm',
      weight: '2.8g',
      stones: '1x 3.2ct Sapphire, 6x 0.1ct Diamonds',
      complexity: 'Medium'
    },
    previousRevisions: [
      {
        id: 1,
        date: '2024-07-15T10:30:00Z',
        reviewer: 'Sarah Johnson',
        action: 'Revise',
        notes: 'Customer requested larger sapphire stone and more prominent diamond accents.',
        status: 'Completed'
      }
    ]
  });

  // Get current user (in real app, this would come from auth context)
  const currentUser = 'David Chen'; // Mock current user

  useEffect(() => {
    // In a real app, fetch design data based on designId
    console.log('Loading design:', designId);
  }, [designId]);

  const handleReviewSubmit = async () => {
    if (!reviewAction) {
      toast.error('Please select an action (Accept or Revise)');
      return;
    }

    if (reviewAction === 'Revise' && !revisionNotes.trim()) {
      toast.error('Please provide revision notes');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create new revision record
      const newRevision: RevisionData = {
        id: designData.previousRevisions.length + 1,
        date: new Date().toISOString(),
        reviewer: currentUser,
        action: reviewAction,
        notes: revisionNotes || 'No notes provided',
        status: 'Completed'
      };

      // Update design status
      const updatedDesign = {
        ...designData,
        status: reviewAction === 'Accept' ? 'Approved' : 'Revise',
        revisions: designData.revisions + (reviewAction === 'Revise' ? 1 : 0),
        previousRevisions: [...designData.previousRevisions, newRevision]
      };

      setDesignData(updatedDesign);

      toast.success(`Design ${reviewAction === 'Accept' ? 'approved' : 'sent for revision'} successfully`);
      
      // Redirect back to design kanban
      setTimeout(() => {
        router.push('/dashboard/production/kanban/design');
      }, 1500);

    } catch (error) {
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Review': return 'bg-yellow-100 text-yellow-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Revise': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Design Kanban
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-emerald-900 flex items-center gap-2">
              <Palette className="h-7 w-7 text-emerald-600" />
              Design Review
            </h1>
            <p className="text-gray-600 mt-1">Review and approve design specifications</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge className={getStatusColor(designData.status)}>
            {designData.status}
          </Badge>
          <Badge className={getPriorityColor(designData.priority)}>
            {designData.priority} Priority
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Review Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Design Information */}
          <Card className="shadow-lg border-emerald-100">
            <CardHeader className="bg-emerald-50 border-b border-emerald-100">
              <CardTitle className="text-xl text-emerald-900 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Design Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Design ID</Label>
                    <p className="text-lg font-semibold text-emerald-900">{designData.designId}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Customer</Label>
                    <p className="text-lg font-semibold text-emerald-900">{designData.customerName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Order Number</Label>
                    <p className="text-lg font-semibold text-emerald-900">{designData.orderNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Assigned To</Label>
                    <p className="text-lg font-semibold text-emerald-900">{designData.assignedTo}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Due Date</Label>
                    <p className="text-lg font-semibold text-emerald-900 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {format(parseISO(designData.dueDate), "PPP")}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Current Revisions</Label>
                    <p className="text-lg font-semibold text-emerald-900">{designData.revisions}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Design Notes</Label>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                      {designData.notes}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Design Specifications */}
          <Card className="shadow-lg border-emerald-100">
            <CardHeader className="bg-emerald-50 border-b border-emerald-100">
              <CardTitle className="text-xl text-emerald-900 flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Design Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Materials</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {designData.designDetails.materials.map((material, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {material}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Dimensions</Label>
                    <p className="text-sm text-gray-600">{designData.designDetails.dimensions}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Weight</Label>
                    <p className="text-sm text-gray-600">{designData.designDetails.weight}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Stones</Label>
                    <p className="text-sm text-gray-600">{designData.designDetails.stones}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Complexity</Label>
                    <Badge className={designData.designDetails.complexity === 'High' ? 'bg-red-100 text-red-800' : 
                                     designData.designDetails.complexity === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                                     'bg-green-100 text-green-800'}>
                      {designData.designDetails.complexity}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attached Files */}
          <Card className="shadow-lg border-emerald-100">
            <CardHeader className="bg-emerald-50 border-b border-emerald-100">
              <CardTitle className="text-xl text-emerald-900 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Attached Files
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {designData.files.map((file, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-medium text-gray-900">{file.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {file.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Review Actions Sidebar */}
        <div className="space-y-6">
          {/* Review Decision */}
          <Card className="shadow-lg border-emerald-100">
            <CardHeader className="bg-emerald-50 border-b border-emerald-100">
              <CardTitle className="text-xl text-emerald-900 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Review Decision
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Reviewer</Label>
                  <Input
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full"
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">Select Action</Label>
                  
                  <Button
                    variant={reviewAction === 'Accept' ? 'default' : 'outline'}
                    className={`w-full justify-start h-12 ${
                      reviewAction === 'Accept' 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'border-green-200 text-green-700 hover:bg-green-50'
                    }`}
                    onClick={() => setReviewAction('Accept')}
                  >
                    <CheckCircle className="h-5 w-5 mr-3" />
                    Accept Design
                  </Button>

                  <Button
                    variant={reviewAction === 'Revise' ? 'default' : 'outline'}
                    className={`w-full justify-start h-12 ${
                      reviewAction === 'Revise' 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'border-red-200 text-red-700 hover:bg-red-50'
                    }`}
                    onClick={() => setReviewAction('Revise')}
                  >
                    <XCircle className="h-5 w-5 mr-3" />
                    Request Revision
                  </Button>
                </div>

                {reviewAction === 'Revise' && (
                  <div className="space-y-3 pt-4 border-t">
                    <Label className="text-sm font-medium text-gray-700">Revision Notes</Label>
                    <Textarea
                      value={revisionNotes}
                      onChange={(e) => setRevisionNotes(e.target.value)}
                      placeholder="Please provide detailed feedback on what needs to be revised..."
                      className="min-h-[120px] resize-none"
                    />
                    <p className="text-xs text-gray-500">
                      Be specific about what changes are needed for the design.
                    </p>
                  </div>
                )}

                <Separator />

                <Button
                  onClick={handleReviewSubmit}
                  disabled={isSubmitting || !reviewAction || (reviewAction === 'Revise' && !revisionNotes.trim())}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Submitting...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Submit Review
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Previous Revisions */}
          <Card className="shadow-lg border-emerald-100">
            <CardHeader className="bg-emerald-50 border-b border-emerald-100">
              <CardTitle className="text-xl text-emerald-900 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Revision History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {designData.previousRevisions.map((revision) => (
                  <div key={revision.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">{revision.reviewer}</span>
                      </div>
                      <Badge className={revision.action === 'Accept' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {revision.action}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      {format(parseISO(revision.date), "PPP 'at' p")}
                    </p>
                    {revision.notes && (
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                        {revision.notes}
                      </p>
                    )}
                  </div>
                ))}
                {designData.previousRevisions.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No previous revisions
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 