"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  Users, 
  MapPin, 
  Building, 
  Award, 
  Star,
  TrendingUp,
  Filter,
  X,
  ArrowRight,
  Eye,
  MessageSquare
} from "lucide-react";
import Link from "next/link";

interface SearchResult {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  avatar?: string;
  skills: string[];
  isVerified: boolean;
  mutualConnections: number;
  lastActive: Date;
  relevanceScore: number;
}

interface SearchNetworkIntegrationProps {
  recentSearches: string[];
  suggestedConnections: SearchResult[];
  onSearch: (query: string) => void;
  onConnect: (userId: string) => void;
  onViewProfile: (userId: string) => void;
}

export function SearchNetworkIntegration({ 
  recentSearches, 
  suggestedConnections, 
  onSearch, 
  onConnect, 
  onViewProfile 
}: SearchNetworkIntegrationProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const filters = [
    { id: 'jewelers', label: 'Jewelers', icon: Award },
    { id: 'designers', label: 'Designers', icon: Star },
    { id: 'suppliers', label: 'Suppliers', icon: Building },
    { id: 'local', label: 'Local', icon: MapPin },
    { id: 'verified', label: 'Verified', icon: Award }
  ];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleFilter = (filterId: string) => {
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Recently';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-emerald-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Network Search</h3>
        </div>
        <Link href="/dashboard/search-network">
          <Button variant="outline" size="sm">
            Advanced Search
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search for professionals, skills, companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch}>
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => {
              const IconComponent = filter.icon;
              const isActive = activeFilters.includes(filter.id);
              
              return (
                <Button
                  key={filter.id}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleFilter(filter.id)}
                  className="flex items-center gap-2"
                >
                  <IconComponent className="h-4 w-4" />
                  {filter.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Searches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentSearches.slice(0, 5).map((search, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                  onClick={() => {
                    setSearchQuery(search);
                    onSearch(search);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {search}
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggested Connections */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Suggested Connections</CardTitle>
            <Badge variant="outline" className="text-xs">
              {suggestedConnections.length} suggestions
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {suggestedConnections.slice(0, 5).map((connection) => (
              <div
                key={connection.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={connection.avatar} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700">
                      {connection.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {connection.name}
                      </p>
                      {connection.isVerified && (
                        <Award className="h-4 w-4 text-emerald-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {connection.title} at {connection.company}
                    </p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {connection.location}
                      </span>
                      {connection.mutualConnections > 0 && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {connection.mutualConnections} mutual
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewProfile(connection.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onConnect(connection.id)}
                  >
                    Connect
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {suggestedConnections.length > 5 && (
            <div className="mt-4 text-center">
              <Link href="/dashboard/search-network">
                <Button variant="outline" className="w-full">
                  View All Suggestions
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Tips */}
      <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20">
        <CardContent className="p-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            Search Tips
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <Search className="h-4 w-4 text-emerald-600 mt-0.5" />
              <div>
                <p className="font-medium">Use specific keywords</p>
                <p className="text-gray-600 dark:text-gray-400">Try "diamond setting" or "CAD design"</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">Search by location</p>
                <p className="text-gray-600 dark:text-gray-400">Find local professionals</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Building className="h-4 w-4 text-purple-600 mt-0.5" />
              <div>
                <p className="font-medium">Search by company</p>
                <p className="text-gray-600 dark:text-gray-400">Find people from specific companies</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Award className="h-4 w-4 text-orange-600 mt-0.5" />
              <div>
                <p className="font-medium">Filter by verification</p>
                <p className="text-gray-600 dark:text-gray-400">Find verified professionals</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 