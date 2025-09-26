"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  TrendingUp, 
  Users, 
  Star, 
  DollarSign, 
  Calendar, 
  Award, 
  Edit2, 
  Eye, 
  EyeOff,
  Trophy,
  FileText,
  BookOpen,
  Target,
  Medal
} from "lucide-react";

interface BusinessMetrics {
  yearsExperience: number;
  projectsCompleted: number;
  clientsServed: number;
  averageRating: number;
  totalRevenue?: number;
  teamSize?: number;
}

interface Achievement {
  title: string;
  description: string;
  year: number;
  type: 'Award' | 'Certification' | 'Publication' | 'Project' | 'Recognition';
}

interface BusinessMetricsProps {
  metrics: BusinessMetrics;
  achievements: Achievement[];
  isPublic: boolean;
  onMetricsChange: (metrics: BusinessMetrics) => void;
  onAchievementsChange: (achievements: Achievement[]) => void;
  onPrivacyChange: (isPublic: boolean) => void;
  editable?: boolean;
}

const achievementIcons = {
  Award: Trophy,
  Certification: FileText,
  Publication: BookOpen,
  Project: Target,
  Recognition: Medal,
};

const achievementColors = {
  Award: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  Certification: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  Publication: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Project: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  Recognition: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
};

export function BusinessMetrics({ 
  metrics, 
  achievements, 
  isPublic, 
  onMetricsChange, 
  onAchievementsChange, 
  onPrivacyChange,
  editable = true 
}: BusinessMetricsProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingMetrics, setEditingMetrics] = useState<BusinessMetrics>(metrics);
  const [editingAchievements, setEditingAchievements] = useState<Achievement[]>(achievements);

  const handleSave = () => {
    onMetricsChange(editingMetrics);
    onAchievementsChange(editingAchievements);
    setEditDialogOpen(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Business Metrics</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            {isPublic ? <Eye className="h-4 w-4 text-green-600" /> : <EyeOff className="h-4 w-4 text-gray-400" />}
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {isPublic ? 'Public' : 'Private'}
            </span>
          </div>
          {editable && (
            <>
              <Switch
                checked={isPublic}
                onCheckedChange={onPrivacyChange}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditDialogOpen(true)}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <Calendar className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {metrics.yearsExperience}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Years Experience</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatNumber(metrics.projectsCompleted)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Projects</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatNumber(metrics.clientsServed)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Clients</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {metrics.averageRating.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Rating</div>
          </CardContent>
        </Card>

        {metrics.totalRevenue && (
          <Card className="text-center">
            <CardContent className="p-4">
              <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(metrics.totalRevenue)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Revenue</div>
            </CardContent>
          </Card>
        )}

        {metrics.teamSize && (
          <Card className="text-center">
            <CardContent className="p-4">
              <Users className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics.teamSize}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Team Size</div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Achievements */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Achievements & Recognition</h4>
        {achievements.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Award className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No achievements added yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement, index) => {
              const IconComponent = achievementIcons[achievement.type];
              return (
                <Card key={index} className="border-l-4 border-l-emerald-500">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <IconComponent className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium text-gray-900 dark:text-white">
                            {achievement.title}
                          </h5>
                          <Badge className={achievementColors[achievement.type]}>
                            {achievement.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          {achievement.description}
                        </p>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {achievement.year}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Business Metrics</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Metrics Form */}
            <div className="space-y-4">
              <h4 className="font-medium">Business Statistics</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="yearsExperience">Years of Experience</Label>
                  <Input
                    id="yearsExperience"
                    type="number"
                    value={editingMetrics.yearsExperience}
                    onChange={(e) => setEditingMetrics({
                      ...editingMetrics,
                      yearsExperience: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="projectsCompleted">Projects Completed</Label>
                  <Input
                    id="projectsCompleted"
                    type="number"
                    value={editingMetrics.projectsCompleted}
                    onChange={(e) => setEditingMetrics({
                      ...editingMetrics,
                      projectsCompleted: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="clientsServed">Clients Served</Label>
                  <Input
                    id="clientsServed"
                    type="number"
                    value={editingMetrics.clientsServed}
                    onChange={(e) => setEditingMetrics({
                      ...editingMetrics,
                      clientsServed: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="averageRating">Average Rating</Label>
                  <Input
                    id="averageRating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={editingMetrics.averageRating}
                    onChange={(e) => setEditingMetrics({
                      ...editingMetrics,
                      averageRating: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="totalRevenue">Total Revenue (USD)</Label>
                  <Input
                    id="totalRevenue"
                    type="number"
                    value={editingMetrics.totalRevenue || ''}
                    onChange={(e) => setEditingMetrics({
                      ...editingMetrics,
                      totalRevenue: parseInt(e.target.value) || undefined
                    })}
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <Label htmlFor="teamSize">Team Size</Label>
                  <Input
                    id="teamSize"
                    type="number"
                    value={editingMetrics.teamSize || ''}
                    onChange={(e) => setEditingMetrics({
                      ...editingMetrics,
                      teamSize: parseInt(e.target.value) || undefined
                    })}
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>

            {/* Achievements Form */}
            <div className="space-y-4">
              <h4 className="font-medium">Achievements</h4>
              <div className="space-y-3">
                {editingAchievements.map((achievement, index) => (
                  <div key={index} className="border rounded-lg p-3 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={achievement.title}
                          onChange={(e) => {
                            const updated = [...editingAchievements];
                            updated[index].title = e.target.value;
                            setEditingAchievements(updated);
                          }}
                        />
                      </div>
                      <div>
                        <Label>Year</Label>
                        <Input
                          type="number"
                          value={achievement.year}
                          onChange={(e) => {
                            const updated = [...editingAchievements];
                            updated[index].year = parseInt(e.target.value) || 0;
                            setEditingAchievements(updated);
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        value={achievement.description}
                        onChange={(e) => {
                          const updated = [...editingAchievements];
                          updated[index].description = e.target.value;
                          setEditingAchievements(updated);
                        }}
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingAchievements(editingAchievements.filter((_, i) => i !== index));
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove Achievement
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingAchievements([
                      ...editingAchievements,
                      { title: '', description: '', year: new Date().getFullYear(), type: 'Recognition' }
                    ]);
                  }}
                >
                  Add Achievement
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 