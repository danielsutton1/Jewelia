import React from 'react';

const widgets = [
  { id: 'revenue', name: "Today's Revenue" },
  { id: 'orders', name: "Today's Orders" },
  { id: 'itemsSold', name: 'Items Sold' },
  { id: 'customers', name: 'Customers' },
  { id: 'sales', name: 'Sales' },
  { id: 'activeOrders', name: 'Active Orders' },
];

export function WidgetLibrary({ onAdd, onRemove, activeWidgets }: {
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  activeWidgets: string[];
}) {
  return (
    <div className="p-4 border rounded mb-4">
      <h3 className="font-bold mb-2">Widget Library</h3>
      <ul>
        {widgets.map(w => (
          <li key={w.id} className="flex items-center gap-2 mb-1">
            <span>{w.name}</span>
            {activeWidgets.includes(w.id) ? (
              <button className="text-red-500" onClick={() => onRemove(w.id)}>Remove</button>
            ) : (
              <button className="text-green-600" onClick={() => onAdd(w.id)}>Add</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
} 