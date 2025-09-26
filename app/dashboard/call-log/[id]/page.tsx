"use client";
import React, { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Phone, 
  User, 
  FileText, 
  DollarSign, 
  Package, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Info,
  Edit,
  Printer,
  MoreHorizontal,
  Sparkles,
  Calendar,
  Clock,
  MessageSquare,
  Users,
  Mail,
  CalendarPlus,
  Paperclip,
  Trash2,
  Eye,
  Play,
  FileAudio,
  FileText as FileTextIcon,
  ChevronDown,
  Search
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { ShoppingCart, CalendarPlus as CalendarPlusIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Simplified mock data
const mockCallLogDetails = {
  'CL-2024-0001': {
    callLogId: 'CL-2024-0001',
    customer: 'Sophia Chen',
    customerId: 'C-1001',
    callType: 'Consultation',
    staff: 'Daniel Sutton',
    callDuration: '45 minutes',
    callOutcome: 'Interested',
    notes: 'Discussed custom engagement ring. Client is interested in a 2-carat diamond with platinum setting. Budget range: $15,000-$25,000. Timeline: 3-4 months for engagement.',
    followUpDate: '2024-07-08 10:00',
    fileAttachment: 'call-recording-CL-2024-0001.mp3',
    additionalNotes: 'Client prefers platinum over gold. Wants a unique design.',
    clientEmail: 'sophia.chen@email.com',
    clientPhone: '+1 (555) 123-4567',
    purpose: 'Consultation',
    date: '2024-07-01',
    time: '14:30',
    sentiment: 'positive',
    designId: 'DS-2024-0001',
    quoteNumber: 'Q-2024-0001',
    orderNumber: 'O-2024-0001',
    status: 'completed'
  },
  'CL-2024-0002': {
    callLogId: 'CL-2024-0002',
    customer: 'Ethan Davis',
    customerId: 'C-1002',
    callType: 'Inquiry',
    staff: 'Sarah Lee',
    callDuration: '20 minutes',
    callOutcome: 'Requested Info',
    notes: 'Asked about sapphire pendant. Client was browsing online and saw our sapphire collection. Interested in a 3-carat blue sapphire pendant with white gold setting.',
    followUpDate: '',
    fileAttachment: '',
    additionalNotes: '',
    clientEmail: 'ethan.davis@email.com',
    clientPhone: '+1 (555) 234-5678',
    purpose: 'Inquiry',
    date: '2024-07-02',
    time: '10:15',
    sentiment: 'neutral',
    designId: '',
    quoteNumber: '',
    orderNumber: '',
    status: 'completed'
  },
  'CL-2024-0003': {
    callLogId: 'CL-2024-0003',
    customer: 'Ava Martinez',
    customerId: 'C-1003',
    callType: 'Design Request',
    staff: 'David Chen',
    callDuration: '60 minutes',
    callOutcome: 'Design in Progress',
    notes: 'Requested custom bracelet design. Client wants a tennis bracelet with alternating diamonds and emeralds. 18k white gold setting. Budget: $12,000-$18,000.',
    followUpDate: '2024-07-10 15:00',
    fileAttachment: '',
    additionalNotes: 'Client provided inspiration photos.',
    clientEmail: 'ava.martinez@email.com',
    clientPhone: '+1 (555) 345-6789',
    purpose: 'Design Request',
    date: '2024-07-03',
    time: '16:45',
    sentiment: 'positive',
    designId: 'DS-2024-0002',
    quoteNumber: '',
    orderNumber: '',
    status: 'in-progress'
  }
};

export default function CallLogDetailPage() {
  const params = useParams();
  const callLogId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [callLog, setCallLog] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [editDraft, setEditDraft] = useState<any>(null);
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [datedNotes, setDatedNotes] = useState<any[]>([]);
  
  // Staff dropdown state
  const [staffSearch, setStaffSearch] = useState('');
  const [showStaffDropdown, setShowStaffDropdown] = useState(false);
  const [staffResults, setStaffResults] = useState<any[]>([]);
  const [staffSearchLoading, setStaffSearchLoading] = useState(false);
  const staffDropdownRef = useRef<HTMLDivElement>(null);

  // Customer dropdown state
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [customerResults, setCustomerResults] = useState<any[]>([]);
  const [customerSearchLoading, setCustomerSearchLoading] = useState(false);
  const customerDropdownRef = useRef<HTMLDivElement>(null);

  // Predefined staff list
  const staffList = [
    { id: 'daniel-sutton', full_name: 'Daniel Sutton', email: 'daniel@jewelia.com', role: 'admin' },
    { id: 'sarah-johnson', full_name: 'Sarah Johnson', email: 'sarah@jewelia.com', role: 'staff' },
    { id: 'david-chen', full_name: 'David Chen', email: 'david@jewelia.com', role: 'staff' },
    { id: 'emily-rodriguez', full_name: 'Emily Rodriguez', email: 'emily@jewelia.com', role: 'manager' },
    { id: 'michael-thompson', full_name: 'Michael Thompson', email: 'michael@jewelia.com', role: 'staff' },
    { id: 'lisa-wang', full_name: 'Lisa Wang', email: 'lisa@jewelia.com', role: 'staff' },
    { id: 'james-wilson', full_name: 'James Wilson', email: 'james@jewelia.com', role: 'manager' },
    { id: 'amanda-davis', full_name: 'Amanda Davis', email: 'amanda@jewelia.com', role: 'staff' }
  ];

  // Predefined customer list
  const customerList = [
    { id: 'C-1001', full_name: 'Sophia Chen', email: 'sophia.chen@email.com', phone: '+1 (555) 123-4567', company: 'Chen Enterprises' },
    { id: 'C-1002', full_name: 'Ethan Davis', email: 'ethan.davis@email.com', phone: '+1 (555) 234-5678', company: 'Davis & Associates' },
    { id: 'C-1003', full_name: 'Ava Martinez', email: 'ava.martinez@email.com', phone: '+1 (555) 345-6789', company: 'Martinez Designs' },
    { id: 'C-1004', full_name: 'Liam Johnson', email: 'liam.johnson@email.com', phone: '+1 (555) 456-7890', company: 'Johnson Corp' },
    { id: 'C-1005', full_name: 'Isabella Rodriguez', email: 'isabella.rodriguez@email.com', phone: '+1 (555) 567-8901', company: 'Rodriguez Group' },
    { id: 'C-1006', full_name: 'Noah Thompson', email: 'noah.thompson@email.com', phone: '+1 (555) 678-9012', company: 'Thompson Industries' },
    { id: 'C-1007', full_name: 'Emma Wilson', email: 'emma.wilson@email.com', phone: '+1 (555) 789-0123', company: 'Wilson Solutions' },
    { id: 'C-1008', full_name: 'Oliver Brown', email: 'oliver.brown@email.com', phone: '+1 (555) 890-1234', company: 'Brown & Co' },
    { id: 'C-1009', full_name: 'Mia Garcia', email: 'mia.garcia@email.com', phone: '+1 (555) 901-2345', company: 'Garcia Enterprises' },
    { id: 'C-1010', full_name: 'William Taylor', email: 'william.taylor@email.com', phone: '+1 (555) 012-3456', company: 'Taylor Holdings' }
  ];

  // Check for edit query parameter
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const editParam = urlParams.get('edit');
      if (editParam === 'true') {
        setEditMode(true);
      }
    }
  }, []);

  // Fetch call log data from API
  React.useEffect(() => {
    const fetchCallLog = async () => {
      try {
        setLoading(true);
        
        // Extract the actual UUID from the call number format
        // If the ID is in format CL-2025-823c3c62-4045-4096-b04d-43f332c8a286, extract the UUID part
        let actualId = callLogId;
        if (callLogId.startsWith('CL-') && callLogId.includes('-')) {
          // Remove the "CL-" prefix and extract the UUID (everything after the year)
          const withoutPrefix = callLogId.substring(3); // Remove "CL-"
          const parts = withoutPrefix.split('-');
          if (parts.length >= 5) {
            // Skip the year (first part) and take the rest as UUID
            // Format: 2025-823c3c62-4045-4096-b04d-43f332c8a286
            // We want: 823c3c62-4045-4096-b04d-43f332c8a286
            actualId = parts.slice(1).join('-');
          }
        }
        
        console.log('Original callLogId:', callLogId);
        console.log('Extracted actualId:', actualId);
        
        const response = await fetch(`/api/call-log/${actualId}`);
        const result = await response.json();
        
        if (result.success && result.data) {
          const logData = result.data;
          
          // Extract design ID from notes if the call log has been sent to design
          let designId = '';
          if (logData.status === 'design_created' && logData.notes) {
            const designIdMatch = logData.notes.match(/Design ID: (DS-\d{4}-[a-z0-9]+)/);
            designId = designIdMatch ? designIdMatch[1] : '';
          }
          
          const transformedLog = {
            callLogId: callLogId,
            customer: logData.customer_name,
            customerId: logData.customer_id,
            callType: logData.call_type,
            staff: logData.staff_name,
            callDuration: logData.duration,
            callOutcome: logData.outcome,
            notes: logData.notes,
            followUpDate: logData.follow_up_date,
            fileAttachment: '',
            files: logData.files || [],
            additionalNotes: logData.summary,
            clientEmail: '',
            clientPhone: '',
            purpose: logData.call_type,
            date: new Date(logData.created_at).toLocaleDateString(),
            time: new Date(logData.created_at).toLocaleTimeString(),
            sentiment: 'positive',
            designId: designId,
            quoteNumber: '',
            orderNumber: '',
            status: logData.status
          };
          setCallLog(transformedLog);
          setEditDraft(transformedLog);
        } else {
          console.error('Failed to fetch call log:', result.error);
          setCallLog(null);
        }
      } catch (error) {
        console.error('Error fetching call log:', error);
        setCallLog(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCallLog();
  }, [callLogId]);

  // Staff search functionality
  useEffect(() => {
    if (staffSearch.trim()) {
      setStaffSearchLoading(true);
      // Filter staff based on search term
      const filteredStaff = staffList.filter(staff => 
        staff.full_name.toLowerCase().includes(staffSearch.toLowerCase()) ||
        staff.email.toLowerCase().includes(staffSearch.toLowerCase())
      );
      setStaffResults(filteredStaff);
      setShowStaffDropdown(true);
      setStaffSearchLoading(false);
      
      // Update editDraft with the current search value
      setEditDraft((prev: any) => ({ ...prev, staff: staffSearch }));
    } else {
      setStaffResults([]);
      setShowStaffDropdown(false);
      // Clear staff in editDraft if search is empty
      setEditDraft((prev: any) => ({ ...prev, staff: '' }));
    }
  }, [staffSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (staffDropdownRef.current && !staffDropdownRef.current.contains(event.target as Node)) {
        setShowStaffDropdown(false);
      }
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
        setShowCustomerDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Customer search functionality
  useEffect(() => {
    if (customerSearch.trim()) {
      setCustomerSearchLoading(true);
      // Filter customers based on search term
      const filteredCustomers = customerList.filter(customer => 
        customer.full_name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        customer.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
        customer.id.toLowerCase().includes(customerSearch.toLowerCase()) ||
        customer.company.toLowerCase().includes(customerSearch.toLowerCase())
      );
      setCustomerResults(filteredCustomers);
      setShowCustomerDropdown(true);
      setCustomerSearchLoading(false);
      
      // Update editDraft with the current search value
      setEditDraft((prev: any) => ({ ...prev, customer: customerSearch }));
    } else {
      setCustomerResults([]);
      setShowCustomerDropdown(false);
      // Clear customer in editDraft if search is empty
      setEditDraft((prev: any) => ({ ...prev, customer: '' }));
    }
  }, [customerSearch]);

  const getActualId = (callLogId: string) => {
    let actualId = callLogId;
    if (callLogId.startsWith('CL-') && callLogId.includes('-')) {
      const withoutPrefix = callLogId.substring(3);
      const parts = withoutPrefix.split('-');
      if (parts.length >= 5) {
        actualId = parts.slice(1).join('-');
      }
    }
    return actualId;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-10 px-2 md:px-0">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard/call-log">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Call Log
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mr-2"></div>
              Loading call log...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If call log not found, show error
  if (!callLog) {
    return (
      <div className="max-w-6xl mx-auto py-10 px-2 md:px-0">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard/call-log">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Call Log
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Call Log Not Found</h2>
            <p className="text-gray-600">The call log with ID "{callLogId}" could not be found.</p>
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
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'negative': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  // Helper function to get file type icon and determine if file is viewable
  const getFileTypeInfo = (file: any) => {
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();
    
    // Audio files
    if (fileType.startsWith('audio/') || fileName.includes('.mp3') || fileName.includes('.wav') || fileName.includes('.m4a')) {
      return {
        icon: <FileAudio className="h-5 w-5 text-white" />,
        isViewable: true,
        viewType: 'audio'
      };
    }
    
    // PDF files
    if (fileType === 'application/pdf' || fileName.includes('.pdf')) {
      return {
        icon: <FileTextIcon className="h-5 w-5 text-white" />,
        isViewable: true,
        viewType: 'pdf'
      };
    }
    
    // Image files
    if (fileType.startsWith('image/') || fileName.includes('.jpg') || fileName.includes('.jpeg') || fileName.includes('.png') || fileName.includes('.gif')) {
      return {
        icon: <Eye className="h-5 w-5 text-white" />,
        isViewable: true,
        viewType: 'image'
      };
    }
    
    // Default
    return {
      icon: <Paperclip className="h-5 w-5 text-white" />,
      isViewable: false,
      viewType: 'download'
    };
  };

  const handleEdit = () => {
    setEditDraft(callLog);
    setStaffSearch(callLog.staff || '');
    setCustomerSearch(callLog.customer || '');
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditDraft(callLog);
    setStaffSearch('');
    setCustomerSearch('');
    setShowStaffDropdown(false);
    setShowCustomerDropdown(false);
    setEditMode(false);
    setFileInput(null);
  };

  const handleSave = async () => {
    if (!editDraft || !callLog) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('customer', editDraft.customer || '');
      formData.append('callType', editDraft.callType || '');
      formData.append('staff', editDraft.staff || '');
      formData.append('callDuration', editDraft.callDuration || '');
      formData.append('callOutcome', editDraft.callOutcome || '');
      formData.append('notes', editDraft.notes || '');
      formData.append('additionalNotes', editDraft.additionalNotes || '');
      formData.append('followUpDate', editDraft.followUpDate || '');
      if (fileInput) {
        formData.append('fileAttachment', fileInput);
      }
      // Use the correct actualId for the API call
      const actualId = getActualId(callLogId);
      const response = await fetch(`/api/call-log/${actualId}`, {
        method: 'PUT',
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        setCallLog(result.data);
        setEditMode(false);
        setFileInput(null);
        toast.success('Call log updated successfully!');
      } else {
        toast.error(result.error || 'Failed to update call log');
      }
    } catch (error) {
      console.error('Error saving call log:', error);
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setEditDraft({ ...editDraft, [field]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileInput(e.target.files[0]);
      setEditDraft({ ...editDraft, fileAttachment: e.target.files[0].name });
    }
  };

  const handleStaffSelect = (staff: any) => {
    setEditDraft({ ...editDraft, staff: staff.full_name });
    setStaffSearch(staff.full_name);
    setShowStaffDropdown(false);
  };

  const handleStaffInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && staffResults.length > 0) {
      e.preventDefault();
      handleStaffSelect(staffResults[0]);
    } else if (e.key === 'Escape') {
      setShowStaffDropdown(false);
    }
  };

  const handleCustomerSelect = (customer: any) => {
    setEditDraft({ ...editDraft, customer: customer.full_name, customerId: customer.id });
    setCustomerSearch(customer.full_name);
    setShowCustomerDropdown(false);
  };

  const handleCustomerInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && customerResults.length > 0) {
      e.preventDefault();
      handleCustomerSelect(customerResults[0]);
    } else if (e.key === 'Escape') {
      setShowCustomerDropdown(false);
    }
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
                <Link href="/dashboard/call-log">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 rounded-full shadow-lg">
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-green-700 bg-clip-text text-transparent tracking-tight">
                    Call Log Details
                  </h1>
                  <p className="text-emerald-600 text-sm font-medium">Call Log ID: <span className="text-emerald-800 font-semibold">{callLog.callLogId}</span></p>
                </div>
              </div>
              
              {/* Premium Quick Actions */}
              <div className="flex flex-col items-end gap-2 min-w-[180px]">
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 rounded-full shadow-lg"
                    onClick={() => toast.success("Exporting call log...")}
                  >
                    <FileText className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 rounded-full shadow-lg"
                    onClick={() => toast.success("Printing call log...")}
                  >
                    <Printer className="w-4 h-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 rounded-full shadow-lg">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl bg-white/95 border-emerald-200">
                      <DropdownMenuItem onClick={handleEdit} className="gap-2 cursor-pointer">
                        <Edit className="w-4 h-4" /> Edit Call Log
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.success("Follow-up call logged")} className="gap-2 cursor-pointer">
                        <CalendarPlus className="w-4 h-4" /> Log Follow-up
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.success("Converted to quote")} className="gap-2 cursor-pointer">
                        <FileText className="w-4 h-4" /> Convert to Quote
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.success("Order created")} className="gap-2 cursor-pointer">
                        <ShoppingCart className="w-4 h-4" /> Create Order
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
                      disabled={saving}
                      className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-lg shadow-lg text-xs px-3 py-1"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
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
                <CheckCircle className="w-5 h-5 mb-1 text-emerald-600" />
                <div className="text-lg font-extrabold text-emerald-900">{callLog.status}</div>
                <div className="text-xs font-medium text-emerald-700">Status</div>
              </CardContent>
            </Card>
            
            <Card className="w-40 flex flex-col items-center justify-center p-3 cursor-pointer border-2 shadow-lg rounded-xl bg-yellow-50/80 backdrop-blur-sm transition-all duration-300 hover:border-yellow-200 hover:scale-105">
              <CardContent className="flex flex-col items-center justify-center p-0">
                {getSentimentIcon(callLog.sentiment)}
                <div className="text-lg font-extrabold text-yellow-900 capitalize mt-1">{callLog.sentiment}</div>
                <div className="text-xs font-medium text-yellow-700">Sentiment</div>
              </CardContent>
            </Card>
            
            <Card className="w-40 flex flex-col items-center justify-center p-3 cursor-pointer border-2 shadow-lg rounded-xl bg-blue-50/80 backdrop-blur-sm transition-all duration-300 hover:border-blue-200 hover:scale-105">
              <CardContent className="flex flex-col items-center justify-center p-0">
                <Clock className="w-5 h-5 mb-1 text-blue-600" />
                <div className="text-lg font-extrabold text-blue-900">{callLog.callDuration}</div>
                <div className="text-xs font-medium text-blue-700">Duration</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Call Log Information */}
          <div className="lg:col-span-2 space-y-4">
            {/* Call Details Card */}
            <Card className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100/50 p-4">
                <CardTitle className="flex items-center gap-2 text-emerald-700 text-xl font-bold">
                  <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg shadow-lg">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  Call Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-emerald-700">Customer Name / ID</label>
                    {editMode ? (
                      <div className="relative">
                        <input 
                          type="text" 
                          className="w-full border border-emerald-200 rounded-lg px-3 py-2 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm" 
                          value={customerSearch} 
                          onChange={e => setCustomerSearch(e.target.value)} 
                          onKeyDown={handleCustomerInputKeyDown}
                          onClick={() => setShowCustomerDropdown(true)}
                          placeholder="Search customers..."
                        />
                        {showCustomerDropdown && (
                          <div 
                            ref={customerDropdownRef} 
                            className="absolute z-10 mt-1 w-full bg-white border border-emerald-200 rounded-lg shadow-xl max-h-60 overflow-y-auto"
                          >
                            {customerSearchLoading ? (
                              <div className="p-3 text-center text-emerald-600 flex items-center justify-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
                                Searching...
                              </div>
                            ) : customerResults.length === 0 ? (
                              <div className="p-3 text-center text-gray-500">
                                {customerSearch.trim() ? 'No customers found.' : 'Type to search customers...'}
                              </div>
                            ) : (
                              <>
                                {customerResults.map((customer, index) => (
                                  <div
                                    key={customer.id}
                                    className="p-3 cursor-pointer hover:bg-emerald-50 border-b border-gray-100 last:border-b-0 transition-colors"
                                    onClick={() => handleCustomerSelect(customer)}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                        {customer.full_name.split(' ').map((n: string) => n[0]).join('')}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium text-emerald-900 truncate">{customer.full_name}</div>
                                        <div className="text-xs text-emerald-600">{customer.id} • {customer.company}</div>
                                      </div>
                                      <div className="text-xs text-gray-400">{customer.email}</div>
                                    </div>
                                  </div>
                                ))}
                                <div className="p-2 text-xs text-gray-500 border-t border-gray-100 bg-gray-50">
                                  Click to select or continue typing to create new
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm font-semibold text-emerald-800 bg-emerald-50/50 rounded-lg px-3 py-2">{callLog.customer} <span className="text-emerald-600">({callLog.customerId})</span></p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-emerald-700">Call Type</label>
                    {editMode ? (
                      <Select value={editDraft.callType || ''} onValueChange={(value) => handleInputChange('callType', value)}>
                        <SelectTrigger className="w-full border border-emerald-200 rounded-lg px-3 py-2 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm">
                          <SelectValue placeholder="Select call type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inbound">Inbound</SelectItem>
                          <SelectItem value="outbound">Outbound</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm font-semibold bg-emerald-50/50 rounded-lg px-3 py-2">{callLog.callType || '—'}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-emerald-700">Staff Member</label>
                    {editMode ? (
                      <div className="relative">
                                                 <input 
                           type="text" 
                           className="w-full border border-emerald-200 rounded-lg px-3 py-2 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm" 
                           value={staffSearch} 
                           onChange={e => setStaffSearch(e.target.value)} 
                           onKeyDown={handleStaffInputKeyDown}
                           onClick={() => setShowStaffDropdown(true)}
                           placeholder="Search staff members..."
                         />
                                                 {showStaffDropdown && (
                           <div 
                             ref={staffDropdownRef} 
                             className="absolute z-10 mt-1 w-full bg-white border border-emerald-200 rounded-lg shadow-xl max-h-60 overflow-y-auto"
                           >
                             {staffSearchLoading ? (
                               <div className="p-3 text-center text-emerald-600 flex items-center justify-center gap-2">
                                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div>
                                 Searching...
                               </div>
                             ) : staffResults.length === 0 ? (
                               <div className="p-3 text-center text-gray-500">
                                 {staffSearch.trim() ? 'No staff found.' : 'Type to search staff members...'}
                               </div>
                             ) : (
                               <>
                                 {staffResults.map((staff, index) => (
                                   <div
                                     key={staff.id}
                                     className="p-3 cursor-pointer hover:bg-emerald-50 border-b border-gray-100 last:border-b-0 transition-colors"
                                     onClick={() => handleStaffSelect(staff)}
                                   >
                                     <div className="flex items-center gap-3">
                                       <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                         {staff.full_name.split(' ').map((n: string) => n[0]).join('')}
                                       </div>
                                       <div className="flex-1 min-w-0">
                                         <div className="font-medium text-emerald-900 truncate">{staff.full_name}</div>
                                         <div className="text-xs text-emerald-600 capitalize">{staff.role}</div>
                                       </div>
                                       <div className="text-xs text-gray-400">{staff.email}</div>
                                     </div>
                                   </div>
                                 ))}
                                 <div className="p-2 text-xs text-gray-500 border-t border-gray-100 bg-gray-50">
                                   Click to select or continue typing to create new
                                 </div>
                               </>
                             )}
                           </div>
                         )}
                      </div>
                    ) : (
                      <p className="text-sm font-semibold bg-emerald-50/50 rounded-lg px-3 py-2">{callLog.staff}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-emerald-700">Call Duration</label>
                    {editMode ? (
                      <Select value={editDraft.callDuration || ''} onValueChange={(value) => handleInputChange('callDuration', value)}>
                        <SelectTrigger className="w-full border border-emerald-200 rounded-lg px-3 py-2 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Less than 1 minute">Less than 1 minute</SelectItem>
                          <SelectItem value="1-5 minutes">1-5 minutes</SelectItem>
                          <SelectItem value="5-10 minutes">5-10 minutes</SelectItem>
                          <SelectItem value="10-15 minutes">10-15 minutes</SelectItem>
                          <SelectItem value="15-30 minutes">15-30 minutes</SelectItem>
                          <SelectItem value="30-60 minutes">30-60 minutes</SelectItem>
                          <SelectItem value="1+ hours">1+ hours</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm font-semibold bg-emerald-50/50 rounded-lg px-3 py-2">{callLog.callDuration || '—'}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-emerald-700">Call Outcome</label>
                    {editMode ? (
                      <Select value={editDraft.callOutcome || ''} onValueChange={(value) => handleInputChange('callOutcome', value)}>
                        <SelectTrigger className="w-full border border-emerald-200 rounded-lg px-3 py-2 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm">
                          <SelectValue placeholder="Select outcome" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="interested">Interested</SelectItem>
                          <SelectItem value="not-interested">Not Interested</SelectItem>
                          <SelectItem value="follow-up-needed">Follow-up Needed</SelectItem>
                          <SelectItem value="sale-closed">Sale Closed</SelectItem>
                          <SelectItem value="info-requested">Requested Info</SelectItem>
                          <SelectItem value="answered">Answered</SelectItem>
                          <SelectItem value="voicemail">Left Voicemail</SelectItem>
                          <SelectItem value="no-answer">No Answer</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm font-semibold bg-emerald-50/50 rounded-lg px-3 py-2">{callLog.callOutcome || '—'}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-emerald-700">Follow-Up Date</label>
                    {editMode ? (
                      <input 
                        type="datetime-local" 
                        className="w-full border border-emerald-200 rounded-lg px-3 py-2 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm" 
                        value={editDraft.followUpDate || ''} 
                        onChange={e => handleInputChange('followUpDate', e.target.value)} 
                      />
                    ) : (
                      <p className="text-sm font-semibold bg-emerald-50/50 rounded-lg px-3 py-2">{callLog.followUpDate || '—'}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-emerald-700">File Attachments</label>
                    {editMode ? (
                      <div className="space-y-2">
                        <div className="relative">
                          <input 
                            type="file" 
                            accept="audio/*,application/pdf,image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                            onChange={handleFileChange} 
                            id="file-input"
                          />
                          <div className="border border-emerald-200 rounded-lg px-3 py-2 bg-white/80 focus-within:border-emerald-400 focus-within:ring-emerald-400/20 transition-all text-sm min-h-[40px] flex items-center">
                            {fileInput ? (
                              <div className="flex items-center gap-2 w-full">
                                <Paperclip className="h-4 w-4 text-emerald-600" />
                                <span className="text-sm text-emerald-800 truncate flex-1">
                                  {fileInput.name}
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setFileInput(null);
                                    setEditDraft({ ...editDraft, fileAttachment: '' });
                                  }}
                                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-gray-500">
                                <Paperclip className="h-4 w-4" />
                                <span>Choose file...</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {callLog.files && callLog.files.length > 0 && (
                          <div className="text-xs text-emerald-600">
                            Current files will be preserved. New files will be added.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {callLog.files && callLog.files.length > 0 ? (
                          callLog.files.map((file: any, index: number) => {
                            const fileInfo = getFileTypeInfo(file);
                            return (
                              <div key={index} className="flex items-center justify-between p-2 bg-emerald-50/50 rounded-lg border border-emerald-100">
                                <div className="flex items-center gap-2">
                                  {fileInfo.icon}
                                  <span className="text-sm font-medium text-emerald-800 truncate max-w-32" title={file.name}>
                                    {file.name}
                                  </span>
                                  <span className="text-xs text-emerald-600">
                                    ({Math.round(file.size / 1024)}KB)
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  {fileInfo.isViewable && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        try {
                                          // Convert base64 to blob and create object URL
                                          const base64Data = file.data.replace(/^data:[^;]+;base64,/, '');
                                          const byteCharacters = atob(base64Data);
                                          const byteNumbers = new Array(byteCharacters.length);
                                          for (let i = 0; i < byteCharacters.length; i++) {
                                            byteNumbers[i] = byteCharacters.charCodeAt(i);
                                          }
                                          const byteArray = new Uint8Array(byteNumbers);
                                          const blob = new Blob([byteArray], { type: file.type || 'application/octet-stream' });
                                          const blobUrl = URL.createObjectURL(blob);

                                          // For PDF files, open in new tab
                                          if (fileInfo.viewType === 'pdf') {
                                            const newWindow = window.open(blobUrl, '_blank');
                                            if (newWindow) {
                                              toast.success(`Opening ${file.name} for viewing...`);
                                              // Clean up blob URL after a delay
                                              setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
                                            } else {
                                              toast.error('Popup blocked. Please allow popups for this site.');
                                              URL.revokeObjectURL(blobUrl);
                                            }
                                          } else {
                                            // For other viewable files, use the custom viewer
                                            const newWindow = window.open();
                                            if (newWindow) {
                                              newWindow.document.write(`
                                                <html>
                                                  <head>
                                                    <title>${file.name}</title>
                                                    <style>
                                                      body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                                                      .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb; }
                                                      .download-btn { background: #10b981; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; text-decoration: none; }
                                                      .download-btn:hover { background: #059669; }
                                                      .content { max-width: 100%; }
                                                      audio, video { width: 100%; max-width: 600px; }
                                                      img { max-width: 100%; height: auto; }
                                                      iframe { width: 100%; height: 80vh; border: none; }
                                                    </style>
                                                  </head>
                                                  <body>
                                                    <div class="header">
                                                      <h2>${file.name}</h2>
                                                      <a href="${blobUrl}" download="${file.name}" class="download-btn">Download</a>
                                                    </div>
                                                    <div class="content">
                                                      ${fileInfo.viewType === 'audio' ? `<audio controls><source src="${blobUrl}" type="${file.type}">Your browser does not support audio playback.</audio>` : ''}
                                                      ${fileInfo.viewType === 'image' ? `<img src="${blobUrl}" alt="${file.name}" />` : ''}
                                                      ${fileInfo.viewType === 'download' ? `<p>This file type cannot be previewed. <a href="${blobUrl}" download="${file.name}" class="download-btn">Download to view</a></p>` : ''}
                                                    </div>
                                                  </body>
                                                </html>
                                              `);
                                              newWindow.document.close();
                                              toast.success(`Opening ${file.name} for viewing...`);
                                              // Clean up blob URL after a delay
                                              setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
                                            }
                                          }
                                        } catch (error) {
                                          console.error('Error opening file:', error);
                                          toast.error('Error opening file. Please try downloading instead.');
                                        }
                                      }}
                                      className="h-6 w-6 p-0 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100"
                                      title={fileInfo.viewType === 'audio' ? 'Play audio' : 'View file'}
                                    >
                                      {fileInfo.viewType === 'audio' ? <Play className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      try {
                                        // Convert base64 to blob and create object URL for download
                                        const base64Data = file.data.replace(/^data:[^;]+;base64,/, '');
                                        const byteCharacters = atob(base64Data);
                                        const byteNumbers = new Array(byteCharacters.length);
                                        for (let i = 0; i < byteCharacters.length; i++) {
                                          byteNumbers[i] = byteCharacters.charCodeAt(i);
                                        }
                                        const byteArray = new Uint8Array(byteNumbers);
                                        const blob = new Blob([byteArray], { type: file.type || 'application/octet-stream' });
                                        const blobUrl = URL.createObjectURL(blob);

                                        const link = document.createElement('a');
                                        link.href = blobUrl;
                                        link.download = file.name;
                                        link.click();
                                        
                                        // Clean up blob URL after download
                                        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
                                        toast.success(`Downloading ${file.name}...`);
                                      } catch (error) {
                                        console.error('Error downloading file:', error);
                                        toast.error('Error downloading file. Please try again.');
                                      }
                                    }}
                                    className="h-6 w-6 p-0 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100"
                                    title="View file"
                                  >
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                  <span className="text-xs text-emerald-500">
                                    {new Date(file.uploaded_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-sm text-gray-500 bg-emerald-50/50 rounded-lg px-3 py-2">No files attached</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-emerald-700">Notes</label>
                  {editMode ? (
                    <textarea 
                      className="w-full border border-emerald-200 rounded-lg px-3 py-2 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all min-h-[80px] text-sm" 
                      value={editDraft.notes || ''} 
                      onChange={e => handleInputChange('notes', e.target.value)} 
                    />
                  ) : (
                    <p className="text-sm text-gray-700 leading-relaxed bg-emerald-50/50 rounded-lg px-3 py-2">{callLog.notes}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-emerald-700">Additional Notes</label>
                  {editMode ? (
                    <textarea 
                      className="w-full border border-emerald-200 rounded-lg px-3 py-2 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm" 
                      value={editDraft.additionalNotes || ''} 
                      onChange={e => handleInputChange('additionalNotes', e.target.value)} 
                    />
                  ) : (
                    <p className="text-sm text-gray-700 bg-emerald-50/50 rounded-lg px-3 py-2">{callLog.additionalNotes || '—'}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* File Attachments Section - luxury card */}
            {callLog.files && callLog.files.length > 0 && (
              <Card className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-purple-50 border-b border-emerald-100/50 p-4">
                  <CardTitle className="flex items-center gap-2 text-emerald-700 text-xl font-bold">
                    <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-purple-500 rounded-lg shadow-lg">
                      <Paperclip className="h-5 w-5 text-white" />
                    </div>
                    File Attachments ({callLog.files.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {callLog.files.map((file: any, index: number) => {
                      const fileInfo = getFileTypeInfo(file);
                      return (
                        <div key={index} className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-50/80 to-purple-50/80 backdrop-blur-sm rounded-2xl border border-emerald-100 hover:shadow-lg transition-all duration-300">
                          <div className="p-2 bg-gradient-to-br from-emerald-500 to-purple-500 rounded-lg shadow-lg flex-shrink-0">
                            {fileInfo.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-emerald-900 truncate" title={file.name}>
                              {file.name}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-emerald-700">
                              <span className="capitalize">{fileInfo.viewType}</span>
                              <span>•</span>
                              <span>{Math.round(file.size / 1024)}KB</span>
                              <span>•</span>
                              <span>{new Date(file.uploaded_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                              {fileInfo.isViewable && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    try {
                                      // Check if file.data is a URL or base64
                                      const isUrl = file.data.startsWith('http');
                                      let fileUrl = file.data;
                                      
                                      if (!isUrl) {
                                        // Handle base64 data (legacy support)
                                        const base64Data = file.data.replace(/^data:[^;]+;base64,/, '');
                                        const byteCharacters = atob(base64Data);
                                        const byteNumbers = new Array(byteCharacters.length);
                                        for (let i = 0; i < byteCharacters.length; i++) {
                                          byteNumbers[i] = byteCharacters.charCodeAt(i);
                                        }
                                        const byteArray = new Uint8Array(byteNumbers);
                                        const blob = new Blob([byteArray], { type: file.type || 'application/octet-stream' });
                                        fileUrl = URL.createObjectURL(blob);
                                      }

                                      // For PDF files, open in new tab
                                      if (fileInfo.viewType === 'pdf') {
                                        const newWindow = window.open(fileUrl, '_blank');
                                        if (newWindow) {
                                          toast.success(`Opening ${file.name} for viewing...`);
                                          // Clean up blob URL after a delay if it was created
                                          if (!isUrl) {
                                            setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
                                          }
                                        } else {
                                          toast.error('Popup blocked. Please allow popups for this site.');
                                          if (!isUrl) {
                                            URL.revokeObjectURL(fileUrl);
                                          }
                                        }
                                      } else {
                                        // For other viewable files, use the custom viewer
                                        const newWindow = window.open();
                                        if (newWindow) {
                                          newWindow.document.write(`
                                            <html>
                                              <head>
                                                <title>${file.name}</title>
                                                <style>
                                                  body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                                                  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb; }
                                                  .download-btn { background: #10b981; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; text-decoration: none; }
                                                  .download-btn:hover { background: #059669; }
                                                  .content { max-width: 100%; }
                                                  audio, video { width: 100%; max-width: 600px; }
                                                  img { max-width: 100%; height: auto; }
                                                  iframe { width: 100%; height: 80vh; border: none; }
                                                </style>
                                              </head>
                                              <body>
                                                <div class="header">
                                                  <h2>${file.name}</h2>
                                                  <a href="${fileUrl}" download="${file.name}" class="download-btn">Download</a>
                                                </div>
                                                <div class="content">
                                                  ${fileInfo.viewType === 'audio' ? `<audio controls><source src="${fileUrl}" type="${file.type}">Your browser does not support audio playback.</audio>` : ''}
                                                  ${fileInfo.viewType === 'image' ? `<img src="${fileUrl}" alt="${file.name}" />` : ''}
                                                  ${fileInfo.viewType === 'download' ? `<p>This file type cannot be previewed. <a href="${fileUrl}" download="${file.name}" class="download-btn">Download to view</a></p>` : ''}
                                                </div>
                                              </body>
                                            </html>
                                          `);
                                          newWindow.document.close();
                                          toast.success(`Opening ${file.name} for viewing...`);
                                          // Clean up blob URL after a delay if it was created
                                          if (!isUrl) {
                                            setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
                                          }
                                        }
                                      }
                                    } catch (error) {
                                      console.error('Error opening file:', error);
                                      toast.error('Error opening file. Please try downloading instead.');
                                    }
                                  }}
                                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-lg text-xs px-3 py-1"
                                >
                                  {fileInfo.viewType === 'audio' ? <Play className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
                                  {fileInfo.viewType === 'audio' ? 'Play' : 'View'}
                                </Button>
                              )}
                            </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Dated Notes Section - luxury card */}
            <Card className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-yellow-50 border-b border-emerald-100/50 p-4">
                <CardTitle className="flex items-center gap-2 text-emerald-700 text-xl font-bold">
                  <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-yellow-500 rounded-lg shadow-lg">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  Dated Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4 mb-6">
                  {datedNotes.length === 0 && (
                    <div className="text-emerald-400 italic text-center py-8 bg-emerald-50/50 rounded-lg">No additional notes yet.</div>
                  )}
                  <div className="flex flex-col gap-4 relative">
                    {/* Timeline vertical line if multiple notes */}
                    {datedNotes.length > 1 && (
                      <div className="absolute left-6 top-8 bottom-0 w-0.5 bg-gradient-to-b from-emerald-200 to-yellow-200 z-0" />
                    )}
                    {datedNotes.map((n, idx) => (
                      <div key={idx} className="relative bg-white/80 backdrop-blur-sm border border-emerald-100 rounded-2xl px-6 py-4 flex flex-col shadow-lg z-10 hover:shadow-xl transition-all duration-300" style={{ marginLeft: datedNotes.length > 1 ? 24 : 0 }}>
                        <div className="flex items-center gap-2 text-xs text-emerald-700 mb-2 font-semibold">
                          <Calendar className="h-3 w-3" />
                          <span>{n.date}</span>
                          <span className="mx-1">•</span>
                          <Clock className="h-3 w-3" />
                          <span>{n.time}</span>
                        </div>
                        <div className="text-gray-800 text-base mb-2 font-medium leading-relaxed">{n.note}</div>
                        <div className="text-xs text-emerald-600 italic flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          By {n.author}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 items-end">
                  <textarea
                    className="flex-1 border border-emerald-200 rounded-lg px-3 py-2 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all min-h-[60px] resize-none text-sm"
                    placeholder="Add a new note..."
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                  />
                  <Button
                    className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-lg shadow-lg text-xs px-3 py-1"
                    disabled={!newNote.trim()}
                    onClick={() => {
                      const now = new Date();
                      setDatedNotes([
                        {
                          date: now.toLocaleDateString(),
                          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                          note: newNote.trim(),
                          author: 'Daniel Sutton', // mock current user
                        },
                        ...datedNotes,
                      ]);
                      setNewNote("");
                      toast.success("Note added successfully!");
                    }}
                  >
                    Add Note
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Related Records */}
            <Card className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 border-b border-emerald-100/50 p-4">
                <CardTitle className="flex items-center gap-2 text-emerald-700 text-xl font-bold">
                  <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-lg shadow-lg">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  Related Records
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {callLog.designId && (
                    <div className="flex items-center justify-between p-4 bg-blue-50/80 backdrop-blur-sm rounded-2xl border border-blue-100 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className="p-1.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-blue-900">Design</p>
                          <p className="text-sm text-blue-700">{callLog.designId}</p>
                        </div>
                      </div>
                      <Link href={`/dashboard/designs/${callLog.designId}`}>
                        <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-50 rounded-lg text-xs px-3 py-1">View</Button>
                      </Link>
                    </div>
                  )}
                  {callLog.quoteNumber && (
                    <div className="flex items-center justify-between p-4 bg-yellow-50/80 backdrop-blur-sm rounded-2xl border border-yellow-100 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className="p-1.5 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg shadow-lg">
                          <DollarSign className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-yellow-900">Quote</p>
                          <p className="text-sm text-yellow-700">{callLog.quoteNumber}</p>
                        </div>
                      </div>
                      <Link href={`/dashboard/quotes/${callLog.quoteNumber}`}>
                        <Button variant="outline" size="sm" className="border-yellow-200 text-yellow-700 hover:bg-yellow-50 rounded-lg text-xs px-3 py-1">View</Button>
                      </Link>
                    </div>
                  )}
                  {callLog.orderNumber && (
                    <div className="flex items-center justify-between p-4 bg-green-50/80 backdrop-blur-sm rounded-2xl border border-green-100 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className="p-1.5 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg shadow-lg">
                          <Package className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-green-900">Order</p>
                          <p className="text-sm text-green-700">{callLog.orderNumber}</p>
                        </div>
                      </div>
                      <Link href={`/dashboard/orders/${callLog.orderNumber}`}>
                        <Button variant="outline" size="sm" className="border-green-200 text-green-700 hover:bg-green-50 rounded-lg text-xs px-3 py-1">View</Button>
                      </Link>
                    </div>
                  )}
                  {!callLog.designId && !callLog.quoteNumber && !callLog.orderNumber && (
                    <div className="text-center py-8 text-emerald-400 bg-emerald-50/50 rounded-lg">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm font-medium">No related records found</p>
                      <p className="text-xs mt-1">Create a design, quote, or order to link to this call</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar luxury card (Client Info) */}
          <div className="space-y-4">
            {/* Client Information card */}
            <Card className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100/50 p-4">
                <CardTitle className="flex items-center gap-2 text-emerald-700 text-xl font-bold">
                  <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg shadow-lg">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  Client Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-emerald-700">Name</label>
                  <p className="font-semibold text-emerald-800 bg-emerald-50/50 rounded-lg px-3 py-2">{callLog.customer}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-emerald-700">Email</label>
                  <p className="text-sm text-gray-700 bg-emerald-50/50 rounded-lg px-3 py-2">{callLog.clientEmail}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-emerald-700">Phone</label>
                  <p className="text-sm text-gray-700 bg-emerald-50/50 rounded-lg px-3 py-2">{callLog.clientPhone}</p>
                </div>
                
                {/* Quick Actions */}
                <div className="space-y-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-lg justify-start text-xs px-3 py-1"
                    onClick={() => toast.success("Email sent to client")}
                  >
                    <Mail className="w-3 h-3 mr-2" />
                    Send Email
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-lg justify-start text-xs px-3 py-1"
                    onClick={() => toast.success("Follow-up scheduled")}
                  >
                    <CalendarPlus className="w-3 h-3 mr-2" />
                    Schedule Follow-up
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-lg justify-start text-xs px-3 py-1"
                    onClick={() => toast.success("Client profile opened")}
                  >
                    <User className="w-3 h-3 mr-2" />
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 