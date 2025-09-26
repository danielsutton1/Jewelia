// @ts-nocheck
import React, { KeyboardEvent } from 'react';
import { ProductionStage, stageColors, stageStatusStyles } from '../types';
// import { Tooltip } from '@/components/ui/tooltip'; // Uncomment if Tooltip is used

interface TimelineEventProps {
  event: { resource: ProductionStage };
  title?: string;
  onClick?: () => void;
}

export const TimelineEvent: React.FC<TimelineEventProps> = ({ event, title, onClick }: TimelineEventProps) => {
  const stage: ProductionStage = event.resource;
  const statusStyle = stageStatusStyles[stage.status as keyof typeof stageStatusStyles];
  const color = stageColors[stage.name as keyof typeof stageColors];
  return (
    <div
      className="timeline-bar rbc-event relative flex items-center justify-between px-3 py-2 rounded-lg shadow-sm cursor-pointer select-none transition-all duration-150 active:scale-95 focus:ring-2 focus:ring-gold-500 outline-none"
      style={{ background: 'var(--color-gold)', color: 'var(--color-navy)' }}
      tabIndex={0}
      aria-label={`Stage: ${stage.name}, Status: ${stage.status}, Progress: ${stage.progress}%`}
      onClick={onClick}
      onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); }}
      role="button"
    >
      <span className="font-semibold text-sm md:text-base truncate">{title || stage.name}</span>
      <span className="ml-2 text-xs md:text-sm font-medium">{stage.progress}%</span>
      {/* Visual cue for horizontal scroll (mobile) */}
      <span className="timeline-scroll-cue hidden md:block" aria-hidden="true" />
    </div>
  );
}; 
 
 
 
 