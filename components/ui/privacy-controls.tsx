"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  EyeOff, 
  Shield, 
  Users, 
  Mail, 
  Phone, 
  TrendingUp, 
  Image, 
  Award,
  Settings,
  Globe
} from "lucide-react";

interface PrivacySettings {
  showEmail: boolean;
  showPhone: boolean;
  showMetrics: boolean;
  showPortfolio: boolean;
  showConnections: boolean;
  allowConnectionRequests: boolean;
  publicProfile: boolean;
}

interface PrivacyControlsProps {
  privacy: PrivacySettings;
  onPrivacyChange: (privacy: PrivacySettings) => void;
  editable?: boolean;
}

const privacyOptions = [
  {
    key: 'showEmail' as keyof PrivacySettings,
    label: 'Email Address',
    description: 'Allow others to see your email address',
    icon: Mail,
    category: 'Contact'
  },
  {
    key: 'showPhone' as keyof PrivacySettings,
    label: 'Phone Number',
    description: 'Allow others to see your phone number',
    icon: Phone,
    category: 'Contact'
  },
  {
    key: 'showMetrics' as keyof PrivacySettings,
    label: 'Business Metrics',
    description: 'Show your experience, projects, and achievements',
    icon: TrendingUp,
    category: 'Professional'
  },
  {
    key: 'showPortfolio' as keyof PrivacySettings,
    label: 'Portfolio',
    description: 'Display your work samples and projects',
    icon: Image,
    category: 'Professional'
  },
  {
    key: 'showConnections' as keyof PrivacySettings,
    label: 'Network Connections',
    description: 'Show your professional connections',
    icon: Users,
    category: 'Network'
  },
  {
    key: 'allowConnectionRequests' as keyof PrivacySettings,
    label: 'Connection Requests',
    description: 'Allow others to send you connection requests',
    icon: Users,
    category: 'Network'
  },
  {
    key: 'publicProfile' as keyof PrivacySettings,
    label: 'Public Profile',
    description: 'Make your profile discoverable in search results',
    icon: Globe,
    category: 'Visibility'
  }
];

export function PrivacyControls({ privacy, onPrivacyChange, editable = true }: PrivacyControlsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleToggle = (key: keyof PrivacySettings) => {
    onPrivacyChange({
      ...privacy,
      [key]: !privacy[key]
    });
  };

  const getCategoryOptions = (category: string) => {
    return privacyOptions.filter(option => option.category === category);
  };

  const getPublicCount = () => {
    return Object.values(privacy).filter(Boolean).length;
  };

  const getTotalCount = () => {
    return Object.keys(privacy).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-emerald-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Privacy Controls</h3>
          <Badge variant="secondary" className="ml-2">
            {getPublicCount()}/{getTotalCount()} public
          </Badge>
        </div>
        {editable && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Settings className="h-4 w-4 mr-2" />
            {showAdvanced ? 'Simple View' : 'Advanced View'}
          </Button>
        )}
      </div>

      {/* Privacy Summary */}
      <Card className="border-l-4 border-l-emerald-500">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                Profile Visibility
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {getPublicCount()} of {getTotalCount()} profile sections are visible to others
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-emerald-600">
                {Math.round((getPublicCount() / getTotalCount()) * 100)}%
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Public
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Options */}
      <div className="space-y-6">
        {/* Contact Information */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Information</h4>
          <div className="space-y-3">
            {getCategoryOptions('Contact').map((option) => {
              const IconComponent = option.icon;
              return (
                <Card key={option.key} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-5 w-5 text-gray-500" />
                        <div>
                          <Label htmlFor={option.key} className="font-medium text-gray-900 dark:text-white">
                            {option.label}
                          </Label>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {option.description}
                          </p>
                        </div>
                      </div>
                      {editable ? (
                        <Switch
                          id={option.key}
                          checked={privacy[option.key]}
                          onCheckedChange={() => handleToggle(option.key)}
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          {privacy[option.key] ? (
                            <Eye className="h-4 w-4 text-green-600" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          )}
                          <span className="text-sm text-gray-500">
                            {privacy[option.key] ? 'Public' : 'Private'}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Professional Information */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Professional Information</h4>
          <div className="space-y-3">
            {getCategoryOptions('Professional').map((option) => {
              const IconComponent = option.icon;
              return (
                <Card key={option.key} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-5 w-5 text-gray-500" />
                        <div>
                          <Label htmlFor={option.key} className="font-medium text-gray-900 dark:text-white">
                            {option.label}
                          </Label>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {option.description}
                          </p>
                        </div>
                      </div>
                      {editable ? (
                        <Switch
                          id={option.key}
                          checked={privacy[option.key]}
                          onCheckedChange={() => handleToggle(option.key)}
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          {privacy[option.key] ? (
                            <Eye className="h-4 w-4 text-green-600" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          )}
                          <span className="text-sm text-gray-500">
                            {privacy[option.key] ? 'Public' : 'Private'}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Network Settings */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Network Settings</h4>
          <div className="space-y-3">
            {getCategoryOptions('Network').map((option) => {
              const IconComponent = option.icon;
              return (
                <Card key={option.key} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-5 w-5 text-gray-500" />
                        <div>
                          <Label htmlFor={option.key} className="font-medium text-gray-900 dark:text-white">
                            {option.label}
                          </Label>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {option.description}
                          </p>
                        </div>
                      </div>
                      {editable ? (
                        <Switch
                          id={option.key}
                          checked={privacy[option.key]}
                          onCheckedChange={() => handleToggle(option.key)}
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          {privacy[option.key] ? (
                            <Eye className="h-4 w-4 text-green-600" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          )}
                          <span className="text-sm text-gray-500">
                            {privacy[option.key] ? 'Public' : 'Private'}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Privacy Tips */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                Privacy Tips
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Keep contact information private until you're ready to connect</li>
                <li>• Show your portfolio to attract potential clients</li>
                <li>• Display business metrics to build credibility</li>
                <li>• Allow connection requests to grow your network</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 