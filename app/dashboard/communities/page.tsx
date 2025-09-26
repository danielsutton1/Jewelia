'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Plus, 
  Users, 
  MessageSquare, 
  Calendar, 
  Shield,
  Globe,
  Lock,
  EyeOff,
  Star,
  TrendingUp
} from 'lucide-react';
import { SocialCommunity, CommunityCategory } from '@/types/community-features';

const COMMUNITY_CATEGORIES: { value: CommunityCategory; label: string; icon: string }[] = [
  { value: 'jewelry_design', label: 'Jewelry Design', icon: '💎' },
  { value: 'gemology', label: 'Gemology', icon: '🔬' },
  { value: 'business', label: 'Business', icon: '💼' },
  { value: 'education', label: 'Education', icon: '📚' },
  { value: 'vintage_jewelry', label: 'Vintage Jewelry', icon: '🕰️' },
  { value: 'modern_design', label: 'Modern Design', icon: '✨' },
  { value: 'diamond_experts', label: 'Diamond Experts', icon: '💎' },
  { value: 'gemstone_specialists', label: 'Gemstone Specialists', icon: '💍' },
  { value: 'jewelry_repair', label: 'Jewelry Repair', icon: '🔧' },
  { value: 'appraisal', label: 'Appraisal', icon: '📊' },
  { value: 'other', label: 'Other', icon: '🌟' }
];

const PRIVACY_LEVELS = [
  { value: 'public', label: 'Public', icon: Globe, description: 'Anyone can view and join' },
  { value: 'private', label: 'Private', icon: Lock, description: 'Approval required to join' },
  { value: 'secret', label: 'Secret', icon: EyeOff, description: 'Invitation only' }
];

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<SocialCommunity[]>([]);
  const [filteredCommunities, setFilteredCommunities] = useState<SocialCommunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CommunityCategory | 'all'>('all');
  const [selectedPrivacy, setSelectedPrivacy] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [activeTab, setActiveTab] = useState('discover');

  // Mock data for demonstration
  useEffect(() => {
    const mockCommunities: SocialCommunity[] = [
      {
        id: '1',
        name: 'Diamond Experts Network',
        slug: 'diamond-experts',
        description: 'Connect with certified diamond experts, share knowledge about diamond grading, and stay updated on industry standards.',
        category: 'diamond_experts',
        privacy_level: 'public',
        member_count: 1247,
        post_count: 89,
        is_verified: true,
        created_by: 'user1',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-20T14:30:00Z'
      },
      {
        id: '2',
        name: 'Vintage Jewelry Collectors',
        slug: 'vintage-collectors',
        description: 'A community for vintage jewelry enthusiasts to share finds, discuss history, and trade rare pieces.',
        category: 'vintage_jewelry',
        privacy_level: 'private',
        member_count: 892,
        post_count: 156,
        is_verified: true,
        created_by: 'user2',
        created_at: '2024-01-10T09:00:00Z',
        updated_at: '2024-01-18T16:45:00Z'
      },
      {
        id: '3',
        name: 'Modern Jewelry Designers',
        slug: 'modern-designers',
        description: 'Contemporary jewelry design community for sharing techniques, inspiration, and industry trends.',
        category: 'modern_design',
        privacy_level: 'public',
        member_count: 2156,
        post_count: 234,
        is_verified: true,
        created_by: 'user3',
        created_at: '2024-01-05T11:00:00Z',
        updated_at: '2024-01-22T10:15:00Z'
      },
      {
        id: '4',
        name: 'Gemology Students',
        slug: 'gemology-students',
        description: 'Educational community for gemology students and professionals to discuss studies and share resources.',
        category: 'education',
        privacy_level: 'public',
        member_count: 567,
        post_count: 78,
        is_verified: false,
        created_by: 'user4',
        created_at: '2024-01-12T13:00:00Z',
        updated_at: '2024-01-19T12:00:00Z'
      },
      {
        id: '5',
        name: 'Jewelry Business Network',
        slug: 'business-network',
        description: 'Business-focused community for jewelry entrepreneurs, retailers, and industry professionals.',
        category: 'business',
        privacy_level: 'private',
        member_count: 1345,
        post_count: 189,
        is_verified: true,
        created_by: 'user5',
        created_at: '2024-01-08T15:00:00Z',
        updated_at: '2024-01-21T09:30:00Z'
      }
    ];

    setCommunities(mockCommunities);
    setFilteredCommunities(mockCommunities);
    setLoading(false);
  }, []);

  // Filter and sort communities
  useEffect(() => {
    let filtered = communities;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(community =>
        community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        community.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(community => community.category === selectedCategory);
    }

    // Apply privacy filter
    if (selectedPrivacy !== 'all') {
      filtered = filtered.filter(community => community.privacy_level === selectedPrivacy);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof SocialCommunity];
      let bValue: any = b[sortBy as keyof SocialCommunity];

      if (sortBy === 'created_at' || sortBy === 'updated_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredCommunities(filtered);
  }, [communities, searchTerm, selectedCategory, selectedPrivacy, sortBy, sortOrder]);

  const getPrivacyIcon = (privacy: string) => {
    const level = PRIVACY_LEVELS.find(p => p.value === privacy);
    return level ? level.icon : Globe;
  };

  const getCategoryIcon = (category: CommunityCategory) => {
    const cat = COMMUNITY_CATEGORIES.find(c => c.value === category);
    return cat ? cat.icon : '🌟';
  };

  const formatMemberCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading communities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Communities</h1>
          <p className="text-muted-foreground">
            Discover and join jewelry communities that match your interests
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Community
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Communities</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{communities.length}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatMemberCount(communities.reduce((sum, c) => sum + c.member_count, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {communities.reduce((sum, c) => sum + c.post_count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Communities</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {communities.filter(c => c.member_count > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {((communities.filter(c => c.member_count > 0).length / communities.length) * 100).toFixed(0)}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="my-communities">My Communities</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
        </TabsList>

        {/* Discover Tab */}
        <TabsContent value="discover" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Find Communities</CardTitle>
              <CardDescription>
                Use filters to find communities that match your interests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search communities..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as any)}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {COMMUNITY_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.icon} {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedPrivacy} onValueChange={setSelectedPrivacy}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="All Privacy Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Privacy Levels</SelectItem>
                    {PRIVACY_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="member_count">Member Count</SelectItem>
                    <SelectItem value="post_count">Post Count</SelectItem>
                    <SelectItem value="created_at">Created Date</SelectItem>
                    <SelectItem value="updated_at">Updated Date</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as 'asc' | 'desc')}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Sort order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Community Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCommunities.map((community) => (
              <Card key={community.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center text-white text-xl">
                        {getCategoryIcon(community.category)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{community.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          {community.is_verified && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {(() => {
                              const IconComponent = getPrivacyIcon(community.privacy_level);
                              return <IconComponent className="h-3 w-3 mr-1" />;
                            })()}
                            {PRIVACY_LEVELS.find(p => p.value === community.privacy_level)?.label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {community.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{formatMemberCount(community.member_count)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span>{community.post_count}</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {getCategoryIcon(community.category)} {COMMUNITY_CATEGORIES.find(c => c.value === community.category)?.label}
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1" size="sm">
                      Join Community
                    </Button>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCommunities.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No communities found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Try adjusting your search criteria or create a new community
                </p>
                <Button>Create Community</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* My Communities Tab */}
        <TabsContent value="my-communities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Communities</CardTitle>
              <CardDescription>
                Communities you've joined or created
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No communities yet</h3>
                <p className="text-muted-foreground mb-4">
                  Join communities to connect with other jewelry professionals
                </p>
                <Button>Discover Communities</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Moderation Tab */}
        <TabsContent value="moderation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Moderation</CardTitle>
              <CardDescription>
                Manage community guidelines and content reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No moderation access</h3>
                <p className="text-muted-foreground mb-4">
                  You need to be an admin or moderator to access moderation tools
                </p>
                <Button variant="outline">Learn More</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 