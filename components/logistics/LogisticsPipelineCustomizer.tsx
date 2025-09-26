"use client";

import React, { useState, useRef, useEffect } from 'react';
import { DndProvider, useDrag, useDrop, DropTargetMonitor } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';

interface PipelineStep {
  key: string;
  name: string;
}

interface DraggableStepProps {
  step: PipelineStep;
  index: number;
  isEditing: boolean;
  moveStep: (from: number, to: number) => void;
  onBeginEdit: (index: number) => void;
  onEndEdit: (index: number, newName: string) => void;
  onRemove: (index: number) => void;
}

const DraggableStep = ({ step, index, isEditing, moveStep, onBeginEdit, onEndEdit, onRemove }: DraggableStepProps) => {
  const [editingValue, setEditingValue] = useState(step.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const ref = useRef<HTMLDivElement>(null);

  const [, drop] = useDrop<{ index: number }>({
    accept: 'STEP',
    hover(item: { index: number }, monitor: DropTargetMonitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
      moveStep(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'STEP',
    item: () => ({ index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editingValue.trim()) {
      onEndEdit(index, editingValue.trim());
    } else {
      setEditingValue(step.name);
      onEndEdit(index, step.name);
    }
  };

  return (
    <div ref={ref} style={{ opacity: isDragging ? 0.3 : 1 }} className="w-full">
      <div className="flex items-center gap-2 p-2 mb-2 bg-gray-100 rounded-md w-full">
        <GripVertical className="cursor-move text-gray-500" />
        {isEditing ? (
          <Input
            ref={inputRef}
            value={editingValue}
            onChange={(e) => setEditingValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className="flex-grow"
          />
        ) : (
          <span className="flex-grow">{step.name}</span>
        )}
        <Button variant="ghost" size="icon" onClick={() => onBeginEdit(index)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onRemove(index)}>
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    </div>
  );
};

export function LogisticsPipelineCustomizer({
  steps: initialSteps,
  removedSteps: initialRemovedSteps = [],
  onSave,
  onCancel,
  onUpdate
}: {
  steps: PipelineStep[];
  removedSteps?: PipelineStep[];
  onSave: (steps: PipelineStep[], removedStages: PipelineStep[]) => void;
  onCancel: () => void;
  onUpdate?: (steps: PipelineStep[], removedStages: PipelineStep[]) => void;
}) {
  const [steps, setSteps] = useState<PipelineStep[]>(initialSteps);
  const [removedSteps, setRemovedSteps] = useState<PipelineStep[]>(initialRemovedSteps);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newStep, setNewStep] = useState('');

  const moveStep = (from: number, to: number) => {
    const updated = [...steps];
    const [removed] = updated.splice(from, 1);
    updated.splice(to, 0, removed);
    setSteps(updated);
    onUpdate?.(updated, removedSteps);
  };

  const handleEditStep = (index: number, newName: string) => {
    const updatedSteps = [...steps];
    updatedSteps[index] = { ...updatedSteps[index], name: newName };
    setSteps(updatedSteps);
    setEditingIndex(null);
    onUpdate?.(updatedSteps, removedSteps);
  };

  const handleAddNewStep = () => {
    if (newStep.trim()) {
      // Generate a unique key for the new step
      const key = newStep.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
      const updatedSteps = [...steps, { key, name: newStep.trim() }];
      setSteps(updatedSteps);
      setNewStep('');
      onUpdate?.(updatedSteps, removedSteps);
    }
  };

  const handleRemoveStep = (index: number) => {
    const removedStep = steps[index];
    const updatedSteps = steps.filter((_, i) => i !== index);
    const updatedRemovedSteps = [...removedSteps, removedStep];
    setSteps(updatedSteps);
    setRemovedSteps(updatedRemovedSteps);
    onUpdate?.(updatedSteps, updatedRemovedSteps);
  };

  const handleRestoreStep = (step: PipelineStep) => {
    const updatedRemovedSteps = removedSteps.filter(s => s.key !== step.key);
    const updatedSteps = [...steps, step];
    setSteps(updatedSteps);
    setRemovedSteps(updatedRemovedSteps);
    onUpdate?.(updatedSteps, updatedRemovedSteps);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-1">
        <h3 className="text-xl font-semibold mb-4 text-center">Customize Logistics Pipeline</h3>
        <div className="text-xs text-muted-foreground mb-2 text-center">
          Changes are applied in real-time • {steps.length} active stages
        </div>
        <div className="max-h-64 overflow-y-auto pr-2">
          {steps.map((step, idx) => (
            <DraggableStep
              key={step.key}
              step={step}
              index={idx}
              isEditing={editingIndex === idx}
              moveStep={moveStep}
              onBeginEdit={setEditingIndex}
              onEndEdit={handleEditStep}
              onRemove={handleRemoveStep}
            />
          ))}
        </div>
        {/* Removed stages section */}
        {removedSteps.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Removed from dashboard:</h4>
            <div className="max-h-32 overflow-y-auto pr-2">
              {removedSteps.map((step, idx) => (
                <div key={`removed-${idx}-${step.key}`} className="flex items-center gap-2 p-2 mb-1 bg-gray-50 rounded-md w-full opacity-60">
                  <span className="flex-grow text-gray-500">{step.name}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRestoreStep(step)}
                    className="text-xs"
                  >
                    Restore
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="mt-4 flex gap-2">
          <Input
            value={newStep}
            onChange={e => setNewStep(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddNewStep()}
            placeholder="Add new pipeline step"
          />
          <Button onClick={handleAddNewStep}>Add</Button>
        </div>
        <Button className="mt-6 w-full" onClick={() => onSave(steps, removedSteps)}>
          Save Pipeline
        </Button>
        <Button variant="ghost" className="mt-2 w-full" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </DndProvider>
  );
} 