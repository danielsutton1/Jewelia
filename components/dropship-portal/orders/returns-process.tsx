import React, { useState, useEffect } from 'react';
import { Search, Upload, Download, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { createBrowserClient } from '@supabase/ssr';
import { format } from 'date-fns';

// Types
type ReturnReason = 
  | 'defective'
  | 'wrong_size'
  | 'changed_mind'
  | 'quality_issue'
  | 'damaged'
  | 'not_as_described'
  | 'wrong_item'
  | 'other';

type ConditionRating = 'excellent' | 'good' | 'fair' | 'poor';

interface Customer {
  full_name: string;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  items: OrderItem[];
}

interface ReturnRequest {
  id: string;
  orderId: string;
  customerId: string;
  reason: ReturnReason;
  condition: ConditionRating;
  description: string;
  photos: string[];
  refundAmount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const RETURN_REASONS = [
  { value: 'defective', label: 'Defective Product' },
  { value: 'wrong_size', label: 'Wrong Size' },
  { value: 'changed_mind', label: 'Changed Mind' },
  { value: 'quality_issue', label: 'Quality Issue' },
  { value: 'damaged', label: 'Damaged During Shipping' },
  { value: 'not_as_described', label: 'Not as Described' },
  { value: 'wrong_item', label: 'Wrong Item Received' },
  { value: 'other', label: 'Other' },
];

const CONDITION_RATINGS = [
  { value: 'excellent', label: 'Excellent - Like New' },
  { value: 'good', label: 'Good - Minor Wear' },
  { value: 'fair', label: 'Fair - Visible Wear' },
  { value: 'poor', label: 'Poor - Significant Damage' },
];

export function ReturnsProcess() {
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [returnReason, setReturnReason] = useState<ReturnReason>('defective');
  const [condition, setCondition] = useState<ConditionRating>('excellent');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);
  const { toast } = useToast();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchReturnRequests();
  }, []);

  const fetchReturnRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('return_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReturnRequests(data.map((request: any) => ({
        ...request,
        createdAt: new Date(request.created_at),
        updatedAt: new Date(request.updated_at),
      })));
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch return requests: ' + error.message,
        variant: 'destructive',
      });
    }
  };

  const handleOrderSearch = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          customer:customers!inner(full_name),
          total_amount,
          items:order_items(
            id,
            name,
            price,
            quantity
          )
        `)
        .eq('order_number', orderSearch)
        .single();

      if (error) throw error;
      if (!data) {
        toast({
          title: 'Not Found',
          description: 'Order not found',
          variant: 'destructive',
        });
        return;
      }

      // Type assertion for Supabase response
      const orderData = data as unknown as {
        id: string;
        order_number: string;
        customer: { full_name: string };
        total_amount: number;
        items: OrderItem[];
      };

      setSelectedOrder({
        id: orderData.id,
        orderNumber: orderData.order_number,
        customerName: orderData.customer.full_name,
        totalAmount: orderData.total_amount,
        items: orderData.items,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch order: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setPhotos(prev => [...prev, ...files]);

    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const handleSubmit = async () => {
    try {
      if (!selectedOrder) {
        toast({
          title: 'Error',
          description: 'Please select an order first',
          variant: 'destructive',
        });
        return;
      }

      setLoading(true);

      // Upload photos
      const photoUrls = await Promise.all(
        photos.map(async (photo) => {
          const fileExt = photo.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const { error: uploadError, data } = await supabase.storage
            .from('return-photos')
            .upload(fileName, photo);

          if (uploadError) throw uploadError;
          return data.path;
        })
      );

      // Calculate refund amount based on condition
      let refundAmount = selectedOrder.totalAmount;
      switch (condition) {
        case 'excellent':
          refundAmount *= 1;
          break;
        case 'good':
          refundAmount *= 0.9;
          break;
        case 'fair':
          refundAmount *= 0.7;
          break;
        case 'poor':
          refundAmount *= 0.5;
          break;
      }

      // Create return request
      const { data, error } = await supabase
        .from('return_requests')
        .insert([{
          order_id: selectedOrder.id,
          reason: returnReason,
          condition,
          description,
          photos: photoUrls,
          refund_amount: refundAmount,
          status: 'pending',
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Return request submitted successfully',
      });

      // Reset form
      setSelectedOrder(null);
      setReturnReason('defective');
      setCondition('excellent');
      setDescription('');
      setPhotos([]);
      setPreviewUrls([]);
      setOrderSearch('');

      // Refresh return requests
      fetchReturnRequests();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to submit return request: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateShippingLabel = async (returnRequestId: string) => {
    try {
      // Implement shipping label generation logic
      // This would typically integrate with a shipping provider API
      toast({
        title: 'Success',
        description: 'Shipping label generated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to generate shipping label: ' + error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Process Returns</h2>
      </div>

      {/* Order Search */}
      <Card className="p-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <Label>Order Number</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter order number"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
              />
              <Button onClick={handleOrderSearch} disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Return Form */}
      {selectedOrder && (
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Order Details</h3>
              <p>Order Number: {selectedOrder.orderNumber}</p>
              <p>Customer: {selectedOrder.customerName}</p>
              <p>Total Amount: ${selectedOrder.totalAmount.toFixed(2)}</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label>Return Reason</Label>
                <Select value={returnReason} onValueChange={(value: ReturnReason) => setReturnReason(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {RETURN_REASONS.map(reason => (
                      <SelectItem key={reason.value} value={reason.value}>
                        {reason.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Condition Assessment</Label>
                <Select value={condition} onValueChange={(value: ConditionRating) => setCondition(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITION_RATINGS.map(rating => (
                      <SelectItem key={rating.value} value={rating.value}>
                        {rating.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Describe the reason for return in detail"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div>
              <Label>Upload Photos</Label>
              <div className="mt-2">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                </div>
                {previewUrls.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 gap-4">
                    {previewUrls.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSubmit} disabled={loading}>
                Submit Return Request
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Return Requests List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recent Return Requests</h3>
        {returnRequests.map(request => (
          <Card key={request.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">Order {request.orderId}</span>
                  <Badge variant="outline" className={
                    request.status === 'completed' ? 'bg-green-100 text-green-800' :
                    request.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                    request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Created: {format(request.createdAt, 'MMM d, yyyy h:mm a')}
                </p>
              </div>
              <div className="flex space-x-2">
                {request.status === 'approved' && (
                  <Button
                    onClick={() => generateShippingLabel(request.id)}
                    className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Shipping Label
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 