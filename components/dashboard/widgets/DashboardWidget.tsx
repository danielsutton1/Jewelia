import React from 'react';

export function DashboardWidget({ id, title, children, onRemove, isEditMode }: {
  id: string;
  title: string;
  children: React.ReactNode;
  onRemove?: (id: string) => void;
  isEditMode?: boolean;
}) {
  return (
    <div className="bg-white rounded shadow p-4 h-full relative">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold">{title}</h4>
        {isEditMode && onRemove && (
          <button className="text-red-500 text-xs" onClick={() => onRemove(id)}>Remove</button>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
} 