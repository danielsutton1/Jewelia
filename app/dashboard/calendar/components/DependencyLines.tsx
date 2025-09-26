import { ProductionStage } from '../types';

interface DependencyLinesProps {
  stages: ProductionStage[];
  containerRef: React.RefObject<HTMLDivElement>;
}

export function DependencyLines({ stages, containerRef }: DependencyLinesProps) {
  const getStageElement = (stageId: string) => {
    return containerRef.current?.querySelector(`[data-stage-id="${stageId}"]`);
  };

  const getConnectionPoints = (fromStage: ProductionStage, toStage: ProductionStage) => {
    const fromElement = getStageElement(fromStage.id);
    const toElement = getStageElement(toStage.id);

    if (!fromElement || !toElement) return null;

    const fromRect = fromElement.getBoundingClientRect();
    const toRect = toElement.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();

    if (!containerRect) return null;

    return {
      x1: fromRect.right - containerRect.left,
      y1: fromRect.top + fromRect.height / 2 - containerRect.top,
      x2: toRect.left - containerRect.left,
      y2: toRect.top + toRect.height / 2 - containerRect.top,
    };
  };

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    >
      {stages.map((stage) =>
        stage.dependencies?.map((dependencyId) => {
          const dependencyStage = stages.find((s) => s.id === dependencyId);
          if (!dependencyStage) return null;

          const points = getConnectionPoints(dependencyStage, stage);
          if (!points) return null;

          const isDelayed = stage.status === 'delayed' || dependencyStage.status === 'delayed';

          return (
            <path
              key={`${dependencyId}-${stage.id}`}
              d={`M ${points.x1} ${points.y1} C ${(points.x1 + points.x2) / 2} ${points.y1}, ${
                (points.x1 + points.x2) / 2
              } ${points.y2}, ${points.x2} ${points.y2}`}
              stroke={isDelayed ? '#EF4444' : '#94A3B8'}
              strokeWidth={2}
              strokeDasharray={isDelayed ? '4' : '2'}
              fill="none"
            />
          );
        })
      )}
    </svg>
  );
} 
 
 
 
 