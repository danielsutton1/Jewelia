export interface PerformanceMetrics {
  loadTime: number;
  memoryUsage: number;
  networkLatency: number;
  cacheHitRate: number;
  lastOptimized: Date;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  fontSize: 'small' | 'medium' | 'large';
  colorBlindness: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  focusIndicator: boolean;
  altText: boolean;
}

export interface ExportHistory {
  id: string;
  format: string;
  exportedAt: Date;
  filename: string;
  size: number;
}

export interface ImportHistory {
  id: string;
  importedAt: Date;
  filename: string;
  status: 'success' | 'partial' | 'failed';
  recordsImported: number;
  errors: string[];
}

export interface ProfileBackup {
  id: string;
  createdAt: Date;
  filename: string;
  size: number;
  version: string;
  description: string;
}

export const mockPerformanceMetrics: PerformanceMetrics = {
  loadTime: 1250,
  memoryUsage: 85,
  networkLatency: 45,
  cacheHitRate: 92,
  lastOptimized: new Date('2024-01-15T10:30:00Z')
};

export const mockAccessibilitySettings: AccessibilitySettings = {
  highContrast: false,
  reducedMotion: false,
  screenReader: true,
  keyboardNavigation: true,
  fontSize: 'medium',
  colorBlindness: 'none',
  focusIndicator: true,
  altText: true
};

export const mockExportHistory: ExportHistory[] = [
  {
    id: '1',
    format: 'JSON',
    exportedAt: new Date('2024-01-15T14:30:00Z'),
    filename: 'sarah_johnson_profile.json',
    size: 2456
  },
  {
    id: '2',
    format: 'vCard',
    exportedAt: new Date('2024-01-14T09:15:00Z'),
    filename: 'sarah_johnson.vcf',
    size: 512
  },
  {
    id: '3',
    format: 'PDF',
    exportedAt: new Date('2024-01-12T16:45:00Z'),
    filename: 'sarah_johnson_resume.pdf',
    size: 1892
  },
  {
    id: '4',
    format: 'CSV',
    exportedAt: new Date('2024-01-10T11:20:00Z'),
    filename: 'sarah_johnson_profile.csv',
    size: 1024
  }
];

export const mockImportHistory: ImportHistory[] = [
  {
    id: '1',
    importedAt: new Date('2024-01-15T10:00:00Z'),
    filename: 'profile_backup_2024-01-10.json',
    status: 'success',
    recordsImported: 15,
    errors: []
  },
  {
    id: '2',
    importedAt: new Date('2024-01-12T15:30:00Z'),
    filename: 'legacy_profile_data.json',
    status: 'partial',
    recordsImported: 12,
    errors: ['Missing portfolio images', 'Invalid certification dates']
  },
  {
    id: '3',
    importedAt: new Date('2024-01-08T14:15:00Z'),
    filename: 'corrupted_profile.json',
    status: 'failed',
    recordsImported: 0,
    errors: ['Invalid JSON format', 'Missing required fields']
  }
];

export const mockProfileBackups: ProfileBackup[] = [
  {
    id: '1',
    createdAt: new Date('2024-01-15T14:30:00Z'),
    filename: 'jewelia_profile_backup_2024-01-15.json',
    size: 2456,
    version: '1.0',
    description: 'Complete profile backup including all data and settings'
  },
  {
    id: '2',
    createdAt: new Date('2024-01-10T09:15:00Z'),
    filename: 'jewelia_profile_backup_2024-01-10.json',
    size: 2189,
    version: '1.0',
    description: 'Profile backup before major updates'
  },
  {
    id: '3',
    createdAt: new Date('2024-01-05T16:45:00Z'),
    filename: 'jewelia_profile_backup_2024-01-05.json',
    size: 1956,
    version: '0.9',
    description: 'Legacy profile backup'
  }
];

export const mockEcosystemIntegrations = {
  signupFlow: {
    completed: true,
    completedAt: new Date('2024-01-01T10:00:00Z'),
    steps: [
      { step: 'Account Creation', completed: true, completedAt: new Date('2024-01-01T10:00:00Z') },
      { step: 'Profile Setup', completed: true, completedAt: new Date('2024-01-01T10:15:00Z') },
      { step: 'Verification', completed: true, completedAt: new Date('2024-01-01T10:30:00Z') },
      { step: 'Preferences', completed: true, completedAt: new Date('2024-01-01T10:45:00Z') }
    ]
  },
  dataFlow: {
    lastSync: new Date('2024-01-15T14:30:00Z'),
    syncStatus: 'success',
    integrations: [
      { name: 'CRM System', status: 'connected', lastSync: new Date('2024-01-15T14:30:00Z') },
      { name: 'Email Marketing', status: 'connected', lastSync: new Date('2024-01-15T14:25:00Z') },
      { name: 'Social Media', status: 'connected', lastSync: new Date('2024-01-15T14:20:00Z') },
      { name: 'Analytics', status: 'connected', lastSync: new Date('2024-01-15T14:15:00Z') }
    ]
  },
  sharingOptions: {
    publicProfile: true,
    qrCodeEnabled: true,
    socialSharing: true,
    embedCode: true,
    apiAccess: false
  },
  performance: {
    optimizationEnabled: true,
    lastOptimized: new Date('2024-01-15T10:30:00Z'),
    optimizationLevel: 'high',
    recommendations: [
      'Enable image compression',
      'Implement lazy loading',
      'Optimize database queries'
    ]
  }
}; 