import React, { useState } from 'react';

interface Stage {
  name: string;
  start: string;
  end: string;
  status: 'completed' | 'in-progress' | 'pending';
}

interface Project {
  id: string;
  name: string;
  client: string;
  color: string;
  assignedPartner: string;
  stages: Stage[];
}

interface ProjectTimelineBarProps {
  project: Project;
  days: Date[];
}

function getDayIndex(dateStr: string, days: Date[]) {
  return days.findIndex(d => d.toISOString().slice(0, 10) === dateStr);
}

function getAbbr(stage: string) {
  return stage.slice(0, 3).toUpperCase();
}

export const ProjectTimelineBar: React.FC<ProjectTimelineBarProps> = ({ project, days }) => {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <div className="relative h-8 md:h-8 h-6 flex items-center w-full min-w-[200px] md:min-w-0">
      {project.stages.map((stage, i) => {
        const startIdx = getDayIndex(stage.start, days);
        const endIdx = getDayIndex(stage.end, days);
        if (startIdx === -1 || endIdx === -1) return null;
        const colSpan = endIdx - startIdx + 1;
        let opacity = 1;
        let border = '';
        let pattern = '';
        if (stage.status === 'completed') {
          opacity = 1;
        } else if (stage.status === 'in-progress') {
          opacity = 0.85;
          border = 'border-2 border-dotted border-white animate-pulse';
        } else if (stage.status === 'pending') {
          opacity = 0.5;
          pattern = 'bg-[repeating-linear-gradient(135deg,#fff3,transparent_8px)]';
        }
        return (
          <div
            key={stage.name + i}
            className={`absolute top-0 h-8 md:h-8 h-6 rounded flex items-center justify-center text-xs md:text-xs text-[10px] font-bold text-white ${border} ${pattern} px-1 md:px-0`}
            style={{
              left: `calc(${(startIdx / days.length) * 100}% + 2px)`,
              width: `calc(${((colSpan) / days.length) * 100}% - 4px)`,
              background: project.color,
              opacity,
              zIndex: 2,
              minWidth: 28,
            }}
            title={`${stage.name}: ${stage.status}`}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onTouchStart={() => setHovered(i)}
            onTouchEnd={() => setHovered(null)}
            tabIndex={0}
            role="button"
            aria-label={`Stage ${stage.name}, status ${stage.status}`}
          >
            {getAbbr(stage.name)}
            {stage.status === 'completed' && <span className="ml-1">✓</span>}
            {stage.status === 'in-progress' && <span className="ml-1 animate-pulse">⟳</span>}
            {/* Tooltip */}
            {hovered === i && (
              <div className="absolute z-50 bg-white text-gray-900 rounded shadow-lg px-3 py-2 text-xs md:text-xs text-[12px] whitespace-nowrap border border-gray-200 min-w-[180px] md:-top-14 md:left-1/2 md:-translate-x-1/2 top-10 left-1/2 -translate-x-1/2">
                <div className="font-semibold text-sm mb-1">{project.name}</div>
                <div>Client: <span className="font-medium">{project.client}</span></div>
                <div>Stage: <span className="font-medium">{stage.name}</span></div>
                <div>Status: <span className="font-medium capitalize">{stage.status}</span></div>
                <div>Partner: <span className="font-medium">{project.assignedPartner}</span></div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}; 
 
 
 
 