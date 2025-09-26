import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Types
interface OrderItem {
  name: string;
  sku: string;
  price: number;
  quantity: number;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  shippingAddress: string;
}

interface OrderSummary {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

interface StatusEvent {
  status: string;
  date: string;
  note?: string;
}

interface OrderDetailData {
  id: string;
  customer: CustomerInfo;
  items: OrderItem[];
  summary: OrderSummary;
  statusTimeline: StatusEvent[];
}

interface OrderDetailProps {
  orderId: string;
  onBack?: () => void;
}

export function OrderDetail({ orderId, onBack }: OrderDetailProps) {
  const [order, setOrder] = useState<OrderDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/dropship/orders/${orderId}`)
      .then(res => res.json())
      .then(data => {
        setOrder(data.order);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load order');
        setLoading(false);
      });
  }, [orderId]);

  const handleStatusUpdate = async () => {
    setUpdatingStatus(true);
    await fetch(`/api/dropship/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setStatusModalOpen(false);
    setUpdatingStatus(false);
    // Refetch order
    setLoading(true);
    fetch(`/api/dropship/orders/${orderId}`)
      .then(res => res.json())
      .then(data => {
        setOrder(data.order);
        setLoading(false);
      });
  };

  const handlePrintInvoice = () => {
    if (!order) return;
    const doc = new jsPDF();
    doc.text(`Invoice for Order ${order.id}`, 10, 10);
    const tableResult = autoTable(doc, {
      startY: 20,
      head: [['Jewelry Name', 'SKU', 'Price', 'Qty', 'Subtotal']],
      body: order.items.map(item => [
        item.name,
        item.sku,
        `$${item.price.toFixed(2)}`,
        item.quantity,
        `$${(item.price * item.quantity).toFixed(2)}`
      ]),
    });
    const y = (tableResult as any).finalY || 30;
    doc.text(`Subtotal: $${order.summary.subtotal.toFixed(2)}`, 10, y + 10);
    doc.text(`Tax: $${order.summary.tax.toFixed(2)}`, 10, y + 20);
    doc.text(`Shipping: $${order.summary.shipping.toFixed(2)}`, 10, y + 30);
    doc.text(`Total: $${order.summary.total.toFixed(2)}`, 10, y + 40);
    doc.save(`invoice-${order.id}.pdf`);
  };

  const handleSendEmail = async () => {
    await fetch(`/api/dropship/orders/${orderId}/send-email`, { method: 'POST' });
    alert('Email sent!');
  };

  if (loading) return <div>Loading...</div>;
  if (error || !order) return <div className="text-red-500">{error || 'Order not found'}</div>;

  return (
    <div className="space-y-6">
      <Button onClick={() => onBack?.()} className="mb-2">Back</Button>
      {/* Customer Info */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="font-semibold">Name:</div>
              <div>{order.customer.name}</div>
            </div>
            <div>
              <div className="font-semibold">Email:</div>
              <div>{order.customer.email}</div>
            </div>
            <div>
              <div className="font-semibold">Phone:</div>
              <div>{order.customer.phone}</div>
            </div>
            <div className="md:col-span-2">
              <div className="font-semibold">Shipping Address:</div>
              <div>{order.customer.shippingAddress}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="min-w-full text-sm border">
            <thead>
              <tr className="bg-muted">
                <th className="p-2 text-left">Jewelry Name</th>
                <th className="p-2 text-left">SKU</th>
                <th className="p-2 text-right">Price</th>
                <th className="p-2 text-center">Quantity</th>
                <th className="p-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={item.sku} className={idx % 2 === 0 ? '' : 'bg-accent/10'}>
                  <td className="p-2">{item.name}</td>
                  <td className="p-2">{item.sku}</td>
                  <td className="p-2 text-right">${item.price.toFixed(2)}</td>
                  <td className="p-2 text-center">{item.quantity}</td>
                  <td className="p-2 text-right">${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-xs space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${order.summary.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>${order.summary.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>${order.summary.shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold border-t pt-2">
              <span>Total</span>
              <span>${order.summary.total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Order Status Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="relative border-l border-gray-300 ml-4">
            {order.statusTimeline.map((event, idx) => (
              <li key={idx} className="mb-6 ml-6">
                <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 ring-2 ring-white">
                  {idx + 1}
                </span>
                <div className="flex flex-col">
                  <span className="font-semibold">{event.status}</span>
                  <span className="text-xs text-muted-foreground">{new Date(event.date).toLocaleString()}</span>
                  {event.note && <span className="text-xs">{event.note}</span>}
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={() => setStatusModalOpen(true)}>Update Status</Button>
        <Button onClick={handlePrintInvoice}>Print Invoice</Button>
        <Button onClick={handleSendEmail}>Send Email</Button>
      </div>

      {/* Status Update Modal */}
      {statusModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-xs">
            <h3 className="font-bold mb-2">Update Order Status</h3>
            <select
              value={newStatus}
              onChange={e => setNewStatus(e.target.value)}
              className="w-full border p-2 mb-4"
            >
              <option value="">Select status</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
            </select>
            <div className="flex gap-2">
              <Button onClick={handleStatusUpdate} disabled={!newStatus || updatingStatus}>
                {updatingStatus ? 'Updating...' : 'Update'}
              </Button>
              <Button onClick={() => setStatusModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 