import { useState } from 'react';
import { ProductionStage } from '../types';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Edit, Trash2, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';

interface StageContextMenuProps {
  stage: ProductionStage;
  children: React.ReactNode;
  onEdit: (stage: ProductionStage) => void;
  onDelete: (stage: ProductionStage) => void;
  onStatusChange: (stage: ProductionStage, status: ProductionStage['status']) => void;
}

export function StageContextMenu({ stage, children, onEdit, onDelete, onStatusChange }: StageContextMenuProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleStatusChange = (newStatus: ProductionStage['status']) => {
    onStatusChange(stage, newStatus);
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>{children}</ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuItem onClick={() => onEdit(stage)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Stage
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => handleStatusChange('completed')}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Mark as Completed
          </ContextMenuItem>
          <ContextMenuItem onClick={() => handleStatusChange('in-progress')}>
            <Clock className="mr-2 h-4 w-4" />
            Mark as In Progress
          </ContextMenuItem>
          <ContextMenuItem onClick={() => handleStatusChange('delayed')}>
            <AlertTriangle className="mr-2 h-4 w-4" />
            Mark as Delayed
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Stage
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Stage</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this stage? This action cannot be undone.
              Any dependent stages may be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                onDelete(stage);
                setShowDeleteDialog(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 
 
 
 
 