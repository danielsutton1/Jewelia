"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Download, 
  Upload, 
  FileText, 
  FileJson, 
  File, 
  FileText as FilePdf, 
  Mail, 
  Calendar,
  Archive,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
  Share2,
  Copy,
  ExternalLink,
  Globe,
  Smartphone,
  Monitor
} from "lucide-react";
import { toast } from "sonner";
import { copyToClipboard } from "@/components/ui/utils";

interface ProfileExportImportProps {
  profile: any;
  onImport: (data: any) => void;
}

interface ExportFormat {
  id: string;
  name: string;
  description: string;
  icon: any;
  extension: string;
  mimeType: string;
}

const exportFormats: ExportFormat[] = [
  {
    id: 'json',
    name: 'JSON',
    description: 'Complete profile data in JSON format',
    icon: FileJson,
    extension: 'json',
    mimeType: 'application/json'
  },
  {
    id: 'vcard',
    name: 'vCard',
    description: 'Contact information for address books',
    icon: FileText,
    extension: 'vcf',
    mimeType: 'text/vcard'
  },
  {
    id: 'pdf',
    name: 'PDF Resume',
    description: 'Professional resume in PDF format',
    icon: FilePdf,
    extension: 'pdf',
    mimeType: 'application/pdf'
  },
  {
    id: 'csv',
    name: 'CSV',
    description: 'Profile data in spreadsheet format',
    icon: File,
    extension: 'csv',
    mimeType: 'text/csv'
  }
];

export function ProfileExportImport({ profile, onImport }: ProfileExportImportProps) {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isBackupDialogOpen, setIsBackupDialogOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<string>('json');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateVCard = () => {
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${profile.name}`,
      `ORG:${profile.company}`,
      `TITLE:${profile.title}`,
      `EMAIL:${profile.email}`,
      `TEL:${profile.phone}`,
      `URL:${profile.website}`,
      `ADR:;;${profile.location}`,
      `NOTE:${profile.bio}`,
      'END:VCARD'
    ].join('\r\n');
    
    return vcard;
  };

  const generateCSV = () => {
    const headers = ['Field', 'Value'];
    const rows = [
      ['Name', profile.name],
      ['Title', profile.title],
      ['Company', profile.company],
      ['Location', profile.location],
      ['Email', profile.email],
      ['Phone', profile.phone],
      ['Website', profile.website],
      ['Bio', profile.bio],
      ['Years Experience', profile.businessMetrics?.yearsExperience || ''],
      ['Projects Completed', profile.businessMetrics?.projectsCompleted || ''],
      ['Clients Served', profile.businessMetrics?.clientsServed || ''],
      ['Average Rating', profile.businessMetrics?.averageRating || ''],
      ['Skills', profile.skills?.map((s: any) => `${s.name} (${s.level})`).join('; ') || ''],
      ['Certifications', profile.certifications?.map((c: any) => c.name).join('; ') || '']
    ];
    
    return [headers, ...rows].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
  };

  const exportProfile = async (format: string) => {
    setIsExporting(true);
    
    try {
      const selectedFormatData = exportFormats.find(f => f.id === format);
      if (!selectedFormatData) throw new Error('Invalid format');

      let content: string;
      let filename: string;

      switch (format) {
        case 'json':
          content = JSON.stringify(profile, null, 2);
          filename = `${profile.name.replace(/\s+/g, '_')}_profile.json`;
          break;
        case 'vcard':
          content = generateVCard();
          filename = `${profile.name.replace(/\s+/g, '_')}.vcf`;
          break;
        case 'csv':
          content = generateCSV();
          filename = `${profile.name.replace(/\s+/g, '_')}_profile.csv`;
          break;
        case 'pdf':
          // For PDF, we'll create a simple text representation
          content = `PROFESSIONAL PROFILE\n\nName: ${profile.name}\nTitle: ${profile.title}\nCompany: ${profile.company}\nLocation: ${profile.location}\nEmail: ${profile.email}\nPhone: ${profile.phone}\nWebsite: ${profile.website}\n\nBio: ${profile.bio}\n\nExperience: ${profile.businessMetrics?.yearsExperience} years\nProjects: ${profile.businessMetrics?.projectsCompleted}\nClients: ${profile.businessMetrics?.clientsServed}\nRating: ${profile.businessMetrics?.averageRating}/5`;
          filename = `${profile.name.replace(/\s+/g, '_')}_resume.txt`;
          break;
        default:
          throw new Error('Unsupported format');
      }

      const blob = new Blob([content], { type: selectedFormatData.mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`${selectedFormatData.name} export completed`);
      setIsExportDialogOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    
    try {
      const content = await file.text();
      let data;

      if (file.name.endsWith('.json')) {
        data = JSON.parse(content);
      } else {
        toast.error('Please select a valid JSON file');
        return;
      }

      // Validate the imported data
      if (!data.name || !data.email) {
        toast.error('Invalid profile data. Missing required fields.');
        return;
      }

      onImport(data);
      toast.success('Profile imported successfully');
      setIsImportDialogOpen(false);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Import failed. Please check your file format.');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const createBackup = async () => {
    setIsBackingUp(true);
    
    try {
      const backup = {
        profile,
        metadata: {
          exportedAt: new Date().toISOString(),
          version: '1.0',
          source: 'Jewelia CRM'
        }
      };

      const content = JSON.stringify(backup, null, 2);
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `jewelia_profile_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Profile backup created successfully');
      setIsBackupDialogOpen(false);
    } catch (error) {
      console.error('Backup error:', error);
      toast.error('Backup failed. Please try again.');
    } finally {
      setIsBackingUp(false);
    }
  };

  const shareProfile = async () => {
    const profileUrl = `${window.location.origin}/profile/${profile.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name} - Professional Profile`,
          text: `Check out ${profile.name}'s professional profile on Jewelia`,
          url: profileUrl
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      copyToClipboard(profileUrl, (msg) => toast.success(msg));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Archive className="h-5 w-5 text-emerald-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Export & Import</h3>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setIsExportDialogOpen(true)}>
          <CardContent className="p-4 text-center">
            <Download className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900 dark:text-white">Export Profile</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Download in various formats</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setIsImportDialogOpen(true)}>
          <CardContent className="p-4 text-center">
            <Upload className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900 dark:text-white">Import Profile</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Restore from backup</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setIsBackupDialogOpen(true)}>
          <CardContent className="p-4 text-center">
            <Archive className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900 dark:text-white">Create Backup</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Full profile backup</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={shareProfile}>
          <CardContent className="p-4 text-center">
            <Share2 className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900 dark:text-white">Share Profile</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Share with others</p>
          </CardContent>
        </Card>
      </div>

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Profile
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Choose a format to export your profile data:
            </p>
            <div className="space-y-2">
              {exportFormats.map((format) => {
                const IconComponent = format.icon;
                return (
                  <div
                    key={format.id}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedFormat === format.id 
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                    onClick={() => setSelectedFormat(format.id)}
                  >
                    <IconComponent className="h-5 w-5 text-gray-500" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{format.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{format.description}</p>
                    </div>
                    {selectedFormat === format.id && (
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => exportProfile(selectedFormat)}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Profile
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Import profile data from a JSON backup file:
            </p>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Click to select a file or drag and drop
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Importing...
                  </>
                ) : (
                  'Select File'
                )}
              </Button>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <p className="font-medium">Warning</p>
                  <p>Importing will overwrite your current profile data. Make sure to backup first.</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Backup Dialog */}
      <Dialog open={isBackupDialogOpen} onOpenChange={setIsBackupDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5" />
              Create Backup
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create a complete backup of your profile including all data and settings:
            </p>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5" />
                <div className="text-sm text-emerald-800 dark:text-emerald-200">
                  <p className="font-medium">What's included:</p>
                  <ul className="mt-1 space-y-1">
                    <li>• Personal information</li>
                    <li>• Skills and certifications</li>
                    <li>• Portfolio and achievements</li>
                    <li>• Business metrics</li>
                    <li>• Privacy settings</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBackupDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={createBackup}
              disabled={isBackingUp}
              className="flex items-center gap-2"
            >
              {isBackingUp ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Backup...
                </>
              ) : (
                <>
                  <Archive className="h-4 w-4" />
                  Create Backup
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 