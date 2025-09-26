"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  Circle, 
  AlertCircle, 
  Target, 
  TrendingUp,
  Star,
  Award,
  Users,
  Image,
  FileText,
  Shield
} from "lucide-react";

interface ProfileSection {
  id: string;
  name: string;
  completed: boolean;
  weight: number;
  description: string;
  icon: any;
  suggestions: string[];
}

interface ProfileCompletionProps {
  profile: any;
  onSectionClick: (sectionId: string) => void;
}

const profileSections: ProfileSection[] = [
  {
    id: "basic",
    name: "Basic Information",
    completed: false,
    weight: 15,
    description: "Name, title, company, location",
    icon: Users,
    suggestions: [
      "Add a professional profile photo",
      "Complete your bio with industry expertise",
      "Add your current task title and company"
    ]
  },
  {
    id: "contact",
    name: "Contact Information",
    completed: false,
    weight: 10,
    description: "Email, phone, website",
    icon: Users,
    suggestions: [
      "Add your professional email address",
      "Include your business phone number",
      "Add your company website"
    ]
  },
  {
    id: "skills",
    name: "Skills & Expertise",
    completed: false,
    weight: 20,
    description: "Professional skills and certifications",
    icon: Award,
    suggestions: [
      "Add at least 5 professional skills",
      "Include industry-specific certifications",
      "Rate your proficiency levels accurately"
    ]
  },
  {
    id: "metrics",
    name: "Business Metrics",
    completed: false,
    weight: 15,
    description: "Experience, projects, achievements",
    icon: TrendingUp,
    suggestions: [
      "Add your years of experience",
      "Include key achievements and awards",
      "List major projects completed"
    ]
  },
  {
    id: "portfolio",
    name: "Portfolio",
    completed: false,
    weight: 20,
    description: "Work samples and projects",
    icon: Image,
    suggestions: [
      "Add at least 3 portfolio items",
      "Include high-quality images of your work",
      "Write detailed descriptions for each piece"
    ]
  },
  {
    id: "verification",
    name: "Verification",
    completed: false,
    weight: 10,
    description: "Certifications and verification status",
    icon: Shield,
    suggestions: [
      "Add professional certifications",
      "Verify your credentials",
      "Complete identity verification"
    ]
  },
  {
    id: "social",
    name: "Social Links",
    completed: false,
    weight: 10,
    description: "LinkedIn, professional networks",
    icon: Users,
    suggestions: [
      "Add your LinkedIn profile",
      "Include other professional social media",
      "Ensure all links are active and professional"
    ]
  }
];

export function ProfileCompletion({ profile, onSectionClick }: ProfileCompletionProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const calculateCompletion = () => {
    let totalWeight = 0;
    let completedWeight = 0;

    profileSections.forEach(section => {
      totalWeight += section.weight;
      
      // Check if section is completed based on profile data
      let isCompleted = false;
      
      switch (section.id) {
        case "basic":
          isCompleted = !!(profile.name && profile.title && profile.company && profile.location && profile.bio);
          break;
        case "contact":
          isCompleted = !!(profile.email && profile.phone);
          break;
        case "skills":
          isCompleted = !!(profile.skills && profile.skills.length >= 3);
          break;
        case "metrics":
          isCompleted = !!(profile.businessMetrics && profile.achievements && profile.achievements.length > 0);
          break;
        case "portfolio":
          isCompleted = !!(profile.portfolio && profile.portfolio.length >= 2);
          break;
        case "verification":
          isCompleted = !!(profile.certifications && profile.certifications.length > 0 && profile.isVerified);
          break;
        case "social":
          isCompleted = !!(profile.social && (profile.social.linkedin || profile.social.instagram));
          break;
      }
      
      if (isCompleted) {
        completedWeight += section.weight;
      }
    });

    return {
      percentage: Math.round((completedWeight / totalWeight) * 100),
      completedWeight,
      totalWeight
    };
  };

  const completion = calculateCompletion();

  const getCompletionLevel = () => {
    if (completion.percentage >= 90) return { level: "Excellent", color: "text-emerald-600", bg: "bg-emerald-100" };
    if (completion.percentage >= 70) return { level: "Good", color: "text-blue-600", bg: "bg-blue-100" };
    if (completion.percentage >= 50) return { level: "Fair", color: "text-yellow-600", bg: "bg-yellow-100" };
    return { level: "Needs Work", color: "text-red-600", bg: "bg-red-100" };
  };

  const completionLevel = getCompletionLevel();

  const getIncompleteSections = () => {
    return profileSections.filter(section => {
      // Check completion logic here
      switch (section.id) {
        case "basic":
          return !(profile.name && profile.title && profile.company && profile.location && profile.bio);
        case "contact":
          return !(profile.email && profile.phone);
        case "skills":
          return !(profile.skills && profile.skills.length >= 3);
        case "metrics":
          return !(profile.businessMetrics && profile.achievements && profile.achievements.length > 0);
        case "portfolio":
          return !(profile.portfolio && profile.portfolio.length >= 2);
        case "verification":
          return !(profile.certifications && profile.certifications.length > 0 && profile.isVerified);
        case "social":
          return !(profile.social && (profile.social.linkedin || profile.social.instagram));
        default:
          return false;
      }
    });
  };

  const incompleteSections = getIncompleteSections();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-emerald-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Completion</h3>
        </div>
        <Badge className={`${completionLevel.bg} ${completionLevel.color}`}>
          {completionLevel.level}
        </Badge>
      </div>

      {/* Completion Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                {completion.percentage}%
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {completion.completedWeight} of {completion.totalWeight} points completed
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl">
                {completion.percentage >= 90 ? "🏆" : completion.percentage >= 70 ? "⭐" : completion.percentage >= 50 ? "📈" : "🎯"}
              </div>
            </div>
          </div>
          
          <Progress value={completion.percentage} className="mb-4" />
          
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Basic</span>
            <span>Complete</span>
          </div>
        </CardContent>
      </Card>

      {/* Section Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Sections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {profileSections.map((section) => {
              const IconComponent = section.icon;
              const isCompleted = !incompleteSections.find(s => s.id === section.id);
              
              return (
                <div
                  key={section.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                  onClick={() => onSectionClick(section.id)}
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {section.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {section.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {section.weight} pts
                    </span>
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Improvement Suggestions */}
      {incompleteSections.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Improvement Suggestions</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSuggestions(!showSuggestions)}
              >
                {showSuggestions ? "Hide" : "Show"} Details
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {incompleteSections.slice(0, showSuggestions ? undefined : 3).map((section) => (
                <div key={section.id} className="border-l-4 border-l-emerald-500 pl-4">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                    {section.name}
                  </h5>
                  <ul className="space-y-1">
                    {section.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() => onSectionClick(section.id)}
                  >
                    Complete {section.name}
                  </Button>
                </div>
              ))}
              
              {!showSuggestions && incompleteSections.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSuggestions(true)}
                  className="w-full"
                >
                  Show {incompleteSections.length - 3} more suggestions
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Benefits of Completion */}
      <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20">
        <CardContent className="p-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            Benefits of a Complete Profile
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
              <Star className="h-5 w-5 text-emerald-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Higher Visibility</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Appear in more search results</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Users className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">More Connections</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Attract professional opportunities</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Better Engagement</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Increase profile views and interactions</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Award className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Professional Credibility</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Build trust with potential clients</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 