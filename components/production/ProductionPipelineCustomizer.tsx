"use client";

import React, { useState, useRef, useEffect } from 'react';
import { DndProvider, useDrag, useDrop, DropTargetMonitor } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';

interface DraggableStepProps {
  step: string;
  index: number;
  isEditing: boolean;
  moveStep: (from: number, to: number) => void;
  onBeginEdit: (index: number) => void;
  onEndEdit: (index: number, newName: string) => void;
  onDelete: (index: number) => void;
}

const DraggableStep = ({ step, index, isEditing, moveStep, onBeginEdit, onEndEdit, onDelete }: DraggableStepProps) => {
  const [editingValue, setEditingValue] = useState(step);
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
       setEditingValue(step);
       onEndEdit(index, step);
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
          <span className="flex-grow">{step}</span>
        )}
        <Button variant="ghost" size="icon" onClick={() => onBeginEdit(index)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(index)}>
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    </div>
  );
};

export function ProductionPipelineCustomizer({
  steps: initialSteps,
  onSave
}: {
  steps: string[];
  onSave: (steps: string[]) => void;
}) {
  const [steps, setSteps] = useState(initialSteps);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newStep, setNewStep] = useState('');

  const moveStep = (from: number, to: number) => {
    const updated = [...steps];
    const [removed] = updated.splice(from, 1);
    updated.splice(to, 0, removed);
    setSteps(updated);
  };
  
  const handleEditStep = (index: number, newName: string) => {
    const updatedSteps = [...steps];
    updatedSteps[index] = newName;
    setSteps(updatedSteps);
    setEditingIndex(null); // Exit editing mode
  };
  
  const handleAddNewStep = () => {
      if (newStep.trim()) {
        setSteps([...steps, newStep.trim()]);
        setNewStep('');
      }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-1">
        <h3 className="text-xl font-semibold mb-4 text-center">Customize Production Pipeline</h3>
        <div className="max-h-64 overflow-y-auto pr-2">
          {steps.map((step, idx) => (
            <DraggableStep
              key={idx}
              step={step}
              index={idx}
              isEditing={editingIndex === idx}
              moveStep={moveStep}
              onBeginEdit={setEditingIndex}
              onEndEdit={handleEditStep}
              onDelete={(index) => setSteps(steps.filter((_, i) => i !== index))}
            />
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <Input
            value={newStep}
            onChange={e => setNewStep(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddNewStep()}
            placeholder="Add new pipeline step"
          />
          <Button onClick={handleAddNewStep}>Add</Button>
        </div>
        <Button className="mt-6 w-full" onClick={() => onSave(steps)}>
          Save Pipeline
        </Button>
      </div>
    </DndProvider>
  );
}