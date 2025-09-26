"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Shield, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Plus, 
  Edit2, 
  Trash2,
  Star,
  Award,
  FileText
} from "lucide-react";

interface Certification {
  name: string;
  issuer: string;
  year: number;
  expiryDate?: string;
  isVerified: boolean;
}

interface VerificationBadgesProps {
  certifications: Certification[];
  verificationLevel: 'None' | 'Basic' | 'Professional' | 'Premium';
  isVerified: boolean;
  onCertificationsChange: (certifications: Certification[]) => void;
  onVerificationLevelChange: (level: 'None' | 'Basic' | 'Professional' | 'Premium') => void;
  editable?: boolean;
}

const verificationLevels = [
  { 
    value: 'None', 
    label: 'None', 
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    icon: Shield,
    description: 'No verification'
  },
  { 
    value: 'Basic', 
    label: 'Basic', 
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    icon: CheckCircle,
    description: 'Email verified'
  },
  { 
    value: 'Professional', 
    label: 'Professional', 
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    icon: Award,
    description: 'Professional credentials verified'
  },
  { 
    value: 'Premium', 
    label: 'Premium', 
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    icon: Star,
    description: 'Premium verification with background check'
  },
];

export function VerificationBadges({ 
  certifications, 
  verificationLevel, 
  isVerified, 
  onCertificationsChange, 
  onVerificationLevelChange,
  editable = true 
}: VerificationBadgesProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certification | null>(null);
  const [newCert, setNewCert] = useState<Partial<Certification>>({});

  const handleAddCertification = () => {
    if (newCert.name && newCert.issuer && newCert.year) {
      const cert: Certification = {
        name: newCert.name,
        issuer: newCert.issuer,
        year: newCert.year,
        expiryDate: newCert.expiryDate,
        isVerified: newCert.isVerified ?? false,
      };
      onCertificationsChange([...certifications, cert]);
      setNewCert({});
      setDialogOpen(false);
    }
  };

  const handleEditCertification = (index: number) => {
    setEditingCert(certifications[index]);
    setNewCert(certifications[index]);
    setDialogOpen(true);
  };

  const handleUpdateCertification = () => {
    if (editingCert && newCert.name && newCert.issuer && newCert.year) {
      const updatedCerts = certifications.map(cert => 
        cert === editingCert 
          ? { ...newCert, name: newCert.name!, issuer: newCert.issuer!, year: newCert.year!, isVerified: newCert.isVerified ?? false }
          : cert
      );
      onCertificationsChange(updatedCerts);
      setEditingCert(null);
      setNewCert({});
      setDialogOpen(false);
    }
  };

  const handleDeleteCertification = (index: number) => {
    const updatedCerts = certifications.filter((_, i) => i !== index);
    onCertificationsChange(updatedCerts);
  };

  const getVerificationLevel = () => {
    return verificationLevels.find(level => level.value === verificationLevel);
  };

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return expiry <= thirtyDaysFromNow && expiry > now;
  };

  const currentLevel = getVerificationLevel();

  return (
    <div className="space-y-6">
      {/* Verification Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {isVerified ? (
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            ) : (
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            )}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Verification Status
            </h3>
          </div>
          {currentLevel && (
            <Badge className={currentLevel.color}>
              <currentLevel.icon className="h-3 w-3 mr-1" />
              {currentLevel.label}
            </Badge>
          )}
        </div>
        
        {editable && (
          <div className="flex items-center gap-2">
            <Select
              value={verificationLevel}
              onValueChange={(value) => onVerificationLevelChange(value as 'None' | 'Basic' | 'Professional' | 'Premium')}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {verificationLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    <div className="flex items-center gap-2">
                      <level.icon className="h-4 w-4" />
                      <span>{level.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Verification Level Description */}
      {currentLevel && (
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <currentLevel.icon className="h-6 w-6 text-emerald-600 mt-1" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  {currentLevel.label} Verification
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {currentLevel.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certifications */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Professional Certifications</h4>
          {editable && (
            <Button
              size="sm"
              onClick={() => setDialogOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Certification
            </Button>
          )}
        </div>

        {certifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No certifications added yet</p>
            {editable && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDialogOpen(true)}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Certification
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certifications.map((cert, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-medium text-gray-900 dark:text-white truncate">
                          {cert.name}
                        </h5>
                        {cert.isVerified ? (
                          <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {cert.issuer}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>Issued: {cert.year}</span>
                        {cert.expiryDate && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              Expires: {new Date(cert.expiryDate).toLocaleDateString()}
                            </span>
                            {isExpired(cert.expiryDate) && (
                              <Badge variant="destructive" className="text-xs">
                                Expired
                              </Badge>
                            )}
                            {isExpiringSoon(cert.expiryDate) && !isExpired(cert.expiryDate) && (
                              <Badge variant="secondary" className="text-xs">
                                Expiring Soon
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {editable && (
                      <div className="flex gap-1 ml-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditCertification(index)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteCertification(index)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCert ? 'Edit Certification' : 'Add New Certification'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="certName">Certification Name</Label>
              <Input
                id="certName"
                value={newCert.name || ''}
                onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                placeholder="e.g., GIA Graduate Gemologist"
              />
            </div>
            
            <div>
              <Label htmlFor="issuer">Issuing Organization</Label>
              <Input
                id="issuer"
                value={newCert.issuer || ''}
                onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                placeholder="e.g., Gemological Institute of America"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="year">Year Issued</Label>
                <Input
                  id="year"
                  type="number"
                  value={newCert.year || ''}
                  onChange={(e) => setNewCert({ ...newCert, year: parseInt(e.target.value) || 0 })}
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
              
              <div>
                <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={newCert.expiryDate || ''}
                  onChange={(e) => setNewCert({ ...newCert, expiryDate: e.target.value })}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isVerified"
                checked={newCert.isVerified ?? false}
                onChange={(e) => setNewCert({ ...newCert, isVerified: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isVerified">This certification has been verified</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setDialogOpen(false);
              setEditingCert(null);
              setNewCert({});
            }}>
              Cancel
            </Button>
            <Button
              onClick={editingCert ? handleUpdateCertification : handleAddCertification}
              disabled={!newCert.name || !newCert.issuer || !newCert.year}
            >
              {editingCert ? 'Update Certification' : 'Add Certification'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 