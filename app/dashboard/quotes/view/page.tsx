"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft, Edit, Download, Send, Printer, FileText, DollarSign, Calendar, User, Phone, Mail, MapPin, Package, Clock } from "lucide-react";

interface QuoteItem {
  id: string;
  type: "product" | "custom" | "service";
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  discountType: "percentage" | "amount";
  total: number;
}

interface QuoteDetails {
  quoteNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  createdDate: Date;
  validUntil: Date;
  notes: string;
  status: "draft" | "sent" | "accepted" | "declined" | "expired";
  total: number;
  subtotal: number;
  tax: number;
  taxRate: number;
  discountTotal: number;
  depositRequired: boolean;
  depositAmount: number;
  depositType: "percentage" | "amount";
  selectedTier: "tier1" | "tier2" | "tier3";
  termsAndConditions: string;
}

export default function ViewQuotePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quoteId = searchParams.get('quoteId');
  
  const [quoteDetails, setQuoteDetails] = useState<QuoteDetails | null>(null);
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadQuote = async () => {
      if (!quoteId) {
        setError("No quote ID provided");
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 Loading quote with ID:', quoteId);
        
        const response = await fetch(`/api/quotes?search=${quoteId}`);
        const result = await response.json();
        
        console.log('🔍 API response:', result);
        console.log('🔍 API response data length:', result.data?.length);
        console.log('🔍 API response data:', result.data);
        
        if (result.success && result.data.length > 0) {
          // Find the exact quote we're looking for
          let quote = result.data.find((q: any) => (q.quote_number || q.quoteNumber) === quoteId);
          
          console.log('🔍 Looking for quote:', quoteId);
          console.log('🔍 Available quotes:', result.data.map((q: any) => q.quote_number || q.quoteNumber));
          
          // If exact match not found, use the first result
          if (!quote) {
            console.log('⚠️ Exact quote match not found, using first result');
            quote = result.data[0];
          }
          
          console.log('✅ Found existing quote:', quote);
          console.log('✅ Quote details:', {
            quoteNumber: quote.quote_number || quote.quoteNumber,
            customer: quote.customer_details?.full_name || quote.customer || quote.customer_name,
            total: quote.total_amount || quote.total,
            status: quote.status,
            items: quote.items
          });
          
          // Parse quote details
          const details: QuoteDetails = {
            quoteNumber: quote.quote_number || quote.quoteNumber,
            customerName: quote.customer_details?.full_name || quote.customer || quote.customer_name || '',
            customerEmail: quote.customer_details?.email || quote.customer_email || '',
            customerPhone: quote.customer_phone || '',
            customerAddress: quote.customer_address || '',
            createdDate: new Date(quote.created_at || quote.created),
            validUntil: new Date(quote.valid_until || quote.validUntil),
            notes: quote.notes || '',
            status: quote.status || 'draft',
            total: quote.total_amount || quote.total || 0,
            subtotal: quote.subtotal || (quote.total_amount || quote.total || 0),
            tax: quote.tax_amount || quote.tax || 0,
            taxRate: quote.tax_rate || 8.25,
            discountTotal: quote.discount_total || 0,
            depositRequired: quote.deposit_required ?? true,
            depositAmount: quote.deposit_amount || 30,
            depositType: quote.deposit_type || 'percentage',
            selectedTier: quote.selected_tier || 'tier1',
            termsAndConditions: quote.terms_and_conditions || '',
          };
          
          setQuoteDetails(details);
          
          // Parse quote items
          if (quote.items && Array.isArray(quote.items) && quote.items.length > 0) {
            console.log('✅ Loaded quote items:', quote.items);
            setQuoteItems(quote.items);
          } else if (quote.item && typeof quote.item === 'string' && quote.item !== 'N/A') {
            // Create a single item from the item string
            const singleItem: QuoteItem = {
              id: `item-${Date.now()}`,
              type: 'custom',
              name: quote.item,
              description: quote.item,
              quantity: 1,
              unitPrice: quote.total_amount || quote.total || 0,
              discount: 0,
              discountType: 'amount',
              total: quote.total_amount || quote.total || 0,
            };
            setQuoteItems([singleItem]);
            console.log('✅ Created single quote item:', singleItem);
          } else {
            console.log('❌ No quote items found');
            setQuoteItems([]);
          }
        } else {
          console.log('❌ No quotes found in API response');
          setError(`Quote ${quoteId} not found. Please check the quote number and try again.`);
        }
      } catch (error) {
        console.error('Error loading quote:', error);
        setError("Failed to load quote. Please try again or contact support if the issue persists.");
      } finally {
        setLoading(false);
      }
    };

    loadQuote();
  }, [quoteId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEdit = () => {
    if (quoteDetails) {
      router.push(`/dashboard/quotes/create?quoteId=${quoteDetails.quoteNumber}`);
    }
  };

  const handleBack = () => {
    router.push('/dashboard/quotes');
  };

  const handleSendQuote = () => {
    toast({
      title: "Quote Sent",
      description: `Quote ${quoteDetails?.quoteNumber} has been sent to ${quoteDetails?.customerName}`,
    });
  };

  const handleDownloadPDF = () => {
    toast({
      title: "PDF Download",
      description: "PDF download functionality will be implemented soon.",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading quote...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !quoteDetails) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="mb-4">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Quote Not Found</h2>
              <p className="text-red-600 mb-4">{error || `Quote ${quoteId} not found`}</p>
              <p className="text-sm text-gray-600 mb-6">
                The quote you're looking for may have been moved, deleted, or the quote number may be incorrect.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button onClick={handleBack} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Quotes
              </Button>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Quote #{quoteDetails.quoteNumber}</h1>
            <p className="text-muted-foreground">Viewing saved quote details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Quote
          </Button>
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button variant="outline" onClick={handleSendQuote}>
            <Send className="mr-2 h-4 w-4" />
            Send Quote
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      {/* Quote Status */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Badge className={getStatusColor(quoteDetails.status)}>
                {quoteDetails.status.toUpperCase()}
              </Badge>
              <span className="text-sm text-muted-foreground flex items-center">
                <Calendar className="mr-1 h-3 w-3" />
                Created: {formatDate(quoteDetails.createdDate)}
              </span>
              <span className="text-sm text-muted-foreground flex items-center">
                <Clock className="mr-1 h-3 w-3" />
                Valid until: {formatDate(quoteDetails.validUntil)}
              </span>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(quoteDetails.total)}
              </p>
              <p className="text-sm text-muted-foreground">Total Amount</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-semibold">{quoteDetails.customerName}</p>
              {quoteDetails.customerEmail && (
                <p className="text-sm text-muted-foreground flex items-center">
                  <Mail className="mr-1 h-3 w-3" />
                  {quoteDetails.customerEmail}
                </p>
              )}
              {quoteDetails.customerPhone && (
                <p className="text-sm text-muted-foreground flex items-center">
                  <Phone className="mr-1 h-3 w-3" />
                  {quoteDetails.customerPhone}
                </p>
              )}
              {quoteDetails.customerAddress && (
                <p className="text-sm text-muted-foreground flex items-center">
                  <MapPin className="mr-1 h-3 w-3" />
                  {quoteDetails.customerAddress}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quote Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-4 w-4" />
              Quote Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(quoteDetails.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax ({quoteDetails.taxRate}%):</span>
              <span>{formatCurrency(quoteDetails.tax)}</span>
            </div>
            {quoteDetails.discountTotal > 0 && (
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>-{formatCurrency(quoteDetails.discountTotal)}</span>
              </div>
            )}
            <div className="border-t pt-2">
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>{formatCurrency(quoteDetails.total)}</span>
              </div>
            </div>
            {quoteDetails.depositRequired && (
              <div className="border-t pt-2">
                <div className="flex justify-between text-sm">
                  <span>Deposit ({quoteDetails.depositAmount}{quoteDetails.depositType === 'percentage' ? '%' : ''}):</span>
                  <span>{formatCurrency(quoteDetails.depositAmount)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quote Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Quote Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-semibold">Quote Number</p>
              <p className="text-sm text-muted-foreground">{quoteDetails.quoteNumber}</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Created Date</p>
              <p className="text-sm text-muted-foreground">{formatDate(quoteDetails.createdDate)}</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Valid Until</p>
              <p className="text-sm text-muted-foreground">{formatDate(quoteDetails.validUntil)}</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Status</p>
              <Badge className={getStatusColor(quoteDetails.status)}>
                {quoteDetails.status.toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quote Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="mr-2 h-4 w-4" />
            Quote Items ({quoteItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {quoteItems.length > 0 ? (
            <div className="space-y-4">
              {quoteItems.map((item, index) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm">
                        <span>Qty: {item.quantity}</span>
                        <span>Price: {formatCurrency(item.unitPrice)}</span>
                        {item.discount > 0 && (
                          <span>Discount: {item.discount}{item.discountType === 'percentage' ? '%' : ''}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(item.total)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No items added to quote</p>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {quoteDetails.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{quoteDetails.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Terms and Conditions */}
      {quoteDetails.termsAndConditions && (
        <Card>
          <CardHeader>
            <CardTitle>Terms and Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{quoteDetails.termsAndConditions}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 