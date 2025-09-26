// Mock data for profile analytics and social features

export const mockProfileViews = [
  {
    id: "1",
    visitorName: "Sarah Johnson",
    visitorCompany: "Diamond District Designs",
    visitorTitle: "Senior Jewelry Designer",
    viewedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    source: 'qr' as const,
    duration: 180, // 3 minutes
    viewedSections: ['portfolio', 'skills', 'contact']
  },
  {
    id: "2",
    visitorName: "Michael Chen",
    visitorCompany: "Precious Metals Co.",
    visitorTitle: "Supply Chain Manager",
    viewedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    source: 'search' as const,
    duration: 120, // 2 minutes
    viewedSections: ['business-metrics', 'portfolio']
  },
  {
    id: "3",
    visitorName: "Emily Rodriguez",
    visitorCompany: "Artisan Jewelers",
    visitorTitle: "Master Craftsman",
    viewedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    source: 'network' as const,
    duration: 300, // 5 minutes
    viewedSections: ['skills', 'portfolio', 'achievements']
  },
  {
    id: "4",
    visitorName: "David Kim",
    visitorCompany: "Luxury Jewelry Boutique",
    visitorTitle: "Store Manager",
    viewedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    source: 'direct' as const,
    duration: 90, // 1.5 minutes
    viewedSections: ['contact', 'portfolio']
  },
  {
    id: "5",
    visitorName: "Lisa Thompson",
    visitorCompany: "Custom Jewelry Studio",
    visitorTitle: "Owner",
    viewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    source: 'qr' as const,
    duration: 240, // 4 minutes
    viewedSections: ['portfolio', 'skills', 'business-metrics']
  }
];

export const mockConnectionMetrics = [
  {
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 6 days ago
    connections: 5,
    requests: 8,
    accepted: 4
  },
  {
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days ago
    connections: 3,
    requests: 5,
    accepted: 2
  },
  {
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 4 days ago
    connections: 7,
    requests: 12,
    accepted: 6
  },
  {
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days ago
    connections: 2,
    requests: 3,
    accepted: 1
  },
  {
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days ago
    connections: 4,
    requests: 7,
    accepted: 3
  },
  {
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 day ago
    connections: 6,
    requests: 9,
    accepted: 5
  },
  {
    date: new Date().toISOString().split('T')[0], // today
    connections: 2,
    requests: 4,
    accepted: 2
  }
];

export const mockEngagementMetrics = [
  {
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 6 days ago
    profileViews: 12,
    qrScans: 8,
    shares: 3,
    messages: 5
  },
  {
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days ago
    profileViews: 15,
    qrScans: 12,
    shares: 4,
    messages: 7
  },
  {
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 4 days ago
    profileViews: 8,
    qrScans: 5,
    shares: 2,
    messages: 3
  },
  {
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days ago
    profileViews: 20,
    qrScans: 15,
    shares: 6,
    messages: 9
  },
  {
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days ago
    profileViews: 18,
    qrScans: 14,
    shares: 5,
    messages: 8
  },
  {
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 day ago
    profileViews: 25,
    qrScans: 18,
    shares: 7,
    messages: 12
  },
  {
    date: new Date().toISOString().split('T')[0], // today
    profileViews: 10,
    qrScans: 7,
    shares: 3,
    messages: 4
  }
];

export const mockActivities = [
  {
    id: "1",
    type: 'profile_view' as const,
    title: "Profile viewed by Sarah Johnson",
    description: "Senior Jewelry Designer at Diamond District Designs viewed your profile",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    user: {
      name: "Sarah Johnson",
      avatar: "/avatars/sarah.jpg",
      company: "Diamond District Designs"
    },
    metadata: {
      views: 1
    }
  },
  {
    id: "2",
    type: 'connection' as const,
    title: "New connection request",
    description: "Michael Chen from Precious Metals Co. wants to connect",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    user: {
      name: "Michael Chen",
      avatar: "/avatars/michael.jpg",
      company: "Precious Metals Co."
    }
  },
  {
    id: "3",
    type: 'message' as const,
    title: "New message received",
    description: "Emily Rodriguez sent you a message about collaboration",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    user: {
      name: "Emily Rodriguez",
      avatar: "/avatars/emily.jpg",
      company: "Artisan Jewelers"
    }
  },
  {
    id: "4",
    type: 'qr_scan' as const,
    title: "QR code scanned",
    description: "Your QR code was scanned by a potential client",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    metadata: {
      views: 1
    }
  },
  {
    id: "5",
    type: 'achievement' as const,
    title: "Achievement unlocked",
    description: "You've reached 100 profile views!",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    metadata: {
      achievement: "Profile Popularity"
    }
  },
  {
    id: "6",
    type: 'portfolio_update' as const,
    title: "Portfolio updated",
    description: "You added a new piece to your portfolio",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: "7",
    type: 'skill_added' as const,
    title: "Skill added",
    description: "You added 'CAD Design' to your skills",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    metadata: {
      skill: "CAD Design"
    }
  },
  {
    id: "8",
    type: 'connection' as const,
    title: "Connection accepted",
    description: "David Kim accepted your connection request",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    user: {
      name: "David Kim",
      avatar: "/avatars/david.jpg",
      company: "Luxury Jewelry Boutique"
    }
  }
];

export const mockRecentSearches = [
  "diamond setting",
  "CAD jewelry design",
  "jewelry suppliers",
  "gemstone cutting",
  "custom engagement rings"
];

export const mockSuggestedConnections = [
  {
    id: "1",
    name: "Jennifer Martinez",
    title: "Master Gemologist",
    company: "Gemstone Experts Inc.",
    location: "New York, NY",
    avatar: "/avatars/jennifer.jpg",
    skills: ["Gemology", "Diamond Grading", "Colored Stones"],
    isVerified: true,
    mutualConnections: 3,
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
    relevanceScore: 95
  },
  {
    id: "2",
    name: "Robert Wilson",
    title: "Jewelry CAD Designer",
    company: "Digital Jewelry Studio",
    location: "Los Angeles, CA",
    avatar: "/avatars/robert.jpg",
    skills: ["CAD Design", "3D Modeling", "Rapid Prototyping"],
    isVerified: true,
    mutualConnections: 2,
    lastActive: new Date(Date.now() - 4 * 60 * 60 * 1000),
    relevanceScore: 92
  },
  {
    id: "3",
    name: "Amanda Foster",
    title: "Diamond Setter",
    company: "Precision Setting Co.",
    location: "Chicago, IL",
    avatar: "/avatars/amanda.jpg",
    skills: ["Pave Setting", "Prong Setting", "Bezel Setting"],
    isVerified: false,
    mutualConnections: 1,
    lastActive: new Date(Date.now() - 6 * 60 * 60 * 1000),
    relevanceScore: 88
  },
  {
    id: "4",
    name: "Carlos Rodriguez",
    title: "Jewelry Manufacturer",
    company: "Artisan Manufacturing",
    location: "Miami, FL",
    avatar: "/avatars/carlos.jpg",
    skills: ["Manufacturing", "Quality Control", "Production Management"],
    isVerified: true,
    mutualConnections: 4,
    lastActive: new Date(Date.now() - 8 * 60 * 60 * 1000),
    relevanceScore: 85
  },
  {
    id: "5",
    name: "Lisa Chang",
    title: "Jewelry Appraiser",
    company: "Certified Appraisals",
    location: "San Francisco, CA",
    avatar: "/avatars/lisa.jpg",
    skills: ["Appraisal", "Insurance", "Authentication"],
    isVerified: true,
    mutualConnections: 2,
    lastActive: new Date(Date.now() - 12 * 60 * 60 * 1000),
    relevanceScore: 82
  }
]; 