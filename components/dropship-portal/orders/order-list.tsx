import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface Order {
  id: string;
  customerName: string;
  itemsCount: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered';
  orderDate: string; // ISO string
  totalAmount: number;
}

interface OrderListProps {
  onSelectOrder?: (orderId: string) => void;
  filterStatus?: string;
}

const STATUS_COLORS: Record<Order['status'], string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Processing: 'bg-blue-100 text-blue-800',
  Shipped: 'bg-green-100 text-green-800',
  Delivered: 'bg-gray-200 text-gray-700',
};

// Mock data for demonstration
const MOCK_ORDERS: Order[] = Array.from({ length: 37 }).map((_, i) => ({
  id: `ORD-${1000 + i}`,
  customerName: ['Alice Smith', 'Bob Jones', 'Cathy Lee', 'David Kim', 'Eva Brown'][i % 5],
  itemsCount: Math.floor(Math.random() * 5) + 1,
  status: (['Pending', 'Processing', 'Shipped', 'Delivered'] as Order['status'][])[i % 4],
  orderDate: new Date(Date.now() - i * 86400000).toISOString(),
  totalAmount: Math.round((Math.random() * 500 + 50) * 100) / 100,
}));

const PAGE_SIZE = 10;

type SortKey = 'orderDate' | 'status' | 'totalAmount';
type SortOrder = 'asc' | 'desc';

export function OrderList({ onSelectOrder, filterStatus }: OrderListProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>('orderDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const filteredOrders = useMemo(() => {
    let orders = MOCK_ORDERS.filter(
      o =>
        (filterStatus ? o.status.toLowerCase() === filterStatus.toLowerCase() : true) &&
        (o.id.toLowerCase().includes(search.toLowerCase()) ||
          o.customerName.toLowerCase().includes(search.toLowerCase()))
    );
    orders = orders.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'orderDate') {
        cmp = new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime();
      } else if (sortKey === 'status') {
        cmp = a.status.localeCompare(b.status);
      } else if (sortKey === 'totalAmount') {
        cmp = a.totalAmount - b.totalAmount;
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return orders;
  }, [search, sortKey, sortOrder, filterStatus]);

  const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE);
  const paginatedOrders = filteredOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <Input
            placeholder="Search by Order ID or Customer Name"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-64"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="p-2 text-left">Order ID</th>
                <th className="p-2 text-left">Customer Name</th>
                <th className="p-2 text-center">Items</th>
                <th className="p-2 text-left cursor-pointer" onClick={() => handleSort('status')}>
                  Status {sortKey === 'status' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th className="p-2 text-left cursor-pointer" onClick={() => handleSort('orderDate')}>
                  Order Date {sortKey === 'orderDate' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th className="p-2 text-right cursor-pointer" onClick={() => handleSort('totalAmount')}>
                  Total {sortKey === 'totalAmount' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th className="p-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-muted-foreground">No orders found.</td>
                </tr>
              ) : (
                paginatedOrders.map(order => (
                  <tr key={order.id} className="border-b hover:bg-accent/30">
                    <td className="p-2 font-mono">{order.id}</td>
                    <td className="p-2">{order.customerName}</td>
                    <td className="p-2 text-center">{order.itemsCount}</td>
                    <td className="p-2">
                      <span className={`inline-block rounded px-2 py-1 text-xs font-semibold ${STATUS_COLORS[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-2">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                    <td className="p-2 text-right">${order.totalAmount.toFixed(2)}</td>
                    <td className="p-2 text-center space-x-2">
                      <Button onClick={() => onSelectOrder?.(order.id)}>View Details</Button>
                      <Button onClick={() => alert(`Tracking order ${order.id}`)}>Track Order</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <div className="space-x-2">
            <Button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              Previous
            </Button>
            <Button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 