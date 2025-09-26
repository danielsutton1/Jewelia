import { ProductionProject, ProductionStage } from '../types';

export type DeliveryConfidence = {
  score: number; // 0-100
  color: 'green' | 'yellow' | 'red';
  reason: string;
};

export function getDeliveryConfidence(project: ProductionProject): DeliveryConfidence {
  // Example factors
  const totalStages = project.stages.length;
  const completedStages = project.stages.filter(s => s.status === 'completed').length;
  const delayedStages = project.stages.filter(s => s.status === 'delayed').length;
  const now = new Date();
  const overdueStages = project.stages.filter(s => new Date(s.end) < now && s.status !== 'completed').length;

  // Simple scoring logic (can be made more sophisticated)
  let score = 100;
  score -= delayedStages * 10;
  score -= overdueStages * 15;
  score -= (totalStages - completedStages - delayedStages - overdueStages) * 2;

  // Clamp score
  if (score > 100) score = 100;
  if (score < 0) score = 0;

  let color: 'green' | 'yellow' | 'red' = 'green';
  if (score < 70) color = 'red';
  else if (score < 90) color = 'yellow';

  let reason = '';
  if (color === 'green') reason = 'On track for delivery';
  else if (color === 'yellow') reason = 'Potential delays detected';
  else reason = 'Likely delays - immediate action recommended';

  return { score, color, reason };
} 
 
 
 
 