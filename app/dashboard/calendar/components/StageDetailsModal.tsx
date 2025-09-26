import React, { useState, useRef, ChangeEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

const supabase = createSupabaseBrowserClient()

interface ProductionStage {
  id: string;
  name: string;
  partner: string;
  status: 'completed' | 'in-progress' | 'pending' | 'delayed' | 'blocked';
  progress: number;
  start: string;
  end: string;
  dependencies?: string[];
  notes?: string;
  attachments?: string[];
}

interface StageDetailsModalProps {
  stage: ProductionStage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (stage: ProductionStage) => void;
}

export const StageDetailsModal: React.FC<StageDetailsModalProps> = ({ stage, open, onOpenChange, onUpdate }) => {
  const [editedStage, setEditedStage] = useState<ProductionStage | null>(stage);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setEditedStage(stage);
  }, [stage]);

  if (!stage || !editedStage) return null;

  const handleSave = () => {
    onUpdate(editedStage);
    onOpenChange(false);
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const uploadedUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filePath = `attachments/${stage.id}/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from('attachments').upload(filePath, file);
      if (!error) {
        const { data } = supabase.storage.from('attachments').getPublicUrl(filePath);
        uploadedUrls.push(data.publicUrl);
      }
    }
    setEditedStage((prev: ProductionStage | null) => prev ? { ...prev, attachments: [...(prev.attachments || []), ...uploadedUrls] } : prev);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Stage Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Stage
            </Label>
            <div className="col-span-3">
              <Input
                id="name"
                value={editedStage.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedStage({ ...editedStage, name: e.target.value as ProductionStage['name'] })}
                disabled
              />
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="partner" className="text-right">
              Partner
            </Label>
            <div className="col-span-3">
              <Input
                id="partner"
                value={editedStage.partner}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedStage({ ...editedStage, partner: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <div className="col-span-3">
              <Select
                value={editedStage.status}
                onValueChange={(value: ProductionStage['status']) => setEditedStage({ ...editedStage, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="progress" className="text-right">
              Progress
            </Label>
            <div className="col-span-3">
              <Progress value={editedStage.progress} className="mb-2" />
              <Input
                id="progress"
                type="number"
                min={0}
                max={100}
                value={editedStage.progress}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedStage({ ...editedStage, progress: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Timeline</Label>
            <div className="col-span-3 text-sm">
              <div>Start: {format(new Date(editedStage.start), 'PPp')}</div>
              <div>End: {format(new Date(editedStage.end), 'PPp')}</div>
            </div>
          </div>

          {editedStage.dependencies && editedStage.dependencies.length > 0 && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Dependencies</Label>
              <div className="col-span-3 text-sm">
                {editedStage.dependencies.map((dep: string) => (
                  <div key={dep} className="text-muted-foreground">
                    {dep}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Notes
            </Label>
            <div className="col-span-3">
              <Input
                id="notes"
                value={editedStage.notes || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedStage({ ...editedStage, notes: e.target.value })}
                placeholder="Add notes..."
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="attachments" className="text-right">
              Attachments
            </Label>
            <div className="col-span-3">
              <input
                id="attachments"
                type="file"
                multiple
                className="block w-full text-sm text-gray-500"
                ref={fileInputRef}
                onChange={handleFileChange}
                disabled={uploading}
              />
              <div className="text-xs text-muted-foreground mt-1">
                {uploading ? 'Uploading...' : '(Upload files to attach to this stage)'}
              </div>
              {editedStage.attachments && editedStage.attachments.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs">
                  {editedStage.attachments.map((url: string, i: number) => (
                    <li key={url + i}>
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Attachment {i + 1}</a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 
 
 
 
 