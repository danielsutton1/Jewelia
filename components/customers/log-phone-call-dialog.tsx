"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useRef, useEffect } from "react"
import { toast } from "sonner"
import { Mic, Paperclip } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import type { Customer } from "@/types/customer"

interface FileData {
  name: string;
  type: string;
  size: number;
  data?: string; // base64 data
  url?: string; // Supabase storage URL
  uploaded_at: string;
  storage_type?: 'base64' | 'supabase'; // Indicates storage method
  storage_path?: string; // Supabase storage path
}

export function LogPhoneCallDialog({ open, onOpenChange, customer, onLog }: { open: boolean; onOpenChange: (open: boolean) => void; customer?: { id?: string; full_name?: string } | null; onLog?: (log: any) => void }) {
  const router = useRouter()
  const [callDetails, setCallDetails] = useState({
    customer: customer?.full_name || customer?.id || "",
    callType: "",
    staff: "",
    duration: "",
    outcome: "",
    summary: "",
    followUp: "",
    notes: "",
    budget: "",
    status: "in-progress",
    file: null as FileData | null
  })

  // New customer details state
  const [newCustomerDetails, setNewCustomerDetails] = useState({
    email: "",
    phone: "",
    company: "",
    address: "",
    notes: ""
  })

  // State to track if we're creating a new customer
  const [isNewCustomer, setIsNewCustomer] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [recording, setRecording] = useState(false)
  const [supported, setSupported] = useState(true)
  const recognitionRef = useRef<any>(null)
  const [error, setError] = useState("")
  const [permissionDenied, setPermissionDenied] = useState(false)

  const [customerResults, setCustomerResults] = useState<Customer[]>([])
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false)
  const [customerSearchLoading, setCustomerSearchLoading] = useState(false)
  const [isDropdownFocused, setIsDropdownFocused] = useState(false)
  const [staffResults, setStaffResults] = useState<any[]>([])
  const [showStaffDropdown, setShowStaffDropdown] = useState(false)
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null)
  const [staffSearchLoading, setStaffSearchLoading] = useState(false)
  const [isStaffDropdownFocused, setIsStaffDropdownFocused] = useState(false)

  const customerSelectionRef = useRef(false)
  const staffSelectionRef = useRef(false)
  const [isSelectingCustomer, setIsSelectingCustomer] = useState(false)
  const [isSelectingStaff, setIsSelectingStaff] = useState(false)
  const [hasShownStaffMessage, setHasShownStaffMessage] = useState(false)
  const [hasShownCustomerMessage, setHasShownCustomerMessage] = useState(false)
  const [staffDropdownDisabled, setStaffDropdownDisabled] = useState(false)
  const [customerDropdownDisabled, setCustomerDropdownDisabled] = useState(false)
  const [staffSelectedFromDropdown, setStaffSelectedFromDropdown] = useState(false)
  const lastCustomerSearchRef = useRef("")
  const lastStaffSearchRef = useRef("")

  // Update callDetails.customer when customer prop changes
  useEffect(() => {
    if (customer?.full_name || customer?.id) {
      setCallDetails(prev => ({
        ...prev,
        customer: customer.full_name || customer.id || ""
      }));
    }
  }, [customer]);

  // Reset function to clear all state when dialog opens/closes
  const resetDialogState = () => {
    setCallDetails({
      customer: customer?.full_name || customer?.id || "",
      callType: "",
      staff: "",
      duration: "",
      outcome: "",
      summary: "",
      followUp: "",
      notes: "",
      budget: "",
      status: "in-progress",
      file: null
    });
    setNewCustomerDetails({
      email: "",
      phone: "",
      company: "",
      address: "",
      notes: ""
    });
    setIsNewCustomer(false);
    setSelectedCustomerId(null);
    setSelectedStaffId(null);
    setStaffSelectedFromDropdown(false);
    setCustomerResults([]);
    setStaffResults([]);
    setShowCustomerDropdown(false);
    setShowStaffDropdown(false);
    setIsDropdownFocused(false);
    setIsStaffDropdownFocused(false);
    setIsSelectingCustomer(false);
    setIsSelectingStaff(false);
    setHasShownStaffMessage(false);
    setHasShownCustomerMessage(false);
    setStaffDropdownDisabled(false);
    setCustomerDropdownDisabled(false);
    setCustomerSearchLoading(false);
    setStaffSearchLoading(false);
    setError("");
    setPermissionDenied(false);
    setRecording(false);
    customerSelectionRef.current = false;
    staffSelectionRef.current = false;
    lastCustomerSearchRef.current = "";
    lastStaffSearchRef.current = "";
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      resetDialogState();
    }
  }, [open, customer]);

  useEffect(() => {
    setCallDetails(prev => ({
      ...prev,
      customer: customer?.full_name || customer?.id || ""
    }))
  }, [customer])

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSupported(false)
    }
  }, [])

  // Handle clicking outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Check if click is outside customer dropdown
      if (!target.closest('[data-customer-dropdown]') && !target.closest('[data-customer-input]')) {
        setShowCustomerDropdown(false);
        setIsDropdownFocused(false);
      }
      
      // Check if click is outside staff dropdown
      if (!target.closest('[data-staff-dropdown]') && !target.closest('[data-staff-input]')) {
        setShowStaffDropdown(false);
        setIsStaffDropdownFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Live search for customers
  useEffect(() => {
    // Don't run search effect if we're selecting a customer or dropdown is disabled
    if (isSelectingCustomer || customerDropdownDisabled) {
      return;
    }
    
    const fetchCustomers = async () => {
      // Don't search if we just selected a customer
      if (customerSelectionRef.current) {
        return;
      }
      
      // Don't search if the search term hasn't changed
      if (lastCustomerSearchRef.current === callDetails.customer) {
        return;
      }
      
      if (callDetails.customer.length < 2) {
        setCustomerResults([]);
        setShowCustomerDropdown(false);
        lastCustomerSearchRef.current = callDetails.customer;
        return;
      }
      
      console.log('Searching for customers with:', callDetails.customer);
      setCustomerSearchLoading(true);
      try {
        console.log('Searching for customers with:', callDetails.customer);
        
        // Use the API endpoint instead of direct Supabase client
        const response = await fetch(`/api/customers?search=${encodeURIComponent(callDetails.customer)}`);
        const result = await response.json();
        
        console.log('API search response:', result);
        
        if (result.success && result.data) {
          setCustomerResults(result.data);
          setShowCustomerDropdown(true);
          setIsNewCustomer(false); // Not a new customer if we found results
          
          // Mark that we've shown the customer message
          if (!hasShownCustomerMessage) {
            setHasShownCustomerMessage(true);
          }
        } else {
          setCustomerResults([]);
          // Show dropdown even with no results to indicate search is working
          if (callDetails.customer.length >= 2) {
            setShowCustomerDropdown(true);
            setIsNewCustomer(true); // This is a new customer
          } else {
            setShowCustomerDropdown(false);
            setIsNewCustomer(false);
          }
        }
        
        // Update the last search term
        lastCustomerSearchRef.current = callDetails.customer;
      } catch (error) {
        console.error('Error searching customers:', error);
        setCustomerResults([]);
        setShowCustomerDropdown(false);
      } finally {
        setCustomerSearchLoading(false);
      }
    };
    
    // Debounce the search
    const timeoutId = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(timeoutId);
  }, [callDetails.customer, isSelectingCustomer]);

  // Live search for staff members
  useEffect(() => {
    // Don't run search effect if we're selecting a staff member or dropdown is disabled
    if (isSelectingStaff || staffDropdownDisabled) {
      return;
    }
    
    const fetchStaff = async () => {
      // Don't search if we just selected a staff member
      if (staffSelectionRef.current) {
        return;
      }
      
      // Don't search if the search term hasn't changed
      if (lastStaffSearchRef.current === callDetails.staff) {
        return;
      }
      
      if (callDetails.staff.length < 2) {
        setStaffResults([]);
        setShowStaffDropdown(false);
        lastStaffSearchRef.current = callDetails.staff;
        return;
      }
      
      console.log('Searching for staff with:', callDetails.staff);
      setStaffSearchLoading(true);
      try {
        // Use a predefined staff list for now (since API requires auth)
        const staffList = [
          { id: null, full_name: 'Daniel Sutton', email: 'daniel@jewelia.com', role: 'admin', uniqueId: 'daniel-sutton' },
          { id: null, full_name: 'Sarah Johnson', email: 'sarah@jewelia.com', role: 'staff', uniqueId: 'sarah-johnson' },
          { id: null, full_name: 'David Chen', email: 'david@jewelia.com', role: 'staff', uniqueId: 'david-chen' },
          { id: null, full_name: 'Emily Rodriguez', email: 'emily@jewelia.com', role: 'manager', uniqueId: 'emily-rodriguez' },
          { id: null, full_name: 'Michael Thompson', email: 'michael@jewelia.com', role: 'staff', uniqueId: 'michael-thompson' },
          { id: null, full_name: 'Lisa Wang', email: 'lisa@jewelia.com', role: 'staff', uniqueId: 'lisa-wang' },
          { id: null, full_name: 'James Wilson', email: 'james@jewelia.com', role: 'manager', uniqueId: 'james-wilson' },
          { id: null, full_name: 'Amanda Davis', email: 'amanda@jewelia.com', role: 'staff', uniqueId: 'amanda-davis' }
        ];
        
        // Filter staff based on search term
        const filteredStaff = staffList.filter(staff => 
          staff.full_name.toLowerCase().includes(callDetails.staff.toLowerCase()) ||
          staff.email.toLowerCase().includes(callDetails.staff.toLowerCase())
        );
        
        console.log('Staff search results:', filteredStaff);
        
        setStaffResults(filteredStaff);
        setShowStaffDropdown(true);
        
        // Mark that we've shown the staff message
        if (!hasShownStaffMessage) {
          setHasShownStaffMessage(true);
        }
        
        // Update the last search term
        lastStaffSearchRef.current = callDetails.staff;
      } catch (error) {
        console.error('Error searching staff:', error);
        setStaffResults([]);
        setShowStaffDropdown(false);
      } finally {
        setStaffSearchLoading(false);
      }
    };
    
    // Debounce the search
    const timeoutId = setTimeout(fetchStaff, 300);
    return () => clearTimeout(timeoutId);
  }, [callDetails.staff, isSelectingStaff]);

  function startVoiceToText() {
    setError("")
    setPermissionDenied(false)
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSupported(false)
      setError("Voice recognition not supported in this browser.")
      return
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = true
    recognition.continuous = false
    recognition.onresult = (event: any) => {
      let transcript = ''
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript
      }
      setCallDetails(prev => ({ ...prev, notes: prev.notes + transcript }))
    }
    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed' || event.error === 'denied') {
        setPermissionDenied(true)
        setError("Microphone access denied. Please allow mic access, use HTTPS, and reload the page.")
      } else {
        setError("Voice recognition error: " + event.error)
      }
      setRecording(false)
    }
    recognition.onend = () => {
      setRecording(false)
    }
    recognitionRef.current = recognition
    recognition.start()
    setRecording(true)
  }

  function stopVoiceToText() {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setRecording(false)
    }
  }



  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // First try to upload to Supabase storage
        const formData = new FormData();
        formData.append('file', file);
        
        const uploadResponse = await fetch('/api/upload-file', {
          method: 'POST',
          body: formData
        });
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          
          if (uploadResult.success) {
            const fileData = uploadResult.data;
            setCallDetails({ ...callDetails, file: fileData });
            toast.success('File uploaded successfully to cloud storage');
            return;
          } else {
            console.warn('Supabase upload failed, falling back to base64:', uploadResult.error);
            // Fall through to base64 storage
          }
        } else {
          console.warn('Supabase upload failed, falling back to base64');
          // Fall through to base64 storage
        }
        
        // Fallback: Convert file to base64 for local storage
        const reader = new FileReader();
        reader.onload = () => {
          const fileData: FileData = {
            name: file.name,
            type: file.type,
            size: file.size,
            data: reader.result as string, // base64 data
            uploaded_at: new Date().toISOString(),
            storage_type: 'base64' // Indicate this is base64 stored
          };
          setCallDetails({ ...callDetails, file: fileData });
          toast.success('File stored locally (cloud storage not available)');
        };
        reader.onerror = () => {
          toast.error('Failed to read file');
          console.error('FileReader error:', reader.error);
        };
        reader.readAsDataURL(file);
        
      } catch (error) {
        console.error('Error uploading file:', error);
        toast.error('Failed to upload file. Please try again.');
      }
    } else {
      setCallDetails({ ...callDetails, file: null });
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields - allow customer to be filled in during submission
    if (!callDetails.customer.trim()) {
      toast.error("Please enter a customer name or search for an existing customer");
      return;
    }
    
    if (!callDetails.staff.trim()) {
      toast.error("Staff name is required");
      return;
    }
    
    if (!callDetails.callType.trim()) {
      toast.error("Call type is required");
      return;
    }
    
    try {
      let customerId = selectedCustomerId;
      let staffId = selectedStaffId;
      
      // If no customer is selected but customer name is provided, create a new customer
      if (!customerId && callDetails.customer.trim()) {
        setIsCreatingCustomer(true);
        
        // Use provided email or generate from customer name
        let email = newCustomerDetails.email.trim();
        if (!email) {
          const emailMatch = callDetails.notes?.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
          email = emailMatch ? emailMatch[0] : '';
          if (!email) {
            const cleanName = callDetails.customer.trim().toLowerCase()
              .replace(/[^a-z0-9\s]/g, '') // Remove special characters
              .replace(/\s+/g, '.') // Replace spaces with dots
              .substring(0, 20); // Limit length
            email = `${cleanName}@example.com`;
          }
        }
        
        // Create new customer using the customers API
        const customerData = {
          full_name: callDetails.customer.trim(),
          email: email,
          phone: newCustomerDetails.phone.trim() || null,
          company: newCustomerDetails.company.trim() || null,
          address: newCustomerDetails.address.trim() || null,
          notes: newCustomerDetails.notes.trim() || `Created from phone call log on ${new Date().toLocaleDateString()}`
        };
        
        console.log('Creating customer with data:', JSON.stringify(customerData, null, 2));
        
        const customerResponse = await fetch('/api/customers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(customerData),
        });
        
        console.log('Customer response status:', customerResponse.status);
        console.log('Customer response headers:', Object.fromEntries(customerResponse.headers));
        
        const responseText = await customerResponse.text();
        console.log('Customer response text:', responseText);
        
        let customerResult;
        try {
          customerResult = JSON.parse(responseText);
        } catch (e) {
          console.error('Failed to parse customer response as JSON:', e);
          toast.error("Failed to create customer: Invalid response from server");
          return;
        }
        
        console.log('Parsed customer result:', customerResult);
        
        if (!customerResult.success) {
          console.error('Error creating customer:', customerResult);
          console.error('Response status:', customerResponse.status);
          console.error('Response status text:', customerResponse.statusText);
          
          // Show more specific error message
          let errorMessage = 'Unknown error';
          if (customerResult.error) {
            if (typeof customerResult.error === 'string') {
              errorMessage = customerResult.error;
            } else if (customerResult.error.message) {
              errorMessage = customerResult.error.message;
            } else if (customerResult.error.details) {
              errorMessage = `Database error: ${customerResult.error.details}`;
            }
          }
          
          toast.error(`Failed to create customer: ${errorMessage}`);
          setIsCreatingCustomer(false);
          return;
        }
        
        // Handle case where customer already exists
        if (customerResult.existing) {
          toast.success(`Using existing customer: ${customerResult.data.full_name}`);
        } else {
          toast.success(`New customer "${callDetails.customer}" created successfully!`);
        }
        
        customerId = customerResult.data.id;
      }
      
      // If no staff is selected from dropdown but staff name is provided, just use the name
      // The call-log API will handle the staff_name as a string
      if (!staffSelectedFromDropdown && callDetails.staff.trim()) {
        // Don't create a full user account, just use the staff name
        staffId = null; // Let the API handle staff_name as string
        console.log(`Using staff name: ${callDetails.staff.trim()}`);
      }
      
      // Prepare call log data - only include fields that exist in the call_logs table
      const callLogData = {
        customer_name: callDetails.customer,
        customer_id: customerId,
        notes: callDetails.notes || callDetails.summary || `Call logged by ${callDetails.staff} - ${callDetails.callType}`,
        status: callDetails.status || 'in-progress'
      };
      

      
      // Save to API
      const response = await fetch('/api/call-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(callLogData),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to save call log');
      }
      
      if (onLog) onLog(callLogData);
      toast.success("Customer note added successfully!");
      
      // Reset form using the reset function
      resetDialogState();
      onOpenChange(false);
      
      // Don't redirect immediately - let the data refresh happen first
      // router.push('/dashboard/call-log');
      
    } catch (error) {
      console.error('Error adding customer note:', error);
      toast.error("Failed to add customer note. Please try again.");
    } finally {
      setIsCreatingCustomer(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-dialog-content>
        <DialogHeader>
          <DialogTitle>Add Customer Note</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} autoComplete="off" noValidate>
          <div className="space-y-4 py-4">
            <div className="relative">
              <Input 
                placeholder="Customer Name or ID" 
                value={callDetails.customer} 
                onChange={(e) => {
                  setCallDetails({...callDetails, customer: e.target.value});
                  setSelectedCustomerId(null); // Reset selected customer when typing
                  
                  // Don't show dropdown if we just selected a customer or dropdown is disabled
                  if (customerSelectionRef.current || isSelectingCustomer || customerDropdownDisabled) {
                    return;
                  }
                  
                  // Force dropdown to show when typing
                  if (e.target.value.length >= 2) {
                    setShowCustomerDropdown(true);
                  } else {
                    setShowCustomerDropdown(false);
                    setIsNewCustomer(false);
                  }
                }}

                aria-label="Customer Name or ID"
                autoComplete="off"
                data-customer-input
                onFocus={() => { 
                  // Don't show dropdown if we just selected a customer or dropdown is disabled
                  if (customerSelectionRef.current || isSelectingCustomer || customerDropdownDisabled) {
                    return;
                  }
                  
                  if (customerResults.length > 0 && callDetails.customer.length >= 2) {
                    setShowCustomerDropdown(true);
                  }
                  setIsDropdownFocused(true);
                }}
                onBlur={() => {
                  // When user clicks outside, check if this is a new customer
                  setTimeout(() => {
                    if (callDetails.customer.length >= 2 && !selectedCustomerId && customerResults.length === 0) {
                      setIsNewCustomer(true);
                      // Auto-scroll to show the new customer section
                      setTimeout(() => {
                        const newCustomerSection = document.querySelector('[data-new-customer-section]');
                        if (newCustomerSection) {
                          newCustomerSection.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                          });
                        }
                      }, 100);
                    } else {
                      setIsNewCustomer(false);
                    }
                  }, 200); // Small delay to allow dropdown selection to complete
                }}
              />
              <div className="text-xs text-gray-500 mt-1">
                Start typing to search existing customers or enter a new customer name
              </div>
              {customerSearchLoading && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg p-2">
                  <div className="flex items-center justify-center text-sm text-gray-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600 mr-2"></div>
                    Searching customers...
                  </div>
                </div>
              )}
              {showCustomerDropdown && customerResults.length > 0 && !customerSearchLoading && !customerDropdownDisabled && (
                <div 
                  className="absolute z-[9999] mt-1 w-full bg-white border-2 border-emerald-200 rounded-lg shadow-xl max-h-56 overflow-y-auto"
                  data-customer-dropdown
                  onMouseEnter={() => setIsDropdownFocused(true)}
                  onMouseLeave={() => setIsDropdownFocused(false)}
                >
                  {customerResults.map((cust) => (
                    <div
                      key={cust.id}
                      className="px-4 py-2 cursor-pointer hover:bg-emerald-50 border-b border-gray-100 last:border-b-0"
                      onClick={() => {
                        setIsSelectingCustomer(true);
                        customerSelectionRef.current = true;
                        setCustomerDropdownDisabled(true);
                        setCallDetails({ ...callDetails, customer: cust.full_name });
                        setSelectedCustomerId(cust.id);
                        setIsNewCustomer(false); // Reset new customer state when selecting existing
                        setShowCustomerDropdown(false);
                        setIsDropdownFocused(false);
                        // Reset the flags after a short delay
                        setTimeout(() => {
                          customerSelectionRef.current = false;
                          setIsSelectingCustomer(false);
                        }, 500);
                      }}
                    >
                      <div className="font-medium">{cust.full_name}</div>
                      <div className="text-xs text-gray-500">{cust.email}</div>
                    </div>
                  ))}
                  {!hasShownCustomerMessage && (
                    <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-100 bg-gray-50">
                      Select existing customer or continue typing to create new customer
                    </div>
                  )}
                </div>
              )}
              {showCustomerDropdown && customerResults.length === 0 && callDetails.customer.length >= 2 && !customerSearchLoading && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg p-3">
                  <div className="text-sm text-gray-600">
                    <div className="font-medium mb-1">No existing customer found</div>
                    <div className="text-xs text-gray-500">
                      Continue filling the form to create a new customer: "{callDetails.customer}"
                    </div>
                  </div>
                </div>
              )}
              {isNewCustomer && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm text-blue-700">
                    <div className="font-medium mb-1">Creating new customer</div>
                    <div className="text-xs text-blue-600">
                      Please fill in the customer details below
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* New Customer Details Section */}
            {isNewCustomer && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200" data-new-customer-section>
                <div className="text-sm font-medium text-gray-700 mb-3">
                  New Customer Information
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Email *</label>
                    <Input
                      type="email"
                      placeholder="customer@example.com"
                      value={newCustomerDetails.email}
                      onChange={(e) => setNewCustomerDetails({...newCustomerDetails, email: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <Input
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={newCustomerDetails.phone}
                      onChange={(e) => setNewCustomerDetails({...newCustomerDetails, phone: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Company</label>
                    <Input
                      type="text"
                      placeholder="Company Name"
                      value={newCustomerDetails.company}
                      onChange={(e) => setNewCustomerDetails({...newCustomerDetails, company: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Address</label>
                    <Input
                      type="text"
                      placeholder="123 Main St, City, State"
                      value={newCustomerDetails.address}
                      onChange={(e) => setNewCustomerDetails({...newCustomerDetails, address: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Customer Notes</label>
                  <Textarea
                    placeholder="Additional customer information..."
                    value={newCustomerDetails.notes}
                    onChange={(e) => setNewCustomerDetails({...newCustomerDetails, notes: e.target.value})}
                    rows={2}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <Select onValueChange={(value) => setCallDetails({...callDetails, callType: value})} value={callDetails.callType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Call Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inbound">Inbound</SelectItem>
                  <SelectItem value="outbound">Outbound</SelectItem>
                </SelectContent>
              </Select>
              <Select onValueChange={(value) => setCallDetails({...callDetails, status: value})} value={callDetails.status} required>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="missed">Missed</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Input 
                  placeholder="Staff Member" 
                  value={callDetails.staff} 
                  onChange={(e) => {
                    setCallDetails({...callDetails, staff: e.target.value});
                    setSelectedStaffId(null); // Reset selected staff when typing
                    setStaffSelectedFromDropdown(false); // Reset dropdown selection flag when typing
                    
                    // Don't show dropdown if we just selected a staff member or dropdown is disabled
                    if (staffSelectionRef.current || isSelectingStaff || staffDropdownDisabled) {
                      return;
                    }
                    
                    // Force dropdown to show when typing
                    if (e.target.value.length >= 2) {
                      setShowStaffDropdown(true);
                    } else {
                      setShowStaffDropdown(false);
                    }
                  }}
                  aria-label="Staff Member"
                  autoComplete="off"
                  data-staff-input
                  onFocus={() => { 
                    // Don't show dropdown if we just selected a staff member or dropdown is disabled
                    if (staffSelectionRef.current || isSelectingStaff || staffDropdownDisabled) {
                      return;
                    }
                    
                    if (staffResults.length > 0 && callDetails.staff.length >= 2) {
                      setShowStaffDropdown(true);
                    }
                    setIsStaffDropdownFocused(true);
                  }}
                  onBlur={() => {
                    // Don't hide dropdown immediately on blur to allow for clicks
                    // The dropdown will be hidden when an item is selected or when clicking outside
                  }}
                />
                {staffSearchLoading && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg p-2">
                    <div className="flex items-center justify-center text-sm text-gray-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600 mr-2"></div>
                      Searching staff...
                    </div>
                  </div>
                )}
                {showStaffDropdown && staffResults.length > 0 && !staffSearchLoading && !staffDropdownDisabled && (
                  <div 
                    className="absolute z-[9999] mt-1 w-full bg-white border-2 border-blue-200 rounded-lg shadow-xl max-h-56 overflow-y-auto"
                    data-staff-dropdown
                    onMouseEnter={() => setIsStaffDropdownFocused(true)}
                    onMouseLeave={() => setIsStaffDropdownFocused(false)}
                  >
                    {staffResults.map((staff, index) => (
                      <div
                        key={staff.id || staff.uniqueId || `staff-${index}`}
                        className="px-4 py-2 cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                        onClick={() => {
                          setIsSelectingStaff(true);
                          staffSelectionRef.current = true;
                          setStaffDropdownDisabled(true);
                          setStaffSelectedFromDropdown(true);
                          setCallDetails({ ...callDetails, staff: staff.full_name || `${staff.first_name} ${staff.last_name}` });
                          setSelectedStaffId(staff.id); // This will be null for our predefined list
                          setShowStaffDropdown(false);
                          setIsStaffDropdownFocused(false);
                          // Reset the flags after a short delay
                          setTimeout(() => {
                            staffSelectionRef.current = false;
                            setIsSelectingStaff(false);
                          }, 500);
                        }}
                      >
                        <div className="font-medium">{staff.full_name || `${staff.first_name} ${staff.last_name}`}</div>
                        <div className="text-xs text-gray-500">{staff.email} • {staff.role}</div>
                      </div>
                    ))}
                    {!hasShownStaffMessage && (
                      <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-100 bg-gray-50">
                        Select existing staff member or continue typing to create new
                      </div>
                    )}
                  </div>
                )}
                {showStaffDropdown && staffResults.length === 0 && callDetails.staff.length >= 2 && !staffSearchLoading && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg p-3">
                    <div className="text-sm text-gray-600">
                      <div className="font-medium mb-1">No existing staff member found</div>
                      <div className="text-xs text-gray-500">
                        Continue filling the form to create a new staff member: "{callDetails.staff}"
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <Select onValueChange={(value) => setCallDetails({...callDetails, duration: value})} value={callDetails.duration}>
              <SelectTrigger>
                <SelectValue placeholder="Select call duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-5 minutes">1-5 minutes</SelectItem>
                <SelectItem value="5-10 minutes">5-10 minutes</SelectItem>
                <SelectItem value="10-15 minutes">10-15 minutes</SelectItem>
                <SelectItem value="15-30 minutes">15-30 minutes</SelectItem>
                <SelectItem value="30-60 minutes">30-60 minutes</SelectItem>
                <SelectItem value="1+ hours">1+ hours</SelectItem>
                <SelectItem value="Less than 1 minute">Less than 1 minute</SelectItem>
              </SelectContent>
            </Select>
                          <Select onValueChange={(value) => setCallDetails({...callDetails, outcome: value})} value={callDetails.outcome}>
              <SelectTrigger>
                <SelectValue placeholder="Select call outcome" />
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
            <div>
              <label className="text-sm font-medium">Notes</label>
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  variant={recording ? "default" : "outline"}
                  type="button"
                  onClick={recording ? stopVoiceToText : startVoiceToText}
                  disabled={!supported}
                >
                  <Mic className="h-4 w-4 mr-1" />
                  {recording ? "Recording..." : "Voice-to-Text"}
                </Button>
              </div>
              <Textarea 
                placeholder="Summary of the call..." 
                value={callDetails.notes} 
                onChange={(e) => setCallDetails({...callDetails, notes: e.target.value})}
                rows={3}
                aria-label="Notes"
              />
              {recording && <span className="text-xs text-red-600 animate-pulse ml-2">● Recording...</span>}
              {error && (
                <div className="text-xs text-red-600 mt-1">
                  {error}
                  {permissionDenied && (
                    <>
                      <br />
                      <span>
                        <strong>How to fix:</strong> <br />
                        1. Click the microphone icon in your browser's address bar and allow access.<br />
                        2. Make sure you are using HTTPS.<br />
                        3. Reload the page and try again.<br />
                      </span>
                      <Button size="sm" variant="outline" className="mt-2" type="button" onClick={startVoiceToText}>Try Again</Button>
                    </>
                  )}
                </div>
              )}
              {!error && !supported && (
                <div className="text-xs text-red-600 mt-1">Voice recognition is not supported in this browser.</div>
              )}
              <div className="text-xs text-muted-foreground mt-2">Voice-to-text is available. Speak to fill in notes.</div>
            </div>
            <div>
              <label className="text-sm font-medium">Budget</label>
              <Input
                type="number"
                placeholder="Enter customer budget (e.g., 5000)"
                value={callDetails.budget}
                onChange={(e) => setCallDetails({...callDetails, budget: e.target.value})}
                className="mt-2"
                aria-label="Budget"
                min="0"
                step="0.01"
              />
              <div className="text-xs text-muted-foreground mt-1">Enter the customer's budget for the project discussed</div>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Follow-Up Date</label>
              <Input
                type="datetime-local"
                value={callDetails.followUp}
                onChange={e => setCallDetails({...callDetails, followUp: e.target.value})}
                className="max-w-xs"
                aria-label="Follow-Up Date"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Attachments</label>
                <div className="mt-2">
                  <Input 
                    type="file"
                    accept="audio/*,application/pdf"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    aria-label="Upload File"
                    className="hidden"
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2"
                    >
                      <Paperclip className="h-4 w-4" />
                      Choose File
                    </Button>
                    {callDetails.file && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="truncate max-w-32" title={callDetails.file.name}>
                          {callDetails.file.name}
                          {callDetails.file.storage_type === 'base64' && (
                            <span className="text-xs text-orange-600 ml-1">(local)</span>
                          )}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setCallDetails({...callDetails, file: null});
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                          className="h-4 w-4 p-0 text-red-500 hover:text-red-700"
                        >
                          ×
                        </Button>
                      </div>
                    )}
                  </div>
                  {!callDetails.file && (
                    <p className="text-xs text-gray-500 mt-1">No file chosen</p>
                  )}
                </div>
              </div>
              <Textarea 
                placeholder="Additional notes (optional)" 
                value={callDetails.summary} 
                onChange={(e) => setCallDetails({...callDetails, summary: e.target.value})}
                rows={2}
                aria-label="Additional Notes"
              />
            </div>

          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isCreatingCustomer}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isCreatingCustomer}
            >
              {isCreatingCustomer ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Customer...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </form>

      </DialogContent>
    </Dialog>
  )
} 
 
 