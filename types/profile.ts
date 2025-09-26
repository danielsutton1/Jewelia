export interface Skill {
  name: string;
  category: 'Design' | 'Manufacturing' | 'Sales' | 'Appraisal' | 'Technology' | 'Management' | 'Other';
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

export interface Achievement {
  title: string;
  description: string;
  year: number;
  type: 'Award' | 'Certification' | 'Publication' | 'Project' | 'Recognition';
}

export interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  category: 'Engagement Rings' | 'Wedding Bands' | 'Necklaces' | 'Earrings' | 'Bracelets' | 'Custom Design' | 'Other';
  year: number;
  isPublic: boolean;
}

export interface BusinessMetrics {
  yearsExperience: number;
  projectsCompleted: number;
  clientsServed: number;
  averageRating: number;
  totalRevenue?: number;
  teamSize?: number;
}

export interface Certification {
  name: string;
  issuer: string;
  year: number;
  expiryDate?: string;
  isVerified: boolean;
}

export interface PrivacySettings {
  showEmail: boolean;
  showPhone: boolean;
  showMetrics: boolean;
  showPortfolio: boolean;
  showConnections: boolean;
  allowConnectionRequests: boolean;
  publicProfile: boolean;
}

export interface SocialLinks {
  linkedin?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
}

export interface ProfileData {
  name: string;
  title: string;
  company: string;
  location: string;
  bio: string;
  website?: string;
  email: string;
  phone?: string;
  specialties?: string[];
  skills?: Skill[];
  achievements?: Achievement[];
  portfolio?: PortfolioItem[];
  businessMetrics?: BusinessMetrics;
  certifications?: Certification[];
  privacy?: PrivacySettings;
  social?: SocialLinks;
  businessType?: string;
  avatar?: string;
  isVerified?: boolean;
  verificationLevel?: 'None' | 'Basic' | 'Professional' | 'Premium';
} 