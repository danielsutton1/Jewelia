import React, { useState } from 'react';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Download } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import type { DateRange } from 'react-day-picker';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Processing', label: 'Processing' },
  { value: 'Shipped', label: 'Shipped' },
  { value: 'Delivered', label: 'Delivered' },
];

// Utility function to convert orders to CSV format
const convertOrdersToCSV = (orders: any[]) => {
  const headers = [
    'Order ID',
    'Order Number',
    'Date',
    'Customer',
    'Status',
    'Total Amount',
    'Items Count',
    'Payment Status',
  ];

  const rows = orders.map(order => [
    order.id,
    order.orderNumber || '',
    new Date(order.created_at).toLocaleDateString(),
    order.customer?.full_name || '',
    order.status,
    order.total_amount.toFixed(2),
    order.items?.length || 0,
    order.payment_status || '',
  ]);

  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
};

// Utility function to download CSV file
const downloadCSV = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export function OrderFilters({ onFiltersChange, orders = [] }: { onFiltersChange: (filters: any) => void; orders?: any[] }) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [status, setStatus] = useState('');
  const [customer, setCustomer] = useState('');
  const [minTotal, setMinTotal] = useState('');
  const [maxTotal, setMaxTotal] = useState('');

  const handleClear = () => {
    setDateRange(undefined);
    setStatus('');
    setCustomer('');
    setMinTotal('');
    setMaxTotal('');
    onFiltersChange({});
  };

  const handleApply = () => {
    onFiltersChange({
      dateRange,
      status,
      customer,
      minTotal: minTotal ? parseFloat(minTotal) : undefined,
      maxTotal: maxTotal ? parseFloat(maxTotal) : undefined,
    });
  };

  const handleExportCSV = () => {
    // Filter orders based on current filters
    const filteredOrders = orders.filter(order => {
      const matchesDateRange = !dateRange?.from || !dateRange?.to || 
        (new Date(order.created_at) >= dateRange.from && new Date(order.created_at) <= dateRange.to);
      const matchesStatus = !status || order.status === status;
      const matchesCustomer = !customer || 
        order.customer?.full_name?.toLowerCase().includes(customer.toLowerCase());
      const matchesTotal = (!minTotal || order.total_amount >= parseFloat(minTotal)) &&
        (!maxTotal || order.total_amount <= parseFloat(maxTotal));

      return matchesDateRange && matchesStatus && matchesCustomer && matchesTotal;
    });

    // Generate CSV content
    const csvContent = convertOrdersToCSV(filteredOrders);
    
    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0];
    const filename = `orders-export-${date}.csv`;
    
    // Download the file
    downloadCSV(csvContent, filename);
  };

  return (
    <div className="flex flex-wrap gap-4 items-end bg-white p-4 rounded shadow">
      <div className="flex flex-col gap-1">
        <Label>Date Range</Label>
        <DatePickerWithRange dateRange={dateRange} onDateRangeChange={setDateRange} />
      </div>
      <div className="flex flex-col gap-1 min-w-[140px]">
        <Label>Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1 min-w-[180px]">
        <Label>Customer</Label>
        <Input
          placeholder="Search customer"
          value={customer}
          onChange={e => setCustomer(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1 min-w-[160px]">
        <Label>Order Total</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            min={0}
            placeholder="Min"
            value={minTotal}
            onChange={e => setMinTotal(e.target.value)}
            className="w-20"
          />
          <span className="self-center">-</span>
          <Input
            type="number"
            min={0}
            placeholder="Max"
            value={maxTotal}
            onChange={e => setMaxTotal(e.target.value)}
            className="w-20"
          />
        </div>
      </div>
      <div className="flex gap-2 mt-6">
        <Button onClick={handleClear} type="button">Clear</Button>
        <Button onClick={handleApply} type="button">Apply</Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExportCSV}>Export as CSV</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
} 