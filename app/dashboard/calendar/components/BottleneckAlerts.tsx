import React from 'react';
import { ProductionProject } from '../types';

interface BottleneckAlertsProps {
  projects: ProductionProject[];
}

export const BottleneckAlerts: React.FC<BottleneckAlertsProps> = ({ projects }) => {
  const hasAlert = projects.some(p => p.status === 'delayed' || p.status === 'at-risk');
  if (!hasAlert) return null;
  return (
    <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-800 rounded">
      <strong>Bottleneck Alert:</strong> Some projects are delayed or at risk. Review the production schedule.
    </div>
  );
}; 
 
 
 
 