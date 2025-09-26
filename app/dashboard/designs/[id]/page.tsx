"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, 
  User, 
  Calendar, 
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Upload,
  Eye,
  MessageSquare,
  DollarSign,
  Gem,
  Settings,
  Image as ImageIcon,
  FileImage,
  Star,
  ThumbsUp,
  ThumbsDown,
  Edit3,
  Save,
  X
} from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { toast } from "sonner";

// Add Revision type
type Specifications = {
  ringSize?: string;
  bandWidth?: string;
  length?: string;
  width?: string;
  setting?: string;
  finish?: string;
};

type Revision = {
  version: string;
  date: string;
  changes: string;
  designer: string;
};

// Mock design data
const mockDesigns = {
  'DS-2024-0001': {
    designId: 'DS-2024-0001',
    callLogId: 'CL-2024-0001',
    customer: 'Sophia Chen',
    customerId: 'C-1001',
    designer: 'Sarah Johnson',
    status: 'in-progress',
    priority: 'high',
    startDate: '2024-07-01',
    dueDate: '2024-07-15',
    completionDate: null,
    designType: 'Engagement Ring',
    style: 'Modern',
    materials: {
      metal: 'Platinum',
      centerStone: 'Diamond',
      accentStones: 'Sapphires',
      caratWeight: '2.5',
      clarity: 'VS1',
      color: 'F'
    },
    specifications: {
      ringSize: '6.5',
      bandWidth: '2.2mm',
      setting: 'Pave',
      finish: 'Polished'
    } as Specifications,
    budget: {
      min: 15000,
      max: 25000,
      target: 20000
    },
    description: 'Custom engagement ring with 2.5-carat center diamond, platinum band with pave sapphire accents. Modern, elegant design with clean lines.',
    inspiration: 'Client provided Pinterest board with modern geometric designs',
    notes: 'Client prefers platinum over gold. Wants a unique design that stands out.',
    cadFiles: [
      { name: 'DS-2024-0001-main.step', type: 'CAD', uploaded: '2024-07-02' },
      { name: 'DS-2024-0001-detail.step', type: 'CAD', uploaded: '2024-07-03' }
    ],
    renderings: [
      { name: 'DS-2024-0001-front.png', type: 'Front View', uploaded: '2024-07-04' },
      { name: 'DS-2024-0001-side.png', type: 'Side View', uploaded: '2024-07-04' },
      { name: 'DS-2024-0001-top.png', type: 'Top View', uploaded: '2024-07-04' }
    ],
    clientFeedback: [
      {
        date: '2024-07-05',
        feedback: 'Love the overall design! Could we make the band slightly thinner?',
        rating: 4,
        status: 'addressed'
      }
    ],
    revisions: [
      {
        version: '1.1',
        date: '2024-07-06',
        changes: 'Reduced band width from 2.5mm to 2.2mm',
        designer: 'Sarah Johnson'
      }
    ] as Revision[],
    files: [],
    finalAttachments: [],
    quoteNumber: '',
    orderNumber: ''
  },
  'DS-2024-0002': {
    designId: 'DS-2024-0002',
    callLogId: 'CL-2024-0003',
    customer: 'Ava Martinez',
    customerId: 'C-1003',
    designer: 'David Chen',
    status: 'completed',
    priority: 'medium',
    startDate: '2024-07-03',
    dueDate: '2024-07-20',
    completionDate: '2024-07-12',
    designType: 'Tennis Bracelet',
    style: 'Classic',
    materials: {
      metal: '18k White Gold',
      centerStone: 'Diamond',
      accentStones: 'Emeralds',
      caratWeight: '8.5',
      clarity: 'VS2',
      color: 'G'
    },
    specifications: {
      length: '7.5 inches',
      width: '3.5mm',
      setting: 'Channel',
      finish: 'Polished'
    } as Specifications,
    budget: {
      min: 12000,
      max: 18000,
      target: 15000
    },
    description: 'Tennis bracelet with alternating diamonds and emeralds in 18k white gold channel setting.',
    inspiration: 'Classic tennis bracelet with modern twist',
    notes: 'Client provided inspiration photos. Wants alternating pattern.',
    cadFiles: [
      { name: 'DS-2024-0002-main.step', type: 'CAD', uploaded: '2024-07-05' }
    ],
    renderings: [
      { name: 'DS-2024-0002-front.png', type: 'Front View', uploaded: '2024-07-06' },
      { name: 'DS-2024-0002-detail.png', type: 'Detail View', uploaded: '2024-07-06' }
    ],
    clientFeedback: [
      {
        date: '2024-07-10',
        feedback: 'Perfect! Exactly what I was looking for.',
        rating: 5,
        status: 'approved'
      }
    ],
    revisions: [] as Revision[],
    files: [],
    finalAttachments: [],
    quoteNumber: '',
    orderNumber: ''
  },
  'DS-2024-0003': {
    designId: 'DS-2024-0003',
    callLogId: 'CL-2024-0005',
    customer: 'Ava Martinez',
    customerId: 'C-1005',
    designer: 'Emily Rodriguez',
    status: 'approved',
    priority: 'low',
    startDate: '2024-07-05',
    dueDate: '2024-07-10',
    completionDate: '2024-07-09',
    designType: 'Custom Bracelet',
    style: 'Contemporary',
    materials: {
      metal: 'Rose Gold',
      centerStone: 'Morganite',
      accentStones: 'Diamonds',
      caratWeight: '1.8',
      clarity: 'VS1',
      color: 'H'
    },
    specifications: {
      length: '7 inches',
      width: '4mm',
      setting: 'Bezel',
      finish: 'High Polish'
    },
    budget: {
      min: 3500,
      max: 6000,
      target: 5000
    },
    description: 'Contemporary bracelet in rose gold with morganite center and diamond accents. Elegant, feminine, and perfect for daily wear.',
    inspiration: 'Inspired by modern Italian jewelry trends.',
    notes: 'Client requested a secure clasp and hypoallergenic materials.',
    cadFiles: [
      { name: 'DS-2024-0003-main.step', type: 'CAD', uploaded: '2024-07-06' }
    ],
    renderings: [
      { name: 'DS-2024-0003-front.png', type: 'Front View', uploaded: '2024-07-07' }
    ],
    clientFeedback: [
      {
        date: '2024-07-08',
        feedback: 'Love the color and style. Please confirm the clasp type.',
        rating: 5,
        status: 'approved'
      }
    ],
    revisions: [],
    files: [],
    finalAttachments: [],
    quoteNumber: '',
    orderNumber: ''
  },
  'DS-2024-0004': {
    designId: 'DS-2024-0004',
    callLogId: 'CL-2024-0006',
    customer: 'Liam Smith',
    customerId: 'C-1006',
    designer: 'Michael Kim',
    status: 'rejected',
    priority: 'high',
    startDate: '2024-07-10',
    dueDate: '2024-07-25',
    completionDate: null,
    designType: 'Wedding Band',
    style: 'Classic',
    materials: {
      metal: '18k Yellow Gold',
      centerStone: '',
      accentStones: 'None',
      caratWeight: '',
      clarity: '',
      color: ''
    },
    specifications: {
      length: '',
      width: '5mm',
      setting: 'Plain',
      finish: 'Matte'
    },
    budget: {
      min: 1200,
      max: 2000,
      target: 1800
    },
    description: 'Classic men\'s wedding band in 18k yellow gold with a matte finish. Timeless and durable.',
    inspiration: 'Traditional wedding bands with a modern matte twist.',
    notes: 'Client requested a comfort fit and engraving inside the band.',
    cadFiles: [
      { name: 'DS-2024-0004-main.step', type: 'CAD', uploaded: '2024-07-12' }
    ],
    renderings: [
      { name: 'DS-2024-0004-front.png', type: 'Front View', uploaded: '2024-07-13' }
    ],
    clientFeedback: [
      {
        date: '2024-07-20',
        feedback: 'Would like a shinier finish and a thinner band.',
        rating: 3,
        status: 'revision-requested'
      }
    ],
    revisions: [
      {
        version: '1.0',
        date: '2024-07-22',
        changes: 'Proposed thinner band and polished finish.',
        designer: 'Michael Kim'
      }
    ],
    files: [],
    finalAttachments: [],
    quoteNumber: '',
    orderNumber: ''
  }
};

const blankDesign = {
  designId: '',
  callLogId: '',
  customer: '',
  customerId: '',
  designer: '',
  status: 'pending',
  priority: 'medium',
  startDate: '',
  dueDate: '',
  completionDate: null,
  designType: '',
  style: '',
  materials: {
    metal: '',
    centerStone: '',
    accentStones: '',
    caratWeight: '',
    clarity: '',
    color: ''
  },
  specifications: {},
  budget: {
    min: 0,
    max: 0,
    target: 0
  },
  description: '',
  inspiration: '',
  notes: '',
  cadFiles: [],
  renderings: [],
  clientFeedback: [],
  revisions: [],
  files: [],
  finalAttachments: [],
  quoteNumber: '',
  orderNumber: ''
};

export default function DesignDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const designId = params.id as string;

  const isNew = designId === 'new';
  const [design, setDesign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editDraft, setEditDraft] = useState<any>(null);
  const [newFeedback, setNewFeedback] = useState("");
  const [newRevision, setNewRevision] = useState("");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showSendQuoteModal, setShowSendQuoteModal] = useState(false);
  const [quoteMessage, setQuoteMessage] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);

  // Fetch design data
  useEffect(() => {
    async function fetchDesign() {
      if (isNew) {
        setDesign(blankDesign);
        setLoading(false);
        return;
      }

      try {
        // First try to get from API
        const response = await fetch('/api/designs');
        const result = await response.json();
        
        if (result.success) {
          const foundDesign = result.data.find((d: any) => d.design_id === designId);
          if (foundDesign) {
            // Transform API data to match expected structure
            const transformedDesign = {
              designId: foundDesign.design_id,
              callLogId: foundDesign.call_log_id,
              customer: foundDesign.client_name || 'Unknown Customer',
              customerId: foundDesign.client_id || 'Unknown',
              designer: foundDesign.designer || foundDesign.assigned_to || 'Unassigned',
              status: foundDesign.approval_status || 'pending',
              priority: foundDesign.priority || 'medium',
              startDate: foundDesign.created_date ? new Date(foundDesign.created_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              dueDate: foundDesign.due_date ? new Date(foundDesign.due_date).toISOString().split('T')[0] : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              completionDate: null,
              designType: 'Custom Design',
              style: 'Custom',
              materials: {
                metal: 'To be determined',
                centerStone: 'To be determined',
                accentStones: 'To be determined',
                caratWeight: 'To be determined',
                clarity: 'To be determined',
                color: 'To be determined'
              },
              specifications: {
                ringSize: 'To be determined',
                bandWidth: 'To be determined',
                setting: 'To be determined',
                finish: 'To be determined'
              } as Specifications,
              budget: {
                min: foundDesign.estimated_value || 0,
                max: foundDesign.estimated_value * 1.5 || 0,
                target: foundDesign.estimated_value || 0
              },
              description: foundDesign.notes || 'Design brief to be created',
              inspiration: 'Based on customer consultation',
              notes: foundDesign.notes || '',
              cadFiles: [],
              renderings: [],
              clientFeedback: [],
              revisions: [],
              sourceCallLog: foundDesign.source_call_log,
              files: foundDesign.files || [],
              finalAttachments: foundDesign.finalAttachments || []
            };
            
            setDesign(transformedDesign);
            setEditDraft(transformedDesign);
            setQuoteMessage(`Dear ${transformedDesign.customer},\n\nWe are excited to share your custom design is ready for review! Please find the details and let us know if you have any questions or would like to proceed.\n\nBest regards,\nJewelia Team`);
          } else {
            // Fallback to mock data
            const mockDesign = mockDesigns[designId as keyof typeof mockDesigns];
            if (mockDesign) {
              setDesign(mockDesign);
              setEditDraft(mockDesign);
              setQuoteMessage(`Dear ${mockDesign.customer},\n\nWe are excited to share your custom design is ready for review! Please find the details and let us know if you have any questions or would like to proceed.\n\nBest regards,\nJewelia Team`);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching design:', error);
        // Fallback to mock data
        const mockDesign = mockDesigns[designId as keyof typeof mockDesigns];
        if (mockDesign) {
          setDesign(mockDesign);
          setEditDraft(mockDesign);
          setQuoteMessage(`Dear ${mockDesign.customer},\n\nWe are excited to share your custom design is ready for review! Please find the details and let us know if you have any questions or would like to proceed.\n\nBest regards,\nJewelia Team`);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchDesign();
  }, [designId, isNew]);

  // Handle edit mode from URL params
  useEffect(() => {
    if (!editMode && searchParams.get('edit') === '1') {
      setEditMode(true);
    }
  }, [searchParams, editMode]);

  // Show loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-10 px-2 md:px-0">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard/designs/status">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Designs
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Design...</h2>
            <p className="text-gray-600">Please wait while we load the design details.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If design not found, show error
  if (!design) {
    return (
      <div className="max-w-6xl mx-auto py-10 px-2 md:px-0">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard/designs/status">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Designs
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Design Not Found</h2>
            <p className="text-gray-600">The design with ID "{designId}" could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'on-hold': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = (newStatus: string) => {
    const updatedDesign = { ...design, status: newStatus };
    if (newStatus === 'completed') {
      updatedDesign.completionDate = new Date().toISOString().split('T')[0];
    }
    setDesign(updatedDesign);
    toast.success(`Design status updated to ${newStatus}`);
  };

  const handleEdit = () => {
    setEditDraft(design);
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditDraft(design);
    setEditMode(false);
  };

  const handleSave = () => {
    setDesign(editDraft);
    setEditMode(false);
    toast.success("Design details updated successfully");
  };

  const handleInputChange = (field: string, value: any) => {
    setEditDraft({ ...editDraft, [field]: value });
  };

  const handleAddFeedback = () => {
    if (newFeedback.trim()) {
      const feedback = {
        date: new Date().toISOString().split('T')[0],
        feedback: newFeedback,
        rating: 0,
        status: 'pending'
      };
      setDesign({
        ...design,
        clientFeedback: [...(design.clientFeedback || []), feedback]
      });
      setNewFeedback("");
      setShowFeedbackModal(false);
      toast.success("Client feedback added");
    }
  };

  const handleAddRevision = () => {
    if (newRevision.trim()) {
      const revision = {
        version: `${(design.revisions || []).length + 1}.0`,
        date: new Date().toISOString().split('T')[0],
        changes: newRevision,
        designer: design.designer
      };
      setDesign({
        ...design,
        revisions: [...(design.revisions || []), revision]
      });
      setNewRevision("");
      setShowRevisionModal(false);
      toast.success("Revision added");
    }
  };

  const handleConvertToQuote = () => {
    const quoteNumber = `Q-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    setDesign({
      ...design,
      quoteNumber: quoteNumber
    });
    toast.success(`Design converted to Quote ${quoteNumber}`);
  };

  const handleRegenerateAI = async () => {
    if (aiLoading) return;
    setAiLoading(true);
    // Placeholder for AI call
    setTimeout(() => {
      setQuoteMessage(`Dear ${design.customer},\n\nYour custom design is now complete! We look forward to your feedback and are here to assist with any questions.\n\nWarm regards,\nJewelia Team\n\n[AI Regenerated at ${new Date().toLocaleTimeString()}]`);
      setAiLoading(false);
    }, 1200);
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 relative">
      {/* Luxury Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23d1fae5%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto py-4 px-4 md:px-0">
        {/* Premium Header */}
        <div className="relative z-10 max-w-7xl mx-auto mb-4">
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-4">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <Link href="/dashboard/designs/status">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 rounded-full shadow-lg">
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-green-700 bg-clip-text text-transparent tracking-tight">
                    Design Details
                  </h1>
                  <p className="text-emerald-600 text-sm font-medium">Design ID: <span className="text-emerald-800 font-semibold">{design.designId}</span></p>
                </div>
              </div>
              
              {/* Premium Quick Actions */}
              <div className="flex flex-col items-end gap-2 min-w-[180px]">
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 rounded-full shadow-lg"
                    onClick={() => toast.success("Exporting design...")}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 rounded-full shadow-lg"
                    onClick={() => toast.success("Printing design...")}
                  >
                    <FileText className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 rounded-full shadow-lg"
                    onClick={() => toast.success("Sharing design...")}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>
                
                {editMode && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleCancel}
                      className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-lg text-xs px-3 py-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleSave}
                      className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-lg shadow-lg text-xs px-3 py-1"
                    >
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Premium Summary Cards */}
        <div className="relative z-10 max-w-7xl mx-auto mb-4 flex justify-center">
          <div className="flex justify-center gap-3 flex-wrap px-4 md:px-0">
            <Card className="w-40 flex flex-col items-center justify-center p-3 cursor-pointer border-2 shadow-lg rounded-xl bg-emerald-50/80 backdrop-blur-sm transition-all duration-300 hover:border-emerald-200 hover:scale-105">
              <CardContent className="flex flex-col items-center justify-center p-0">
                <div className={`w-5 h-5 mb-1 rounded-full ${getStatusColor(design.status)}`}></div>
                <div className="text-lg font-extrabold text-emerald-900 capitalize">{design.status.replace('-', ' ')}</div>
                <div className="text-xs font-medium text-emerald-700">Status</div>
              </CardContent>
            </Card>
            
            <Card className="w-40 flex flex-col items-center justify-center p-3 cursor-pointer border-2 shadow-lg rounded-xl bg-yellow-50/80 backdrop-blur-sm transition-all duration-300 hover:border-yellow-200 hover:scale-105">
              <CardContent className="flex flex-col items-center justify-center p-0">
                <div className={`w-5 h-5 mb-1 rounded-full ${getPriorityColor(design.priority)}`}></div>
                <div className="text-lg font-extrabold text-yellow-900 capitalize">{design.priority}</div>
                <div className="text-xs font-medium text-yellow-700">Priority</div>
              </CardContent>
            </Card>
            
            <Card className="w-40 flex flex-col items-center justify-center p-3 cursor-pointer border-2 shadow-lg rounded-xl bg-blue-50/80 backdrop-blur-sm transition-all duration-300 hover:border-blue-200 hover:scale-105">
              <CardContent className="flex flex-col items-center justify-center p-0">
                <Gem className="w-5 h-5 mb-1 text-blue-600" />
                <div className="text-lg font-extrabold text-blue-900">{design.materials.caratWeight}ct</div>
                <div className="text-xs font-medium text-blue-700">Carat Weight</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Design Information */}
          <div className="lg:col-span-2 space-y-4">
            {/* Design Overview */}
            <Card className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100/50 p-4">
                <CardTitle className="flex items-center gap-2 text-emerald-700 text-xl font-bold">
                  <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg shadow-lg">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  Design Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-emerald-700">Customer</label>
                    {editMode ? (
                      <Input value={editDraft.customer} onChange={e => handleInputChange('customer', e.target.value)} className="w-full border border-emerald-200 rounded-lg px-3 py-2 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm" />
                    ) : (
                      <p className="text-sm font-semibold text-emerald-800 bg-emerald-50/50 rounded-lg px-3 py-2">{design.customer} <span className="text-emerald-600">({design.customerId})</span></p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-emerald-700">Designer</label>
                    {editMode ? (
                      <Input value={editDraft.designer} onChange={e => handleInputChange('designer', e.target.value)} className="w-full border border-emerald-200 rounded-lg px-3 py-2 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm" />
                    ) : (
                      <p className="text-sm font-semibold bg-emerald-50/50 rounded-lg px-3 py-2">{design.designer}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-emerald-700">Design Type</label>
                    {editMode ? (
                      <Input value={editDraft.designType} onChange={e => handleInputChange('designType', e.target.value)} className="w-full border border-emerald-200 rounded-lg px-3 py-2 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm" />
                    ) : (
                      <p className="text-sm font-semibold bg-emerald-50/50 rounded-lg px-3 py-2">{design.designType}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-emerald-700">Style</label>
                    {editMode ? (
                      <Input value={editDraft.style} onChange={e => handleInputChange('style', e.target.value)} className="w-full border border-emerald-200 rounded-lg px-3 py-2 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm" />
                    ) : (
                      <p className="text-sm font-semibold bg-emerald-50/50 rounded-lg px-3 py-2">{design.style}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-emerald-700">Start Date</label>
                    {editMode ? (
                      <Input type="date" value={editDraft.startDate} onChange={e => handleInputChange('startDate', e.target.value)} className="w-full border border-emerald-200 rounded-lg px-3 py-2 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm" />
                    ) : (
                      <p className="text-sm font-semibold bg-emerald-50/50 rounded-lg px-3 py-2">{design.startDate}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-emerald-700">Due Date</label>
                    {editMode ? (
                      <Input type="date" value={editDraft.dueDate} onChange={e => handleInputChange('dueDate', e.target.value)} className="w-full border border-emerald-200 rounded-lg px-3 py-2 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm" />
                    ) : (
                      <p className="text-sm font-semibold bg-emerald-50/50 rounded-lg px-3 py-2">{design.dueDate}</p>
                    )}
                  </div>
                  {design.completionDate && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-emerald-700">Completion Date</label>
                      {editMode ? (
                        <Input type="date" value={editDraft.completionDate || ''} onChange={e => handleInputChange('completionDate', e.target.value)} className="w-full border border-emerald-200 rounded-lg px-3 py-2 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm" />
                      ) : (
                        <p className="text-sm font-semibold text-green-600 bg-green-50/50 rounded-lg px-3 py-2">{design.completionDate}</p>
                      )}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-emerald-700">Description</label>
                    {editMode ? (
                      <Textarea value={editDraft.description} onChange={e => handleInputChange('description', e.target.value)} className="w-full border border-emerald-200 rounded-lg px-3 py-2 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm" rows={3} />
                    ) : (
                      <p className="text-sm text-gray-700 bg-emerald-50/50 rounded-lg px-3 py-2">{design.description}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-emerald-700">Inspiration</label>
                    {editMode ? (
                      <Textarea value={editDraft.inspiration} onChange={e => handleInputChange('inspiration', e.target.value)} className="w-full border border-emerald-200 rounded-lg px-3 py-2 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm" rows={3} />
                    ) : (
                      <p className="text-sm text-gray-700 bg-emerald-50/50 rounded-lg px-3 py-2">{design.inspiration}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-emerald-700">Notes</label>
                    {editMode ? (
                      <Textarea value={editDraft.notes} onChange={e => handleInputChange('notes', e.target.value)} className="w-full border border-emerald-200 rounded-lg px-3 py-2 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm" rows={3} />
                    ) : (
                      <p className="text-sm text-gray-700 bg-emerald-50/50 rounded-lg px-3 py-2">{design.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={`${getStatusColor(design.status)} rounded-lg px-3 py-1 text-xs font-semibold`}>
                    {design.status.replace('-', ' ')}
                  </Badge>
                  <Badge className={`${getPriorityColor(design.priority)} rounded-lg px-3 py-1 text-xs font-semibold`}>
                    {design.priority} Priority
                  </Badge>
                  {design.quoteNumber && (
                    <Badge className="bg-blue-100 text-blue-800 rounded-lg px-3 py-1 text-xs font-semibold">
                      Quote: {design.quoteNumber}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Materials & Specifications */}
            <Card className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 border-b border-emerald-100/50 p-4">
                <CardTitle className="flex items-center gap-2 text-emerald-700 text-xl font-bold">
                  <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-lg shadow-lg">
                    <Gem className="h-5 w-5 text-white" />
                  </div>
                  Materials & Specifications
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-emerald-700">Materials</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center bg-emerald-50/50 rounded-lg px-3 py-2">
                        <span className="font-medium text-emerald-700">Metal:</span> 
                        {editMode ? (
                          <Input value={editDraft.materials.metal} onChange={e => setEditDraft({...editDraft, materials: {...editDraft.materials, metal: e.target.value}})} className="w-32 border border-emerald-200 rounded-lg px-2 py-1 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm" />
                        ) : (
                          <span className="text-sm font-semibold text-emerald-800">{design.materials.metal}</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center bg-emerald-50/50 rounded-lg px-3 py-2">
                        <span className="font-medium text-emerald-700">Center Stone:</span> 
                        {editMode ? (
                          <Input value={editDraft.materials.centerStone} onChange={e => setEditDraft({...editDraft, materials: {...editDraft.materials, centerStone: e.target.value}})} className="w-32 border border-emerald-200 rounded-lg px-2 py-1 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm" />
                        ) : (
                          <span className="text-sm font-semibold text-emerald-800">{design.materials.centerStone}</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center bg-emerald-50/50 rounded-lg px-3 py-2">
                        <span className="font-medium text-emerald-700">Accent Stones:</span> 
                        {editMode ? (
                          <Input value={editDraft.materials.accentStones} onChange={e => setEditDraft({...editDraft, materials: {...editDraft.materials, accentStones: e.target.value}})} className="w-32 border border-emerald-200 rounded-lg px-2 py-1 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm" />
                        ) : (
                          <span className="text-sm font-semibold text-emerald-800">{design.materials.accentStones}</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center bg-emerald-50/50 rounded-lg px-3 py-2">
                        <span className="font-medium text-emerald-700">Carat Weight:</span> 
                        {editMode ? (
                          <Input type="number" value={editDraft.materials.caratWeight} onChange={e => setEditDraft({...editDraft, materials: {...editDraft.materials, caratWeight: e.target.value}})} className="w-32 border border-emerald-200 rounded-lg px-2 py-1 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm" />
                        ) : (
                          <span className="text-sm font-semibold text-emerald-800">{`${design.materials.caratWeight}ct`}</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center bg-emerald-50/50 rounded-lg px-3 py-2">
                        <span className="font-medium text-emerald-700">Clarity:</span> 
                        {editMode ? (
                          <Input value={editDraft.materials.clarity} onChange={e => setEditDraft({...editDraft, materials: {...editDraft.materials, clarity: e.target.value}})} className="w-32 border border-emerald-200 rounded-lg px-2 py-1 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm" />
                        ) : (
                          <span className="text-sm font-semibold text-emerald-800">{design.materials.clarity}</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center bg-emerald-50/50 rounded-lg px-3 py-2">
                        <span className="font-medium text-emerald-700">Color:</span> 
                        {editMode ? (
                          <Input value={editDraft.materials.color} onChange={e => setEditDraft({...editDraft, materials: {...editDraft.materials, color: e.target.value}})} className="w-32 border border-emerald-200 rounded-lg px-2 py-1 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm" />
                        ) : (
                          <span className="text-sm font-semibold text-emerald-800">{design.materials.color}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-emerald-700">Specifications</h4>
                    <div className="space-y-2">
                      { 'ringSize' in editDraft.specifications && (
                        <div className="flex justify-between items-center bg-emerald-50/50 rounded-lg px-3 py-2">
                          <span className="font-medium text-emerald-700">Ring Size:</span> 
                          {editMode ? (
                            <Input value={editDraft.specifications.ringSize} onChange={e => setEditDraft({...editDraft, specifications: {...editDraft.specifications, ringSize: e.target.value}})} className="w-32 border border-emerald-200 rounded-lg px-2 py-1 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm" />
                          ) : (
                            <span className="text-sm font-semibold text-emerald-800">{design.specifications.ringSize}</span>
                          )}
                        </div>
                      )}
                      { 'bandWidth' in editDraft.specifications && (
                        <div className="flex justify-between items-center bg-emerald-50/50 rounded-lg px-3 py-2">
                          <span className="font-medium text-emerald-700">Band Width:</span> 
                          {editMode ? (
                            <Input value={editDraft.specifications.bandWidth} onChange={e => setEditDraft({...editDraft, specifications: {...editDraft.specifications, bandWidth: e.target.value}})} className="w-32 border border-emerald-200 rounded-lg px-2 py-1 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm" />
                          ) : (
                            <span className="text-sm font-semibold text-emerald-800">{design.specifications.bandWidth}</span>
                          )}
                        </div>
                      )}
                      { 'length' in editDraft.specifications && (
                        <div className="flex justify-between items-center bg-emerald-50/50 rounded-lg px-3 py-2">
                          <span className="font-medium text-emerald-700">Length:</span> 
                          {editMode ? (
                            <Input value={editDraft.specifications.length} onChange={e => setEditDraft({...editDraft, specifications: {...editDraft.specifications, length: e.target.value}})} className="w-32 border border-emerald-200 rounded-lg px-2 py-1 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm" />
                          ) : (
                            <span className="text-sm font-semibold text-emerald-800">{design.specifications.length}</span>
                          )}
                        </div>
                      )}
                      { 'width' in editDraft.specifications && (
                        <div className="flex justify-between items-center bg-emerald-50/50 rounded-lg px-3 py-2">
                          <span className="font-medium text-emerald-700">Width:</span> 
                          {editMode ? (
                            <Input value={editDraft.specifications.width} onChange={e => setEditDraft({...editDraft, specifications: {...editDraft.specifications, width: e.target.value}})} className="w-32 border border-emerald-200 rounded-lg px-2 py-1 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm" />
                          ) : (
                            <span className="text-sm font-semibold text-emerald-800">{design.specifications.width}</span>
                          )}
                        </div>
                      )}
                      { 'setting' in editDraft.specifications && (
                        <div className="flex justify-between items-center bg-emerald-50/50 rounded-lg px-3 py-2">
                          <span className="font-medium text-emerald-700">Setting:</span> 
                          {editMode ? (
                            <Input value={editDraft.specifications.setting} onChange={e => setEditDraft({...editDraft, specifications: {...editDraft.specifications, setting: e.target.value}})} className="w-32 border border-emerald-200 rounded-lg px-2 py-1 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm" />
                          ) : (
                            <span className="text-sm font-semibold text-emerald-800">{design.specifications.setting}</span>
                          )}
                        </div>
                      )}
                      { 'finish' in editDraft.specifications && (
                        <div className="flex justify-between items-center bg-emerald-50/50 rounded-lg px-3 py-2">
                          <span className="font-medium text-emerald-700">Finish:</span> 
                          {editMode ? (
                            <Input value={editDraft.specifications.finish} onChange={e => setEditDraft({...editDraft, specifications: {...editDraft.specifications, finish: e.target.value}})} className="w-32 border border-emerald-200 rounded-lg px-2 py-1 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm" />
                          ) : (
                            <span className="text-sm font-semibold text-emerald-800">{design.specifications.finish}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Budget */}
            <Card className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100/50 p-4">
                <CardTitle className="flex items-center gap-2 text-emerald-700 text-xl font-bold">
                  <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg shadow-lg">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                  Budget Range
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Minimum</div>
                    {editMode ? (
                      <Input type="number" value={editDraft.budget.min} onChange={e => setEditDraft({...editDraft, budget: {...editDraft.budget, min: Number(e.target.value)}})} className="w-full border border-emerald-200 rounded-lg px-3 py-2 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm" />
                    ) : (
                      <div className="text-lg font-semibold text-emerald-800 bg-emerald-50/50 rounded-lg px-3 py-2">${design.budget.min.toLocaleString()}</div>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Target</div>
                    {editMode ? (
                      <Input type="number" value={editDraft.budget.target} onChange={e => setEditDraft({...editDraft, budget: {...editDraft.budget, target: Number(e.target.value)}})} className="w-full border border-emerald-200 rounded-lg px-3 py-2 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm" />
                    ) : (
                      <div className="text-xl font-bold text-emerald-600 bg-emerald-50/50 rounded-lg px-3 py-2">${design.budget.target.toLocaleString()}</div>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Maximum</div>
                    {editMode ? (
                      <Input type="number" value={editDraft.budget.max} onChange={e => setEditDraft({...editDraft, budget: {...editDraft.budget, max: Number(e.target.value)}})} className="w-full border border-emerald-200 rounded-lg px-3 py-2 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm" />
                    ) : (
                      <div className="text-lg font-semibold text-emerald-800 bg-emerald-50/50 rounded-lg px-3 py-2">${design.budget.max.toLocaleString()}</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Call Log Attachments */}
            <Card className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 border-b border-emerald-100/50 p-4">
                <CardTitle className="flex items-center gap-2 text-emerald-700 text-xl font-bold">
                  <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-lg shadow-lg">
                    <Upload className="h-5 w-5 text-white" />
                  </div>
                  Call Log Attachments
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {(design.files || []).length > 0 ? (
                    (design.files || []).map((file: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-blue-50/50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <div>
                            <div className="font-medium text-blue-800">{file.name}</div>
                            <div className="text-xs text-blue-600">From Call Log</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-blue-600 hover:bg-blue-100 rounded-lg"
                            onClick={() => {
                              if (file.url) {
                                window.open(file.url, '_blank');
                              } else if (file.data) {
                                // Handle base64 data
                                const link = document.createElement('a');
                                link.href = file.data;
                                link.download = file.name;
                                link.click();
                              }
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">No attachments from call log</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* CAD Files & Renderings */}
            <Card className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100/50 p-4">
                <CardTitle className="flex items-center gap-2 text-emerald-700 text-xl font-bold">
                  <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg shadow-lg">
                    <FileImage className="h-5 w-5 text-white" />
                  </div>
                  CAD Files & Renderings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-emerald-700">CAD Files</h4>
                    <div className="space-y-2">
                      {(design.cadFiles || []).map((file: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-emerald-600" />
                            <span className="font-medium text-emerald-800">{file.name}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="text-emerald-600 hover:bg-emerald-100 rounded-lg">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button size="sm" variant="outline" className="text-emerald-600 hover:bg-emerald-100 rounded-lg">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-emerald-700">Renderings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(design.renderings || []).map((rendering: any, index: number) => (
                        <div key={index} className="border rounded-lg overflow-hidden bg-gray-50/50 backdrop-blur-sm">
                          <div className="h-32 bg-gray-100 flex items-center justify-center rounded-t-lg">
                            <ImageIcon className="h-8 w-8 text-gray-400" />
                          </div>
                          <div className="p-3">
                            <div className="font-medium text-sm text-emerald-800">{rendering.name}</div>
                            <div className="text-xs text-gray-500 text-emerald-600">{rendering.type}</div>
                            <div className="flex gap-2 mt-2">
                              <Button size="sm" variant="outline" className="text-emerald-600 hover:bg-emerald-100 rounded-lg flex-1">
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              <Button size="sm" variant="outline" className="text-emerald-600 hover:bg-emerald-100 rounded-lg flex-1">
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Final Attachments */}
            <Card className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-purple-50 border-b border-emerald-100/50 p-4">
                <CardTitle className="flex items-center gap-2 text-emerald-700 text-xl font-bold">
                  <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-purple-500 rounded-lg shadow-lg">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  Final Attachments
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="text-sm text-gray-600 mb-3">
                    Add final attachments that will be included when this design moves to the quotes stage.
                  </div>
                  <div className="space-y-3">
                    {(design.finalAttachments || []).length > 0 ? (
                      (design.finalAttachments || []).map((file: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-purple-50/50 rounded-lg border border-purple-200">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-purple-600" />
                            <div>
                              <div className="font-medium text-purple-800">{file.name}</div>
                              <div className="text-xs text-purple-600">Final Attachment</div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-purple-600 hover:bg-purple-100 rounded-lg"
                              onClick={() => {
                                if (file.url) {
                                  window.open(file.url, '_blank');
                                } else if (file.data) {
                                  const link = document.createElement('a');
                                  link.href = file.data;
                                  link.download = file.name;
                                  link.click();
                                }
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-purple-600 hover:bg-purple-100 rounded-lg"
                              onClick={() => {
                                if (file.url) {
                                  const link = document.createElement('a');
                                  link.href = file.url;
                                  link.download = file.name;
                                  link.click();
                                } else if (file.data) {
                                  const link = document.createElement('a');
                                  link.href = file.data;
                                  link.download = file.name;
                                  link.click();
                                }
                              }}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-600 hover:bg-red-100 rounded-lg"
                              onClick={() => {
                                // Remove file from finalAttachments
                                const updatedAttachments = (design.finalAttachments || []).filter((_: any, i: number) => i !== index);
                                setDesign({...design, finalAttachments: updatedAttachments});
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">No final attachments added yet</p>
                      </div>
                    )}
                  </div>
                  <div className="border-2 border-dashed border-purple-200 rounded-lg p-4 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-purple-400" />
                    <p className="text-sm text-purple-600 mb-2">Add final attachments for quotes</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-purple-600 hover:bg-purple-100 rounded-lg"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.multiple = true;
                        input.onchange = (e) => {
                          const files = Array.from((e.target as HTMLInputElement).files || []);
                          const newAttachments = files.map(file => ({
                            name: file.name,
                            type: file.type,
                            size: file.size,
                            data: URL.createObjectURL(file),
                            uploaded_at: new Date().toISOString()
                          }));
                          setDesign({
                            ...design, 
                            finalAttachments: [...(design.finalAttachments || []), ...newAttachments]
                          });
                        };
                        input.click();
                      }}
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Upload Files
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Feedback */}
            <Card className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100/50 p-4">
                <CardTitle className="flex items-center gap-2 text-emerald-700 text-xl font-bold">
                  <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg shadow-lg">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  Client Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {(design.clientFeedback || []).map((feedback: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4 bg-emerald-50/50 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-emerald-800">{feedback.date}</span>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        </div>
                        <Badge className={`${feedback.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} rounded-lg px-3 py-1 text-xs font-semibold`}>
                          {feedback.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 bg-emerald-50/50 rounded-lg px-3 py-2">{feedback.feedback}</p>
                    </div>
                  ))}
                  <Button onClick={() => setShowFeedbackModal(true)} variant="outline" className="w-full text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs px-3 py-1">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Add Client Feedback
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Revisions */}
            <Card className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100/50 p-4">
                <CardTitle className="flex items-center gap-2 text-emerald-700 text-xl font-bold">
                  <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg shadow-lg">
                    <Edit3 className="h-5 w-5 text-white" />
                  </div>
                  Design Revisions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {(design.revisions || []).map((revision: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4 bg-emerald-50/50 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-emerald-800">Version {revision.version}</div>
                        <div className="text-sm text-gray-500 text-emerald-600">{revision.date}</div>
                      </div>
                      <p className="text-sm text-gray-700 bg-emerald-50/50 rounded-lg px-3 py-2 mb-2">{revision.changes}</p>
                      <div className="text-sm text-gray-500 text-emerald-600">By: {revision.designer}</div>
                    </div>
                  ))}
                  <Button onClick={() => setShowRevisionModal(true)} variant="outline" className="w-full text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs px-3 py-1">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Add Revision
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Status Management */}
            <Card className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100/50 p-4">
                <CardTitle className="text-emerald-700 text-xl font-bold">Status Management</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-emerald-700">Current Status</label>
                  <select 
                    className="w-full border border-emerald-200 rounded-lg px-3 py-2 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm"
                    value={design.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="on-hold">On Hold</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-emerald-700">Priority</label>
                  <select 
                    className="w-full border border-emerald-200 rounded-lg px-3 py-2 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm"
                    value={design.priority}
                    onChange={(e) => setDesign({...design, priority: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </CardContent>
            </Card>
            {/* Quick Actions */}
            <Card className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100/50 p-4">
                <CardTitle className="text-emerald-700 text-xl font-bold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <Button className="w-full text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs px-3 py-1" variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload CAD File
                </Button>
                <Button className="w-full text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs px-3 py-1" variant="outline">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Upload Rendering
                </Button>
                <Button className="w-full text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs px-3 py-1" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send to Client
                </Button>
                <Button className="w-full text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs px-3 py-1" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Request Changes
                </Button>
                <Link href="/dashboard/designs/status">
                  <Button className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-lg shadow-lg text-xs px-3 py-1" variant="default" disabled={design.status === 'completed'}>
                    Confirm Design
                  </Button>
                </Link>
                <Button className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-lg shadow-lg text-xs px-3 py-1" variant="default" disabled={!!design.quoteNumber} onClick={() => setShowSendQuoteModal(true)}>
                  Send Quote
                </Button>
              </CardContent>
            </Card>
            {/* Related Records */}
            <Card className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100/50 p-4">
                <CardTitle className="text-emerald-700 text-xl font-bold">Related Records</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-emerald-600">Call Log</span>
                  </div>
                  <Link href={`/dashboard/call-log/${design.callLogId}`}>
                    <Button size="sm" variant="outline" className="text-blue-600 hover:bg-blue-100 rounded-lg text-xs px-3 py-1">{design.callLogId}</Button>
                  </Link>
                </div>
                {design.quoteNumber && (
                  <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-emerald-600">Quote</span>
                    </div>
                    <Link href={`/dashboard/quotes/${design.quoteNumber}`}>
                      <Button size="sm" variant="outline" className="text-yellow-600 hover:bg-yellow-100 rounded-lg text-xs px-3 py-1">{design.quoteNumber}</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-emerald-700">Add Client Feedback</h3>
            <Textarea
              placeholder="Enter client feedback..."
              value={newFeedback}
              onChange={(e) => setNewFeedback(e.target.value)}
              className="mb-4 border border-emerald-200 rounded-lg px-3 py-2 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm"
              rows={4}
            />
            <div className="flex gap-2">
              <Button onClick={handleAddFeedback} className="flex-1 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs px-3 py-1">Add Feedback</Button>
              <Button onClick={() => setShowFeedbackModal(false)} variant="outline" className="text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs px-3 py-1">Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Revision Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-emerald-700">Add Revision</h3>
            <Textarea
              placeholder="Describe the changes made..."
              value={newRevision}
              onChange={(e) => setNewRevision(e.target.value)}
              className="mb-4 border border-emerald-200 rounded-lg px-3 py-2 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm"
              rows={4}
            />
            <div className="flex gap-2">
              <Button onClick={handleAddRevision} className="flex-1 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs px-3 py-1">Add Revision</Button>
              <Button onClick={() => setShowRevisionModal(false)} variant="outline" className="text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs px-3 py-1">Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Send Quote Modal */}
      {showSendQuoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-xl font-bold mb-2 text-emerald-800">Send Quote to {design.customer}</h3>
            <p className="mb-2 text-gray-600">Review and personalize the message before sending to the customer.</p>
            <textarea
              className="w-full border border-emerald-200 rounded-lg px-3 py-2 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm"
              value={quoteMessage}
              onChange={e => setQuoteMessage(e.target.value)}
              disabled={aiLoading}
            />
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Attachment (optional):</label>
              <input
                type="file"
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                onChange={e => setAttachment(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                disabled={aiLoading}
              />
              {attachment && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-700">{attachment.name}</span>
                  <Button size="sm" variant="ghost" onClick={() => setAttachment(null)} disabled={aiLoading} className="text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs px-3 py-1">Remove</Button>
                </div>
              )}
            </div>
            <div className="flex gap-2 mb-3">
              <Button variant="outline" onClick={handleRegenerateAI} disabled={aiLoading} className="text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs px-3 py-1">
                {aiLoading ? 'Regenerating...' : 'Regenerate with AI'}
              </Button>
              <Button variant="ghost" onClick={() => setQuoteMessage('')} disabled={aiLoading} className="text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs px-3 py-1">Clear</Button>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowSendQuoteModal(false)} disabled={aiLoading} className="text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs px-3 py-1">Cancel</Button>
              <Button className="bg-emerald-600 text-white rounded-lg shadow-lg text-xs px-3 py-1" onClick={() => { setShowSendQuoteModal(false); /* Add send logic here, include attachment */ }} disabled={aiLoading}>Send</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 