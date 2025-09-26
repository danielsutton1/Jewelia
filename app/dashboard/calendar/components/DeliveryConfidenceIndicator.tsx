import React from 'react';
import { ProductionProject } from '../types';

interface DeliveryConfidenceIndicatorProps {
  project: ProductionProject;
}

export const DeliveryConfidenceIndicator: React.FC<DeliveryConfidenceIndicatorProps> = ({ project }) => {
  if (!project) return null;
  let color = 'bg-green-500';
  let text = 'On Track';
  if (project.status === 'at-risk') {
    color = 'bg-yellow-400';
    text = 'At Risk';
  } else if (project.status === 'delayed') {
    color = 'bg-red-500';
    text = 'Delayed';
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${color} text-white`}>
      <span className={`w-2 h-2 rounded-full bg-white/80`} />
      {text}
    </span>
  );
}; 
 
 
 
 