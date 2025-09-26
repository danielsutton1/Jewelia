import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, Mail, Calendar, AlertTriangle } from "lucide-react";

interface WorkOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  itemDescription: string;
  dueDate: string;
  priority: string;
  assignedTo: string;
  status?: string;
  notes?: string;
}

interface DesignLogTableProps {
  orders: WorkOrder[];
}

export const DesignLogTable: React.FC<DesignLogTableProps> = ({ orders }) => {
  const [search, setSearch] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);

  const filteredOrders = orders.filter(order =>
    (search === "" ||
      order.customerName.toLowerCase().includes(search.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      (order.itemDescription && order.itemDescription.toLowerCase().includes(search.toLowerCase()))
    ) &&
    (!assigneeFilter || order.assignedTo === assigneeFilter) &&
    (!priorityFilter || order.priority === priorityFilter)
  );

  const assignees = Array.from(new Set(orders.map(o => o.assignedTo).filter(Boolean)));

  return (
    <div className="luxury-design-log-table">
      <div className="flex flex-wrap gap-4 mb-4 items-end">
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by customer, order #, or item..."
          className="w-72"
        />
        <select
          value={assigneeFilter || ""}
          onChange={e => setAssigneeFilter(e.target.value || null)}
          className="border rounded px-2 py-1"
        >
          <option value="">All Assignees</option>
          {assignees.map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <select
          value={priorityFilter || ""}
          onChange={e => setPriorityFilter(e.target.value || null)}
          className="border rounded px-2 py-1"
        >
          <option value="">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
      <div className="overflow-x-auto rounded-lg luxury-table-wrapper">
        <table className="min-w-full bg-white luxury-table">
          <thead>
            <tr>
              <th className="px-3 py-2 text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap">Order #</th>
              <th className="px-3 py-2 text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap">Customer</th>
              <th className="px-3 py-2 text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap">Item</th>
              <th className="px-3 py-2 text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap">Due Date</th>
              <th className="px-3 py-2 text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap">Priority</th>
              <th className="px-3 py-2 text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap">Assignee</th>
              <th className="px-3 py-2 text-xs font-bold text-emerald-700 uppercase tracking-wider whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400">No design orders found.</td>
              </tr>
            ) : (
              filteredOrders.map(order => (
                <tr key={order.id} className="border-b hover:bg-emerald-50/60 transition luxury-row">
                  <td className="px-3 py-2 font-semibold text-emerald-900 whitespace-nowrap">{order.orderNumber}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{order.customerName}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{order.itemDescription}</td>
                  <td className="px-3 py-2 whitespace-nowrap flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-emerald-600" />
                    {new Date(order.dueDate).toLocaleDateString()}
                    {new Date(order.dueDate) < new Date() && (
                      <Badge variant="destructive" className="ml-2 text-xs">Overdue</Badge>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <Badge variant={order.priority === 'high' ? 'destructive' : order.priority === 'medium' ? 'default' : 'secondary'} className="text-xs">
                      {order.priority}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{order.assignedTo || <span className="text-gray-400">Unassigned</span>}</td>
                  <td className="px-3 py-2 whitespace-nowrap flex gap-2">
                    <Button size="sm" variant="outline" className="text-xs" title="Contact Assignee">
                      <Users className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs" title="Email Customer">
                      <Mail className="w-4 h-4" />
                    </Button>
                    {order.priority === 'high' && (
                      <span title="High Priority"><AlertTriangle className="w-4 h-4 text-red-600" /></span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 