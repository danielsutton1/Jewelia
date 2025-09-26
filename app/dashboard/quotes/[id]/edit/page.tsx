"use client";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft, DollarSign, User, Calendar, FileText, Bot, Save, X, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

const mockQuote = {
  quoteNumber: "Q-2024-001",
  item: "Diamond Engagement Ring",
  client: "Sophia Chen",
  email: "sophia.chen@email.com",
  assignee: "Daniel Sutton",
  dueDate: "2024-06-30",
  status: "on-track",
  stage: "reminder",
  items: [
    { name: "1.5ct Diamond Center", qty: 1, price: 8500 },
    { name: "Platinum Band", qty: 1, price: 1200 },
    { name: "Custom Engraving", qty: 1, price: 150 },
  ],
  subtotal: 9850,
  tax: 788,
  total: 10638,
  notes: "Client requested a hidden halo and custom engraving inside the band.",
  aiInsights:
    "This quote is above average value. Consider offering a loyalty discount or suggesting matching wedding bands.",
  aiNextSteps:
    "Follow up with client to confirm ring size and engraving text. Offer financing options.",
};

export default function EditQuotePage({ params }: { params: Promise<{ id: string | string[] }> }) {
  const { id } = use(params);
  const quoteId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const [quote, setQuote] = useState(mockQuote);
  const [aiMessage, setAiMessage] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [saving, setSaving] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // Handlers for editing fields
  function handleFieldChange(field: string, value: any) {
    setQuote((q) => ({ ...q, [field]: value }));
  }
  function handleItemChange(idx: number, field: string, value: any) {
    setQuote((q) => {
      const items = [...q.items];
      items[idx] = { ...items[idx], [field]: value };
      return { ...q, items };
    });
  }
  function handleAddItem() {
    setQuote((q) => ({ ...q, items: [...q.items, { name: "", qty: 1, price: 0 }] }));
  }
  function handleRemoveItem(idx: number) {
    setQuote((q) => {
      const items = q.items.filter((_, i) => i !== idx);
      return { ...q, items };
    });
  }

  async function handleAISubmit() {
    setAiLoading(true);
    setAiResponse("");
    setAiError("");
    try {
      const res = await fetch("/api/ai-chatgpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      setAiError("Failed to contact AI service.");
    } finally {
      setAiLoading(false);
    }
  }

  function handleSave() {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast({ title: "Quote Saved", description: "Your changes have been saved." });
      router.push(`/dashboard/quotes/${quote.quoteNumber}`);
    }, 1200);
  }
  function handleCancel() {
    router.push(`/dashboard/quotes/${quote.quoteNumber}`);
  }

  // Calculate totals
  const subtotal = quote.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

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
                <Link href={`/dashboard/quotes/${quote.quoteNumber}`}>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 rounded-full shadow-lg">
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-green-700 bg-clip-text text-transparent tracking-tight">
                    Edit Quote
                  </h1>
                  <p className="text-emerald-600 text-sm font-medium">Quote Number: <span className="text-emerald-800 font-semibold">{quote.quoteNumber}</span></p>
                </div>
              </div>
              
              {/* Premium Save/Cancel Actions */}
              <div className="flex flex-col items-end gap-2 min-w-[180px]">
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-lg shadow-lg text-xs px-3 py-1"
                  >
                    <Save className="mr-1 h-3 w-3" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCancel} 
                    disabled={saving}
                    className="text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs px-3 py-1"
                  >
                    <X className="mr-1 h-3 w-3" />
                    Cancel
                  </Button>
                </div>
                
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
                <div className="text-lg font-extrabold text-emerald-900">${total.toLocaleString()}</div>
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
                <div className="text-lg font-extrabold text-yellow-900">{new Date(quote.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                <div className="text-xs font-medium text-yellow-700">Due Date</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
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
                      <Input 
                        value={quote.client} 
                        onChange={e => handleFieldChange("client", e.target.value)}
                        className="border border-emerald-200 rounded-lg px-3 py-2 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-emerald-700">Assignee</label>
                      <Input 
                        value={quote.assignee} 
                        onChange={e => handleFieldChange("assignee", e.target.value)}
                        className="border border-emerald-200 rounded-lg px-3 py-2 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-emerald-700">Due Date</label>
                      <Input 
                        type="date" 
                        value={quote.dueDate} 
                        onChange={e => handleFieldChange("dueDate", e.target.value)}
                        className="border border-emerald-200 rounded-lg px-3 py-2 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-emerald-700">Status</label>
                      <Input 
                        value={quote.status} 
                        onChange={e => handleFieldChange("status", e.target.value)}
                        className="border border-emerald-200 rounded-lg px-3 py-2 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-emerald-700">Notes</label>
                    <Textarea 
                      value={quote.notes} 
                      onChange={e => handleFieldChange("notes", e.target.value)}
                      className="border border-emerald-200 rounded-lg px-3 py-2 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm min-h-[120px]"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Badge className={`${quote.status === 'on-track' ? 'bg-green-100 text-green-800' : quote.status === 'delayed' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'} rounded-lg px-3 py-1 text-xs font-semibold`}>
                    {quote.status}
                  </Badge>
                </div>
                
                <Separator className="my-4 bg-emerald-200" />
                
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-emerald-700">Itemized List</h4>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleAddItem}
                      className="text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs px-3 py-1"
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Add Item
                    </Button>
                  </div>
                  <div className="rounded-lg border border-emerald-200 divide-y divide-emerald-100 bg-emerald-50/30">
                    {quote.items.map((item, idx) => (
                      <div key={idx} className="flex flex-col md:flex-row md:items-center gap-2 px-4 py-3">
                        <Input
                          className="md:w-1/3 border border-emerald-200 rounded-lg px-3 py-2 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm"
                          value={item.name}
                          onChange={e => handleItemChange(idx, "name", e.target.value)}
                          placeholder="Item Name"
                        />
                        <Input
                          className="md:w-1/6 border border-emerald-200 rounded-lg px-3 py-2 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm"
                          type="number"
                          value={item.qty}
                          onChange={e => handleItemChange(idx, "qty", Number(e.target.value))}
                          placeholder="Qty"
                        />
                        <Input
                          className="md:w-1/4 border border-emerald-200 rounded-lg px-3 py-2 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm"
                          type="number"
                          value={item.price}
                          onChange={e => handleItemChange(idx, "price", Number(e.target.value))}
                          placeholder="Price"
                        />
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleRemoveItem(idx)}
                          className="text-red-600 hover:bg-red-100 rounded-lg text-xs px-3 py-1"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row md:justify-end gap-4 mt-4">
                  <div className="space-y-2 text-right bg-emerald-50/50 rounded-lg p-4">
                    <div className="text-sm">Subtotal: <span className="font-semibold text-emerald-800">${subtotal.toLocaleString()}</span></div>
                    <div className="text-sm">Tax: <span className="font-semibold text-emerald-800">${tax.toLocaleString()}</span></div>
                    <div className="text-lg font-bold text-emerald-700">Total: <span className="text-emerald-800">${total.toLocaleString()}</span></div>
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
                  <Input 
                    value={quote.client} 
                    onChange={e => handleFieldChange("client", e.target.value)}
                    className="border border-emerald-200 rounded-lg px-3 py-2 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-emerald-700">Email</label>
                  <Input 
                    value={quote.email} 
                    onChange={e => handleFieldChange("email", e.target.value)}
                    className="border border-emerald-200 rounded-lg px-3 py-2 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-emerald-700">Assignee</label>
                  <Input 
                    value={quote.assignee} 
                    onChange={e => handleFieldChange("assignee", e.target.value)}
                    className="border border-emerald-200 rounded-lg px-3 py-2 bg-white/80 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 