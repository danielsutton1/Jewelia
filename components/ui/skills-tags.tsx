"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, X, Edit2, Star } from "lucide-react";

interface Skill {
  name: string;
  category: 'Design' | 'Manufacturing' | 'Sales' | 'Appraisal' | 'Technology' | 'Management' | 'Other';
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

interface SkillsTagsProps {
  skills: Skill[];
  onChange: (skills: Skill[]) => void;
  editable?: boolean;
}

const skillCategories = [
  { value: 'Design', label: 'Design', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { value: 'Manufacturing', label: 'Manufacturing', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { value: 'Sales', label: 'Sales', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  { value: 'Appraisal', label: 'Appraisal', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  { value: 'Technology', label: 'Technology', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' },
  { value: 'Management', label: 'Management', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  { value: 'Other', label: 'Other', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
];

const skillLevels = [
  { value: 'Beginner', label: 'Beginner', stars: 1 },
  { value: 'Intermediate', label: 'Intermediate', stars: 2 },
  { value: 'Advanced', label: 'Advanced', stars: 3 },
  { value: 'Expert', label: 'Expert', stars: 4 },
];

export function SkillsTags({ skills, onChange, editable = true }: SkillsTagsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [newSkill, setNewSkill] = useState<Partial<Skill>>({});

  const handleAddSkill = () => {
    if (newSkill.name && newSkill.category && newSkill.level) {
      const skill: Skill = {
        name: newSkill.name,
        category: newSkill.category as Skill['category'],
        level: newSkill.level as Skill['level'],
      };
      onChange([...skills, skill]);
      setNewSkill({});
      setDialogOpen(false);
    }
  };

  const handleEditSkill = (index: number) => {
    setEditingSkill(skills[index]);
    setNewSkill(skills[index]);
    setDialogOpen(true);
  };

  const handleUpdateSkill = () => {
    if (editingSkill && newSkill.name && newSkill.category && newSkill.level) {
      const updatedSkills = skills.map(skill => 
        skill === editingSkill 
          ? { ...newSkill, name: newSkill.name!, category: newSkill.category as Skill['category'], level: newSkill.level as Skill['level'] }
          : skill
      );
      onChange(updatedSkills);
      setEditingSkill(null);
      setNewSkill({});
      setDialogOpen(false);
    }
  };

  const handleDeleteSkill = (index: number) => {
    const updatedSkills = skills.filter((_, i) => i !== index);
    onChange(updatedSkills);
  };

  const getCategoryColor = (category: string) => {
    return skillCategories.find(cat => cat.value === category)?.color || 'bg-gray-100 text-gray-800';
  };

  const getLevelStars = (level: string) => {
    return skillLevels.find(l => l.value === level)?.stars || 0;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Skills & Expertise</h3>
        {editable && (
          <Button
            size="sm"
            onClick={() => setDialogOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Skill
          </Button>
        )}
      </div>

      {skills.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No skills added yet</p>
          {editable && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialogOpen(true)}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Skill
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {skills.map((skill, index) => (
            <div
              key={`${skill.name}-${index}`}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900 dark:text-white truncate">
                    {skill.name}
                  </h4>
                  <Badge className={getCategoryColor(skill.category)}>
                    {skill.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: getLevelStars(skill.level) }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                    {skill.level}
                  </span>
                </div>
              </div>
              
              {editable && (
                <div className="flex gap-1 ml-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditSkill(index)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteSkill(index)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Skill Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSkill ? 'Edit Skill' : 'Add New Skill'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Skill Name</label>
              <Input
                value={newSkill.name || ''}
                onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                placeholder="e.g., Diamond Grading, CAD Design"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <Select
                value={newSkill.category || ''}
                onValueChange={(value) => setNewSkill({ ...newSkill, category: value as Skill['category'] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {skillCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Proficiency Level</label>
              <Select
                value={newSkill.level || ''}
                onValueChange={(value) => setNewSkill({ ...newSkill, level: value as Skill['level'] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {skillLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      <div className="flex items-center gap-2">
                        <span>{level.label}</span>
                        <div className="flex">
                          {Array.from({ length: level.stars }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setDialogOpen(false);
              setEditingSkill(null);
              setNewSkill({});
            }}>
              Cancel
            </Button>
            <Button
              onClick={editingSkill ? handleUpdateSkill : handleAddSkill}
              disabled={!newSkill.name || !newSkill.category || !newSkill.level}
            >
              {editingSkill ? 'Update Skill' : 'Add Skill'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 