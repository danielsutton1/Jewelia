'use client'
import { use, useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Edit, Download, Mail, ArrowLeft, DollarSign, User, Calendar, FileText, Bot, Send, Plus, ChevronDown } from 'lucide-react';
import Link from 'next/link';

// Mock quote data (replace with real fetch in future)
const mockQuotes = [
  {
    quoteNumber: 'Q-2024-001',
    item: 'Diamond Engagement Ring',
    client: 'Sophia Chen',
    email: 'sophia.chen@email.com',
    dueDate: 'Jun 30',
    assignee: 'Daniel Sutton',
    status: 'on-track',
    stage: 'reminder',
    items: [
      { name: '1.5ct Diamond Center', qty: 1, price: 8500 },
      { name: 'Platinum Band', qty: 1, price: 1200 },
      { name: 'Custom Engraving', qty: 1, price: 150 },
    ],
    subtotal: 9850,
    tax: 788,
    total: 10638,
    notes: 'Client requested a hidden halo and custom engraving inside the band.',
    aiInsights: 'This quote is above average value. Consider offering a loyalty discount or suggesting matching wedding bands.',
    aiNextSteps: 'Follow up with client to confirm ring size and engraving text. Offer financing options.',
  },
  // Add more mock quotes as needed
];

export default function QuoteDetailPage({ params }: { params: Promise<{ id: string | string[] }> }) {
  const { id } = use(params);
  const quoteId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiMessage, setAiMessage] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [convertLoading, setConvertLoading] = useState(false);
  const [convertError, setConvertError] = useState('');
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // Fetch quote data
  useEffect(() => {
    const fetchQuote = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/quotes?search=${quoteId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch quote');
        }
        
        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch quote');
        }
        
        // Find the specific quote by ID
        const foundQuote = result.data.find((q: any) => q.quote_number === quoteId);
        if (!foundQuote) {
          throw new Error('Quote not found');
        }
        
        // Map API data to expected format
        const mappedQuote = {
          quoteNumber: foundQuote.quote_number,
          item: 'Custom Item', // Extract from items JSONB if needed
          client: foundQuote.customer_name || `Customer ${foundQuote.customer_id?.slice(0, 8) || 'Unknown'}`,
          email: 'client@email.com', // Would need to fetch from customers table
          dueDate: foundQuote.valid_until ? new Date(foundQuote.valid_until).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A',
          assignee: foundQuote.assignee_name || 'Unassigned',
          status: foundQuote.status,
          stage: foundQuote.status === 'draft' ? 'designsstatus' : foundQuote.status === 'sent' ? 'quoteSent' : 'clientResponse',
          items: foundQuote.items ? JSON.parse(foundQuote.items) : [],
          subtotal: foundQuote.total_amount,
          tax: 0, // Would need to calculate from tax_rate
          total: foundQuote.total_amount,
          notes: foundQuote.notes || '',
          aiInsights: 'This quote is above average value. Consider offering a loyalty discount or suggesting matching wedding bands.',
          aiNextSteps: 'Follow up with client to confirm ring size and engraving text. Offer financing options.',
          // Add raw data for debugging
          rawData: foundQuote
        };
        
        setQuote(mappedQuote);
      } catch (err: any) {
        setError(err.message || 'Failed to load quote');
        toast({
          title: "Error",
          description: "Failed to load quote data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (quoteId) {
      fetchQuote();
    }
  }, [quoteId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-emerald-600">Loading quote...</p>
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Quote</h1>
          <p className="text-gray-600 mb-4">{error || 'Quote not found'}</p>
          <Button onClick={() => router.push('/dashboard/quotes')}>
            Back to Quotes
          </Button>
        </div>
      </div>
    );
  }

  async function handleAISubmit() {
    setAiLoading(true);
    setAiResponse('');
    setAiError('');
    try {
      const res = await fetch('/api/ai-chatgpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiMessage,
          quote: {
            client: quote.client,
            item: quote.item,
            quoteNumber: quote.quoteNumber,
            dueDate: quote.dueDate,
            status: quote.status,
            notes: quote.notes,
          },
        }),
      });
      const data = await res.json();
      if (data.error) setAiError(data.error);
      else setAiResponse(data.result);
    } catch (err) {
      setAiError('Failed to contact AI service.');
    } finally {
      setAiLoading(false);
    }
  }

  function handleEditQuote() {
    router.push(`/dashboard/quotes/${quote.quoteNumber}/edit`);
  }

  function handleDownloadPDF() {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Jewelia CRM', 105, 20, { align: 'center' });
    doc.setFontSize(16);
    doc.text('QUOTE', 105, 30, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Quote Number: ${quote.quoteNumber}`, 14, 45);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 52);
    doc.text(`Status: ${quote.status}`, 14, 59);
    doc.text('Client:', 130, 45);
    doc.text(quote.client, 130, 52);
    doc.text('Assignee:', 130, 59);
    doc.text(quote.assignee, 130, 66);
    doc.text('Due Date:', 130, 73);
    doc.text(quote.dueDate, 130, 80);
    // Items table
    const tableColumn = ['Item', 'Quantity', 'Unit Price', 'Total'];
    const tableRows = quote.items.map((item: any) => [
      item.name,
      item.qty.toString(),
      `$${item.price.toLocaleString()}`,
      `$${(item.price * item.qty).toLocaleString()}`,
    ]);
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 95,
      theme: 'grid',
      headStyles: {
        fillColor: [39, 174, 96],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 40, halign: 'right' },
        3: { cellWidth: 40, halign: 'right' },
      },
    });
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.text('Subtotal:', 140, finalY + 10);
    doc.text(`$${quote.subtotal.toLocaleString()}`, 180, finalY + 10, { align: 'right' });
    doc.text('Tax:', 140, finalY + 17);
    doc.text(`$${quote.tax.toLocaleString()}`, 180, finalY + 17, { align: 'right' });
    doc.setFontSize(14);
    doc.text('Total:', 140, finalY + 34);
    doc.text(`$${quote.total.toLocaleString()}`, 180, finalY + 34, { align: 'right' });
    doc.setFontSize(12);
    doc.text('Notes:', 14, finalY + 50);
    doc.setFontSize(10);
    doc.text(quote.notes || 'No additional notes.', 14, finalY + 57);
    doc.save(`Quote-${quote.quoteNumber}.pdf`);
  }

  function handleEmailClient() {
    window.open(`mailto:?subject=Quote%20${quote.quoteNumber}&body=Dear%20${quote.client},%0A%0APlease%20find%20your%20quote%20attached.%0A%0AThank%20you!`);
  }

  function handleContactAssignee() {
    window.open(`mailto:?subject=Quote%20${quote.quoteNumber}%20-%20${quote.client}&body=Hi%20${quote.assignee},%0A%0AI%20need%20to%20discuss%20quote%20${quote.quoteNumber}%20for%20${quote.client}.%0A%0AThank%20you!`);
  }

  async function handleConvertToOrder() {
    setConvertLoading(true);
    setConvertError('');
    try {
      // Require email for conversion
      if (!quote.email || !/^\S+@\S+\.\S+$/.test(quote.email)) {
        setConvertError('A valid customer email is required to convert this quote to an order.');
        setConvertLoading(false);
        return;
      }
      // 1. Lookup customer by name
      let customerId = '';
      const customerRes = await fetch(`/api/customers?search=${encodeURIComponent(quote.client)}`);
      if (customerRes.ok) {
        const customerData = await customerRes.json();
        console.log('Customer search results:', customerData.data);
        console.log('Looking for:', { name: quote.client, email: quote.email });
        const found = customerData.data?.find((c: any) => {
          console.log('Checking customer:', c["Full Name"], c["Email Address"]);
          return c["Full Name"] === quote.client && c["Email Address"] === quote.email;
        });
        if (found) {
          customerId = found.id;
          console.log('Found existing customer:', found.id);
        } else {
          console.log('No matching customer found');
        }
      }
      // 2. If not found, create new customer
      if (!customerId) {
        const createRes = await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            "Full Name": quote.client, 
            "Email Address": quote.email 
          }),
        });
        if (!createRes.ok) throw new Error('Failed to create customer');
        const newCustomer = await createRes.json();
        customerId = newCustomer.data.id;
      }
      // 3. Create order with customerId
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: customerId,
          order_date: new Date().toISOString().slice(0, 10),
          items: quote.items.map((item: any) => ({
            name: item.name,
            quantity: item.qty,
            price: item.price,
          })),
          notes: quote.notes,
        }),
      });
      if (!res.ok) throw new Error('Failed to create order');
      const data = await res.json();
      toast({ title: 'Order Created', description: 'Quote has been converted to an order.' });
      if (data?.data?.order_id) {
        router.push(`/dashboard/orders/${data.data.order_id}`);
      }
    } catch (err: any) {
      setConvertError(err.message || 'Failed to convert quote.');
    } finally {
      setConvertLoading(false);
    }
  }

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
                <Link href="/dashboard/quotes">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 rounded-full shadow-lg">
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-green-700 bg-clip-text text-transparent tracking-tight">
                    Quote Details
                  </h1>
                  <p className="text-emerald-600 text-sm font-medium">Quote Number: <span className="text-emerald-800 font-semibold">{quote.quoteNumber}</span></p>
                </div>
              </div>
              
              {/* Premium Quick Actions */}
              <div className="flex flex-col items-end gap-2 min-w-[180px]">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-lg shadow-lg text-xs px-3 py-1"
                      disabled={convertLoading}
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Quick Actions
                      <ChevronDown className="ml-2 h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={handleConvertToOrder}>
                      <Send className="h-4 w-4 mr-2" />
                      Convert to Order
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/dashboard/quotes/${quote.quoteNumber}/edit`)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Quote
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDownloadPDF}>
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleEmailClient}>
                      <Mail className="h-4 w-4 mr-2" />
                      Email to Client
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleContactAssignee}>
                      <User className="h-4 w-4 mr-2" />
                      Contact Assignee
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {convertError && <div className="text-red-600 text-xs mt-1">{convertError}</div>}
                
                <Dialog open={aiModalOpen} onOpenChange={setAiModalOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white rounded-lg shadow-lg text-xs px-3 py-1"
                      onClick={() => setAiModalOpen(true)}
                    >
                      <div className="p-1 bg-white/20 rounded-lg mr-1">
                        <Bot className="h-3 w-3 text-white" />
                      </div>
                      AI Assistant
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 max-w-2xl">
                    <DialogHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 border-b border-emerald-100/50 p-4 rounded-t-2xl">
                      <DialogTitle className="flex items-center gap-2 text-emerald-700 text-xl font-bold">
                        <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-lg shadow-lg">
                          <Bot className="h-5 w-5 text-white" />
                        </div>
                        AI Assistant
                      </DialogTitle>
                    </DialogHeader>
                    <div className="p-4 space-y-3">
                      <div className="text-sm text-emerald-700 bg-emerald-50/50 rounded-lg px-3 py-2 mb-2">{quote.aiInsights}</div>
                      <div className="text-sm text-emerald-700 bg-emerald-50/50 rounded-lg px-3 py-2 mb-2">Next Steps: {quote.aiNextSteps}</div>
                      <Textarea
                        value={aiMessage}
                        onChange={e => setAiMessage(e.target.value)}
                        placeholder="Ask AI for suggestions, follow-up messages, or analysis..."
                        className="min-h-[80px] border border-emerald-200 rounded-lg px-3 py-2 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm"
                      />
                      <Button 
                        onClick={handleAISubmit} 
                        disabled={aiLoading || !aiMessage}
                        className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-lg shadow-lg text-xs px-3 py-1"
                      >
                        {aiLoading ? 'Thinking...' : 'Ask AI'}
                      </Button>
                      {aiError && <div className="mt-2 p-3 rounded-lg bg-red-100 border border-red-200 text-sm text-red-800">{aiError}</div>}
                      {aiResponse && !aiError && (
                        <div className="mt-2 p-3 rounded-lg bg-emerald-50/50 border border-emerald-200 text-sm text-emerald-800">{aiResponse}</div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>
        
        {/* Premium Summary Cards */}
        <div className="relative z-10 max-w-7xl mx-auto mb-4 flex justify-center">
          <div className="flex justify-center gap-3 flex-wrap px-4 md:px-0">
            <Card className="w-40 flex flex-col items-center justify-center p-3 cursor-pointer border-2 shadow-lg rounded-xl bg-emerald-50/80 backdrop-blur-sm transition-all duration-300 hover:border-emerald-200 hover:scale-105">
              <CardContent className="flex flex-col items-center justify-center p-0">
                <DollarSign className="w-5 h-5 mb-1 text-emerald-600" />
                <div className="text-lg font-extrabold text-emerald-900">${quote.total.toLocaleString()}</div>
                <div className="text-xs font-medium text-emerald-700">Total Value</div>
              </CardContent>
            </Card>
            
            <Card className="w-40 flex flex-col items-center justify-center p-3 cursor-pointer border-2 shadow-lg rounded-xl bg-blue-50/80 backdrop-blur-sm transition-all duration-300 hover:border-blue-200 hover:scale-105">
              <CardContent className="flex flex-col items-center justify-center p-0">
                <User className="w-5 h-5 mb-1 text-blue-600" />
                <div className="text-lg font-extrabold text-blue-900">{quote.client}</div>
                <div className="text-xs font-medium text-blue-700">Client</div>
              </CardContent>
            </Card>
            
            <Card className="w-40 flex flex-col items-center justify-center p-3 cursor-pointer border-2 shadow-lg rounded-xl bg-yellow-50/80 backdrop-blur-sm transition-all duration-300 hover:border-yellow-200 hover:scale-105">
              <CardContent className="flex flex-col items-center justify-center p-0">
                <Calendar className="w-5 h-5 mb-1 text-yellow-600" />
                <div className="text-lg font-extrabold text-yellow-900">{quote.dueDate}</div>
                <div className="text-xs font-medium text-yellow-700">Due Date</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* AI Assistant Button */}
            {/* The AI Assistant button is now moved to the header */}

            {/* Main Quote Details Card */}
            <Card className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100/50 p-4">
                <CardTitle className="flex items-center gap-2 text-emerald-700 text-xl font-bold">
                  <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg shadow-lg">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  Quote Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-emerald-700">Client</label>
                      <p className="text-sm font-semibold text-emerald-800 bg-emerald-50/50 rounded-lg px-3 py-2">{quote.client}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-emerald-700">Assignee</label>
                      <p className="text-sm font-semibold bg-emerald-50/50 rounded-lg px-3 py-2">{quote.assignee}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-emerald-700">Due Date</label>
                      <p className="text-sm font-semibold bg-emerald-50/50 rounded-lg px-3 py-2">{quote.dueDate}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-emerald-700">Stage</label>
                      <p className="text-sm font-semibold bg-emerald-50/50 rounded-lg px-3 py-2 capitalize">{quote.stage.replace('-', ' ')}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-emerald-700">Notes</label>
                    <p className="text-sm text-gray-700 bg-emerald-50/50 rounded-lg px-3 py-2">{quote.notes}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Badge className={`${quote.status === 'on-track' ? 'bg-green-100 text-green-800' : quote.status === 'delayed' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'} rounded-lg px-3 py-1 text-xs font-semibold`}>
                    {quote.status}
                  </Badge>
                </div>
                
                <Separator className="my-4 bg-emerald-200" />
                
                <div>
                  <h4 className="font-semibold mb-3 text-emerald-700">Itemized List</h4>
                  <div className="rounded-lg border border-emerald-200 divide-y divide-emerald-100 bg-emerald-50/30">
                    {quote.items.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between items-center px-4 py-3">
                        <div className="text-sm text-emerald-800">{item.name} <span className="text-xs text-emerald-600">x{item.qty}</span></div>
                        <div className="font-semibold text-emerald-800">${(item.price * item.qty).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row md:justify-end gap-4 mt-4">
                  <div className="space-y-2 text-right bg-emerald-50/50 rounded-lg p-4">
                    <div className="text-sm">Subtotal: <span className="font-semibold text-emerald-800">${quote.subtotal.toLocaleString()}</span></div>
                    <div className="text-sm">Tax: <span className="font-semibold text-emerald-800">${quote.tax.toLocaleString()}</span></div>
                    <div className="text-lg font-bold text-emerald-700">Total: <span className="text-emerald-800">${quote.total.toLocaleString()}</span></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Client Information */}
            <Card className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 border-b border-emerald-100/50 p-4">
                <CardTitle className="text-emerald-700 text-xl font-bold">Client Information</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-emerald-700">Name</label>
                  <p className="font-semibold text-emerald-800 bg-emerald-50/50 rounded-lg px-3 py-2">{quote.client}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-emerald-700">Email</label>
                  <p className="text-sm text-gray-700 bg-emerald-50/50 rounded-lg px-3 py-2">{quote.email}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-emerald-700">Assignee</label>
                  <p className="text-sm text-gray-700 bg-emerald-50/50 rounded-lg px-3 py-2">{quote.assignee}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 