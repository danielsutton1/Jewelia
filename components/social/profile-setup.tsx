"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Loader2, User, Globe, Shield, Bell } from 'lucide-react'
import { toast } from 'sonner'
import { SocialProfileService } from '@/lib/services/SocialProfileService'

interface ProfileSetupProps {
  userId: string
  onComplete?: () => void
}

const industries = [
  'Jewelry Design',
  'Jewelry Manufacturing',
  'Jewelry Retail',
  'Jewelry Wholesale',
  'Jewelry Repair',
  'Jewelry Appraisal',
  'Jewelry Education',
  'Jewelry Photography',
  'Jewelry Marketing',
  'Jewelry Technology',
  'Other'
]

export function ProfileSetup({ userId, onComplete }: ProfileSetupProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    display_name: '',
    username: '',
    bio: '',
    company: '',
    job_title: '',
    industry: '',
    location: '',
    website_url: '',
    is_public: true,
    show_online_status: true,
    allow_messages: true,
    allow_follows: true,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.display_name.trim()) {
      newErrors.display_name = 'Display name is required'
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters long'
    }

    if (formData.bio && formData.bio.length > 1000) {
      newErrors.bio = 'Bio must be less than 1000 characters'
    }

    if (formData.website_url && !isValidUrl(formData.website_url)) {
      newErrors.website_url = 'Please enter a valid URL'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleNext = () => {
    if (validateForm()) {
      setStep(step + 1)
    }
  }

  const handlePrevious = () => {
    setStep(step - 1)
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const socialProfileService = new SocialProfileService()
      await socialProfileService.createProfile(userId, formData)

      toast.success('Profile created successfully!')
      
      if (onComplete) {
        onComplete()
      } else {
        router.push('/dashboard/social-network')
      }
    } catch (error: any) {
      console.error('Error creating profile:', error)
      
      if (error.message === 'Username already taken') {
        setErrors({ username: 'Username is already taken. Please choose another one.' })
      } else {
        toast.error('Failed to create profile. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="display_name">Display Name *</Label>
        <Input
          id="display_name"
          placeholder="Enter your display name"
          value={formData.display_name}
          onChange={(e) => handleInputChange('display_name', e.target.value)}
          className={errors.display_name ? 'border-red-500' : ''}
        />
        {errors.display_name && (
          <p className="text-sm text-red-500">{errors.display_name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Username *</Label>
        <Input
          id="username"
          placeholder="Choose a unique username"
          value={formData.username}
          onChange={(e) => handleInputChange('username', e.target.value)}
          className={errors.username ? 'border-red-500' : ''}
        />
        {errors.username && (
          <p className="text-sm text-red-500">{errors.username}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Username can only contain letters, numbers, and underscores
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          placeholder="Tell us about yourself and your jewelry expertise..."
          value={formData.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          rows={4}
          maxLength={1000}
          className={errors.bio ? 'border-red-500' : ''}
        />
        {errors.bio && (
          <p className="text-sm text-red-500">{errors.bio}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {formData.bio.length}/1000 characters
        </p>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="company">Company</Label>
        <Input
          id="company"
          placeholder="Your company name"
          value={formData.company}
          onChange={(e) => handleInputChange('company', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="job_title">Job Title</Label>
        <Input
          id="job_title"
          placeholder="Your role or position"
          value={formData.job_title}
          onChange={(e) => handleInputChange('job_title', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="industry">Industry *</Label>
        <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select your industry" />
          </SelectTrigger>
          <SelectContent>
            {industries.map((industry) => (
              <SelectItem key={industry} value={industry}>
                {industry}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          placeholder="City, State, or Country"
          value={formData.location}
          onChange={(e) => handleInputChange('location', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="website_url">Website</Label>
        <Input
          id="website_url"
          placeholder="https://yourwebsite.com"
          value={formData.website_url}
          onChange={(e) => handleInputChange('website_url', e.target.value)}
          className={errors.website_url ? 'border-red-500' : ''}
        />
        {errors.website_url && (
          <p className="text-sm text-red-500">{errors.website_url}</p>
        )}
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Privacy Settings
        </h3>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Public Profile</Label>
            <p className="text-sm text-muted-foreground">
              Allow others to find and view your profile
            </p>
          </div>
          <Switch
            checked={formData.is_public}
            onCheckedChange={(checked) => handleInputChange('is_public', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Show Online Status</Label>
            <p className="text-sm text-muted-foreground">
              Display when you're active on the platform
            </p>
          </div>
          <Switch
            checked={formData.show_online_status}
            onCheckedChange={(checked) => handleInputChange('show_online_status', checked)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Connection Settings
        </h3>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Allow Messages</Label>
            <p className="text-sm text-muted-foreground">
              Let other users send you messages
            </p>
          </div>
          <Switch
            checked={formData.allow_messages}
            onCheckedChange={(checked) => handleInputChange('allow_messages', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Allow Follows</Label>
            <p className="text-sm text-muted-foreground">
              Let other users follow your profile
            </p>
          </div>
          <Switch
            checked={formData.allow_follows}
            onCheckedChange={(checked) => handleInputChange('allow_follows', checked)}
          />
        </div>
      </div>
    </div>
  )

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return renderStep1()
      case 2:
        return renderStep2()
      case 3:
        return renderStep3()
      default:
        return null
    }
  }

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return 'Basic Information'
      case 2:
        return 'Professional Details'
      case 3:
        return 'Privacy & Settings'
      default:
        return ''
    }
  }

  const getStepDescription = () => {
    switch (step) {
      case 1:
        return 'Set up your basic profile information'
      case 2:
        return 'Tell us about your professional background'
      case 3:
        return 'Configure your privacy and connection preferences'
      default:
        return ''
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
          <CardDescription>
            {getStepDescription()}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>

          {/* Step Indicator */}
          <div className="flex justify-center space-x-2">
            {[1, 2, 3].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  stepNumber <= step
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {stepNumber}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="min-h-[400px]">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={step === 1}
            >
              Previous
            </Button>

            <div className="flex gap-2">
              {step < 3 ? (
                <Button onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Profile...
                    </>
                  ) : (
                    'Complete Setup'
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Skip Option */}
          {step === 1 && (
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
                className="text-muted-foreground"
              >
                Skip for now
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 