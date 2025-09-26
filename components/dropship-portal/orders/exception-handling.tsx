import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, Mail, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { createBrowserClient } from '@supabase/ssr';

// Types
type ExceptionSeverity = 'high' | 'medium' | 'low';
type ExceptionType = 
  | 'payment_failed' 
  | 'out_of_stock' 
  | 'shipping_delay' 
  | 'quality_issue' 
  | 'customization_error'
  | 'inventory_mismatch'
  | 'production_delay'
  | 'customer_communication'
  | 'pricing_error'
  | 'return_request';

interface Exception {
  id: string;
  orderId: string;
  type: ExceptionType;
  severity: ExceptionSeverity;
  description: string;
  createdAt: Date;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  customerEmail?: string;
  customerPhone?: string;
  assignedTo?: string;
  notes?: string;
}

const EXCEPTION_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'payment_failed', label: 'Payment Failed' },
  { value: 'out_of_stock', label: 'Out of Stock' },
  { value: 'shipping_delay', label: 'Shipping Delay' },
  { value: 'quality_issue', label: 'Quality Issue' },
  { value: 'customization_error', label: 'Customization Error' },
  { value: 'inventory_mismatch', label: 'Inventory Mismatch' },
  { value: 'production_delay', label: 'Production Delay' },
  { value: 'customer_communication', label: 'Customer Communication' },
  { value: 'pricing_error', label: 'Pricing Error' },
  { value: 'return_request', label: 'Return Request' },
];

const getSeverityColor = (severity: ExceptionSeverity) => {
  switch (severity) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'medium':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'low':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  }
};

const getExceptionIcon = (type: ExceptionType) => {
  switch (type) {
    case 'payment_failed':
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    case 'out_of_stock':
      return <AlertTriangle className="h-5 w-5 text-orange-500" />;
    case 'shipping_delay':
      return <Info className="h-5 w-5 text-yellow-500" />;
    case 'quality_issue':
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    case 'customization_error':
      return <AlertTriangle className="h-5 w-5 text-orange-500" />;
    case 'inventory_mismatch':
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    case 'production_delay':
      return <AlertTriangle className="h-5 w-5 text-orange-500" />;
    case 'customer_communication':
      return <Mail className="h-5 w-5 text-blue-500" />;
    case 'pricing_error':
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    case 'return_request':
      return <ArrowUpRight className="h-5 w-5 text-purple-500" />;
    default:
      return <AlertCircle className="h-5 w-5 text-gray-500" />;
  }
};

export function ExceptionHandling() {
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchExceptions();
  }, []);

  const fetchExceptions = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('order_exceptions')
        .select(`
          *,
          order:orders(
            id,
            customer:customers(
              email,
              phone
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedExceptions = data.map((exception: any) => ({
        ...exception,
        createdAt: new Date(exception.created_at),
        resolvedAt: exception.resolved_at ? new Date(exception.resolved_at) : undefined,
        customerEmail: exception.order?.customer?.email,
        customerPhone: exception.order?.customer?.phone,
      }));

      setExceptions(formattedExceptions);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch exceptions: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (exceptionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('order_exceptions')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: user.id,
        })
        .eq('id', exceptionId);

      if (error) throw error;

      setExceptions(exceptions.map(exception => 
        exception.id === exceptionId 
          ? { 
              ...exception, 
              resolved: true, 
              resolvedAt: new Date(),
              resolvedBy: user.id 
            }
          : exception
      ));

      toast({
        title: 'Success',
        description: 'Exception marked as resolved',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to resolve exception: ' + error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEscalate = async (exceptionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('order_exceptions')
        .update({
          escalated: true,
          escalated_at: new Date().toISOString(),
          escalated_by: user.id,
        })
        .eq('id', exceptionId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Exception has been escalated',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to escalate exception: ' + error.message,
        variant: 'destructive',
      });
    }
  };

  const handleContactCustomer = async (exceptionId: string) => {
    const exception = exceptions.find(e => e.id === exceptionId);
    if (!exception?.customerEmail) {
      toast({
        title: 'Error',
        description: 'No customer email available',
        variant: 'destructive',
      });
      return;
    }

    // Open email client
    window.location.href = `mailto:${exception.customerEmail}?subject=Order ${exception.orderId} - ${exception.type}`;
  };

  const filteredExceptions = exceptions.filter(exception => 
    selectedType === 'all' || exception.type === selectedType
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Order Exceptions</h2>
        <div className="w-64">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              {EXCEPTION_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredExceptions.map(exception => (
          <Card key={exception.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="mt-1">
                  {getExceptionIcon(exception.type)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">Order {exception.orderId}</span>
                    <Badge variant="outline" className={getSeverityColor(exception.severity)}>
                      {exception.severity.charAt(0).toUpperCase() + exception.severity.slice(1)}
                    </Badge>
                    {exception.resolved && (
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Resolved
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{exception.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Created: {format(exception.createdAt, 'MMM d, yyyy h:mm a')}</span>
                    {exception.customerEmail && (
                      <span>Customer: {exception.customerEmail}</span>
                    )}
                  </div>
                </div>
              </div>
              {!exception.resolved && (
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleResolve(exception.id)}
                    className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
                  >
                    Resolve
                  </Button>
                  <Button
                    onClick={() => handleEscalate(exception.id)}
                    className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
                  >
                    Escalate
                  </Button>
                  <Button
                    onClick={() => handleContactCustomer(exception.id)}
                    className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
                  >
                    Contact Customer
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 