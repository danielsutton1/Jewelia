"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Image, 
  Plus, 
  Edit2, 
  Eye, 
  EyeOff, 
  Trash2, 
  Filter,
  Grid3X3,
  List
} from "lucide-react";
import { PortfolioItem } from "@/types/profile";

interface PortfolioShowcaseProps {
  portfolio: PortfolioItem[];
  onPortfolioChange: (portfolio: PortfolioItem[]) => void;
  editable?: boolean;
}

const portfolioCategories = [
  { value: 'Engagement Rings', label: 'Engagement Rings', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' },
  { value: 'Wedding Bands', label: 'Wedding Bands', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { value: 'Necklaces', label: 'Necklaces', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  { value: 'Earrings', label: 'Earrings', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' },
  { value: 'Bracelets', label: 'Bracelets', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  { value: 'Custom Design', label: 'Custom Design', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' },
  { value: 'Other', label: 'Other', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' },
];

export function PortfolioShowcase({ portfolio, onPortfolioChange, editable = true }: PortfolioShowcaseProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<PortfolioItem>>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleAddItem = () => {
    if (newItem.title && newItem.category && newItem.year) {
      const item: PortfolioItem = {
        id: Date.now().toString(),
        title: newItem.title,
        description: newItem.description || '',
        imageUrl: newItem.imageUrl,
        category: newItem.category as PortfolioItem['category'],
        year: newItem.year,
        isPublic: newItem.isPublic ?? true,
      };
      onPortfolioChange([...portfolio, item]);
      setNewItem({});
      setDialogOpen(false);
    }
  };

  const handleEditItem = (item: PortfolioItem) => {
    setEditingItem(item);
    setNewItem(item);
    setDialogOpen(true);
  };

  const handleUpdateItem = () => {
    if (editingItem && newItem.title && newItem.category && newItem.year) {
      const updatedPortfolio = portfolio.map(item => 
        item.id === editingItem.id 
          ? { ...newItem, id: editingItem.id, title: newItem.title!, category: newItem.category as PortfolioItem['category'], year: newItem.year!, isPublic: newItem.isPublic ?? true }
          : item
      );
      onPortfolioChange(updatedPortfolio);
      setEditingItem(null);
      setNewItem({});
      setDialogOpen(false);
    }
  };

  const handleDeleteItem = (id: string) => {
    onPortfolioChange(portfolio.filter(item => item.id !== id));
  };

  const handleTogglePublic = (id: string) => {
    const updatedPortfolio = portfolio.map(item =>
      item.id === id ? { ...item, isPublic: !item.isPublic } : item
    );
    onPortfolioChange(updatedPortfolio);
  };

  const getCategoryColor = (category: string) => {
    return portfolioCategories.find(cat => cat.value === category)?.color || 'bg-gray-100 text-gray-800';
  };

  const filteredPortfolio = selectedCategory === 'all' 
    ? portfolio 
    : portfolio.filter(item => item.category === selectedCategory);

  const publicPortfolio = filteredPortfolio.filter(item => item.isPublic);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image className="h-5 w-5 text-emerald-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Portfolio Showcase</h3>
          <Badge variant="secondary" className="ml-2">
            {publicPortfolio.length} public
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex border rounded-lg">
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {portfolioCategories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {editable && (
            <Button
              size="sm"
              onClick={() => setDialogOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Work
            </Button>
          )}
        </div>
      </div>

      {/* Portfolio Grid/List */}
      {filteredPortfolio.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <Image className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">No portfolio items yet</p>
          <p className="mb-4">Showcase your best work to attract clients and build your professional reputation.</p>
          {editable && (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Piece
            </Button>
          )}
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {filteredPortfolio.map((item) => (
            <Card key={item.id} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                {/* Image */}
                <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-t-lg overflow-hidden">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Image className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Privacy Badge */}
                  <div className="absolute top-2 right-2">
                    {item.isPublic ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <Eye className="h-3 w-3 mr-1" />
                        Public
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <EyeOff className="h-3 w-3 mr-1" />
                        Private
                      </Badge>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {editable && (
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleEditItem(item)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleDeleteItem(item.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white line-clamp-1">
                      {item.title}
                    </h4>
                    {editable && (
                      <Switch
                        checked={item.isPublic}
                        onCheckedChange={() => handleTogglePublic(item.id)}
                        className="ml-2"
                      />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getCategoryColor(item.category)}>
                      {item.category}
                    </Badge>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {item.year}
                    </span>
                  </div>
                  
                  {item.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Portfolio Item' : 'Add New Work'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newItem.title || ''}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                placeholder="e.g., Custom Engagement Ring Design"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newItem.description || ''}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                placeholder="Describe your work, materials used, design inspiration..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newItem.category || ''}
                  onValueChange={(value) => setNewItem({ ...newItem, category: value as PortfolioItem['category'] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {portfolioCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={newItem.year || ''}
                  onChange={(e) => setNewItem({ ...newItem, year: parseInt(e.target.value) || 0 })}
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="imageUrl">Image URL (Optional)</Label>
              <Input
                id="imageUrl"
                value={newItem.imageUrl || ''}
                onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isPublic"
                checked={newItem.isPublic ?? true}
                onCheckedChange={(checked) => setNewItem({ ...newItem, isPublic: checked })}
              />
              <Label htmlFor="isPublic">Make this work public</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setDialogOpen(false);
              setEditingItem(null);
              setNewItem({});
            }}>
              Cancel
            </Button>
            <Button
              onClick={editingItem ? handleUpdateItem : handleAddItem}
              disabled={!newItem.title || !newItem.category || !newItem.year}
            >
              {editingItem ? 'Update Work' : 'Add Work'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 