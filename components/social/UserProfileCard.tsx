import React from 'react'
import { ExtendedUser } from '@/types/social-network'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  MapPin, 
  Building2, 
  Briefcase, 
  Globe, 
  Phone, 
  Award,
  Shield,
  Calendar,
  Star
} from 'lucide-react'

interface UserProfileCardProps {
  user: ExtendedUser
  showFullProfile?: boolean
  className?: string
}

export function UserProfileCard({ user, showFullProfile = false, className = '' }: UserProfileCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatExperience = (years?: number) => {
    if (!years) return null
    if (years === 1) return '1 year'
    return `${years} years`
  }

  return (
    <Card className={`bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-sm ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12 border-2 border-blue-100">
            <AvatarImage src={user.avatar_url || ''} alt={user.full_name} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
              {getInitials(user.full_name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900 truncate">
                {user.full_name}
              </h3>
              {(user as any).is_verified && (
                <Shield className="h-4 w-4 text-blue-500" />
              )}
            </div>
            
            {(user as any).job_title && (
              <p className="text-sm text-gray-600 truncate flex items-center">
                <Briefcase className="h-3 w-3 mr-1" />
                {(user as any).job_title}
              </p>
            )}
            
            {(user as any).company && (
              <p className="text-sm text-gray-600 truncate flex items-center">
                <Building2 className="h-3 w-3 mr-1" />
                {(user as any).company}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Bio */}
        {user.bio && (
          <p className="text-sm text-gray-700 mb-3 leading-relaxed">
            {user.bio}
          </p>
        )}

        {/* Location */}
        {user.location && (
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <MapPin className="h-3 w-3 mr-2 text-gray-400" />
            {user.location}
          </div>
        )}

        {/* Contact Info - Only show if full profile */}
        {showFullProfile && (
          <>
            {(user as any).phone && (
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Phone className="h-3 w-3 mr-2 text-gray-400" />
                {(user as any).phone}
              </div>
            )}
            
            {user.website && (
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Globe className="h-3 w-3 mr-2 text-gray-400" />
                <a 
                  href={user.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  {user.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
          </>
        )}

        {/* Experience */}
        {(user as any).experience_years && (
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <Calendar className="h-3 w-3 mr-2 text-gray-400" />
            {formatExperience((user as any).experience_years)} experience
          </div>
        )}

        {/* Specialties */}
        {user.specialties && user.specialties.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
              Specialties
            </p>
            <div className="flex flex-wrap gap-1">
              {user.specialties.slice(0, 5).map((specialty, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border-blue-200"
                >
                  {specialty}
                </Badge>
              ))}
              {user.specialties.length > 5 && (
                <Badge variant="outline" className="text-xs px-2 py-1">
                  +{user.specialties.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Certifications */}
        {(user as any).certifications && (user as any).certifications.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide flex items-center">
              <Award className="h-3 w-3 mr-1" />
              Certifications
            </p>
            <div className="flex flex-wrap gap-1">
              {(user as any).certifications.slice(0, 3).map((cert: any, index: number) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-xs px-2 py-1 border-green-200 text-green-700 bg-green-50"
                >
                  {cert}
                </Badge>
              ))}
              {(user as any).certifications.length > 3 && (
                <Badge variant="outline" className="text-xs px-2 py-1">
                  +{(user as any).certifications.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Social Stats */}
        {user.social_stats && (
          <div className="pt-3 border-t border-gray-100">
            <div className="flex justify-around text-center">
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  {user.social_stats.posts || 0}
                </p>
                <p className="text-xs text-gray-500">Posts</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  {user.social_stats.followers || 0}
                </p>
                <p className="text-xs text-gray-500">Followers</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  {user.social_stats.following || 0}
                </p>
                <p className="text-xs text-gray-500">Following</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

