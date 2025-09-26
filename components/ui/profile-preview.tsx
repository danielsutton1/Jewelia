"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Eye, 
  EyeOff, 
  User, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Building, 
  Award, 
  Star,
  TrendingUp,
  Image,
  Shield,
  Users,
  MessageSquare,
  Share2,
  Download,
  Copy,
  ExternalLink,
  Smartphone,
  Monitor
} from "lucide-react";
import { toast } from "sonner";
import { copyToClipboard } from "@/components/ui/utils";

interface ProfilePreviewProps {
  profile: any;
  privacy: any;
  onClose: () => void;
}

export function ProfilePreview({ profile, privacy, onClose }: ProfilePreviewProps) {
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState('overview');

  const getVisibleData = () => {
    return {
      name: profile.name,
      title: profile.title,
      company: profile.company,
      location: profile.location,
      bio: profile.bio,
      avatar: profile.avatar,
      website: profile.website,
      email: privacy.showEmail ? profile.email : null,
      phone: privacy.showPhone ? profile.phone : null,
      skills: profile.skills || [],
      achievements: profile.achievements || [],
      portfolio: privacy.showPortfolio ? (profile.portfolio || []) : [],
      businessMetrics: privacy.showMetrics ? profile.businessMetrics : null,
      certifications: profile.certifications || [],
      isVerified: profile.isVerified,
      verificationLevel: profile.verificationLevel,
      social: profile.social || {}
    };
  };

  const visibleData = getVisibleData();

  const handleCopyProfile = () => {
    const profileUrl = `${window.location.origin}/profile/${profile.id}`;
    copyToClipboard(profileUrl, (msg) => toast.success(msg));
  };

  const handleShareProfile = async () => {
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
      handleCopyProfile();
    }
  };

  const getVerificationBadge = () => {
    if (!visibleData.isVerified) return null;
    
    const levels = {
      'Basic': { color: 'bg-blue-100 text-blue-800', icon: Shield },
      'Professional': { color: 'bg-emerald-100 text-emerald-800', icon: Award },
      'Premium': { color: 'bg-purple-100 text-purple-800', icon: Star }
    };
    
    const level = levels[visibleData.verificationLevel as keyof typeof levels] || levels.Basic;
    const IconComponent = level.icon;
    
    return (
      <Badge className={`${level.color} flex items-center gap-1`}>
        <IconComponent className="h-3 w-3" />
        {visibleData.verificationLevel}
      </Badge>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden ${previewMode === 'mobile' ? 'max-w-sm' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Profile Preview
            </h2>
            <Badge variant="outline" className="text-xs">
              {previewMode === 'mobile' ? 'Mobile View' : 'Desktop View'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewMode(previewMode === 'desktop' ? 'mobile' : 'desktop')}
              className="flex items-center gap-2"
            >
              {previewMode === 'desktop' ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
              {previewMode === 'desktop' ? 'Mobile' : 'Desktop'}
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className={`p-6 ${previewMode === 'mobile' ? 'p-4' : ''}`}>
            {/* Profile Header */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={visibleData.avatar} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xl">
                      {visibleData.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {visibleData.name}
                      </h1>
                      {getVerificationBadge()}
                    </div>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                      {visibleData.title}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {visibleData.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {visibleData.location}
                      </span>
                    </div>
                    {visibleData.bio && (
                      <p className="mt-3 text-gray-700 dark:text-gray-300">
                        {visibleData.bio}
                      </p>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex flex-wrap gap-4">
                    {visibleData.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">{visibleData.email}</span>
                      </div>
                    )}
                    {visibleData.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">{visibleData.phone}</span>
                      </div>
                    )}
                    {visibleData.website && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <a 
                          href={visibleData.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                        >
                          {visibleData.website}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 pt-4 border-t flex gap-2">
                  <Button size="sm" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Send Message
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleShareProfile} className="flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCopyProfile} className="flex items-center gap-2">
                    <Copy className="h-4 w-4" />
                    Copy URL
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Profile Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="space-y-6">
                  {/* Business Metrics */}
                  {visibleData.businessMetrics && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Professional Experience
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-emerald-600">
                              {visibleData.businessMetrics.yearsExperience}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Years Experience</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {visibleData.businessMetrics.projectsCompleted}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Projects</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {visibleData.businessMetrics.clientsServed}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Clients</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">
                              {visibleData.businessMetrics.averageRating}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Rating</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Certifications */}
                  {visibleData.certifications.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Award className="h-5 w-5" />
                          Certifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {visibleData.certifications.map((cert: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {cert.name}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {cert.issuer} • {cert.year}
                                </p>
                              </div>
                              {cert.isVerified && (
                                <Badge className="bg-emerald-100 text-emerald-800">
                                  Verified
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="skills" className="mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {visibleData.skills.map((skill: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {skill.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {skill.category}
                            </p>
                          </div>
                          <Badge variant="outline">{skill.level}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="portfolio" className="mt-6">
                {visibleData.portfolio.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {visibleData.portfolio.map((item: any) => (
                      <Card key={item.id}>
                        <CardContent className="p-4">
                          <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 flex items-center justify-center">
                            {item.imageUrl ? (
                              <img 
                                src={item.imageUrl} 
                                alt={item.title}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <Image className="h-12 w-12 text-gray-400" />
                            )}
                          </div>
                          <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {item.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">{item.category}</Badge>
                            <span className="text-sm text-gray-500">{item.year}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Image className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 dark:text-gray-400">
                        No portfolio items are currently visible
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="achievements" className="mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {visibleData.achievements.map((achievement: any, index: number) => (
                        <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                          <Award className="h-5 w-5 text-emerald-600 mt-0.5" />
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {achievement.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                              {achievement.description}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{achievement.type}</Badge>
                              <span className="text-sm text-gray-500">{achievement.year}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
} 