'use client'

import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  X, 
  Image, 
  Video, 
  Link, 
  BarChart3, 
  Star, 
  Trophy,
  MapPin,
  Tag,
  Gem,
  DollarSign,
  Globe,
  Users,
  Lock,
  Calendar
} from 'lucide-react'
import { SocialPost, CreatePostRequest, ContentType, PostVisibility } from '@/types/social-network'
import { useAuth } from '@/components/providers/auth-provider'

interface CreatePostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPostCreated: (post: SocialPost) => void
}

const CONTENT_TYPES: Array<{ value: ContentType; label: string; icon: React.ReactNode; description: string }> = [
  { value: 'text', label: 'Text Post', icon: <span className="text-2xl">📝</span>, description: 'Share your thoughts or updates' },
  { value: 'image', label: 'Image Post', icon: <Image className="h-5 w-5" />, description: 'Share photos or designs' },
  { value: 'video', label: 'Video Post', icon: <Video className="h-5 w-5" />, description: 'Share videos or tutorials' },
  { value: 'link', label: 'Link Post', icon: <Link className="h-5 w-5" />, description: 'Share interesting links' },
  { value: 'poll', label: 'Poll', icon: <BarChart3 className="h-5 w-5" />, description: 'Ask for community input' },
  { value: 'showcase', label: 'Showcase', icon: <Star className="h-5 w-5" />, description: 'Show off your work' },
  { value: 'achievement', label: 'Achievement', icon: <Trophy className="h-5 w-5" />, description: 'Celebrate milestones' }
]

const JEWELRY_CATEGORIES = [
  'Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Pendants', 'Chains',
  'Watches', 'Brooches', 'Anklets', 'Cufflinks', 'Tiaras', 'General'
]

const PRICE_RANGES = [
  'Under $100', '$100 - $500', '$500 - $1,000', '$1,000 - $5,000',
  '$5,000 - $10,000', '$10,000 - $50,000', 'Over $50,000'
]

export function CreatePostDialog({ open, onOpenChange, onPostCreated }: CreatePostDialogProps) {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [contentType, setContentType] = useState<ContentType>('text')
  const [mediaUrls, setMediaUrls] = useState<string[]>([])
  const [visibility, setVisibility] = useState<PostVisibility>('public')
  const [allowComments, setAllowComments] = useState(true)
  const [allowShares, setAllowShares] = useState(true)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [location, setLocation] = useState('')
  const [industryContext, setIndustryContext] = useState('')
  const [jewelryCategory, setJewelryCategory] = useState('')
  const [priceRange, setPriceRange] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!content.trim()) {
      newErrors.content = 'Content is required'
    }
    
    if (contentType === 'image' && mediaUrls.length === 0) {
      newErrors.media = 'At least one image is required for image posts'
    }
    
    if (contentType === 'video' && mediaUrls.length === 0) {
      newErrors.media = 'Video URL is required for video posts'
    }
    
    if (contentType === 'link' && !content.includes('http')) {
      newErrors.content = 'Please include a valid URL for link posts'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      const postData: CreatePostRequest = {
        content: content.trim(),
        content_type: contentType,
        media_urls: mediaUrls.length > 0 ? mediaUrls : undefined,
        visibility,
        allow_comments: allowComments,
        allow_shares: allowShares,
        tags: tags.length > 0 ? tags : undefined,
        location: location.trim() || undefined,
        industry_context: industryContext.trim() || undefined,
        jewelry_category: jewelryCategory || undefined,
        price_range: priceRange || undefined,
        scheduled_at: scheduledAt || undefined
      }

      const response = await fetch('/api/social/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      })

      const data = await response.json()

      if (data.success) {
        onPostCreated(data.data)
        resetForm()
      } else {
        setErrors({ submit: data.error || 'Failed to create post' })
      }
    } catch (error) {
      setErrors({ submit: 'An error occurred while creating the post' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setContent('')
    setContentType('text')
    setMediaUrls([])
    setVisibility('public')
    setAllowComments(true)
    setAllowShares(true)
    setTags([])
    setTagInput('')
    setLocation('')
    setIndustryContext('')
    setJewelryCategory('')
    setPriceRange('')
    setScheduledAt('')
    setErrors({})
  }

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()])
      }
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    // In a real implementation, you would upload these files to your storage service
    // For now, we'll just create placeholder URLs
    const newUrls = files.map(file => URL.createObjectURL(file))
    setMediaUrls([...mediaUrls, ...newUrls])
  }

  const removeMedia = (index: number) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index))
  }

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm()
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create New Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Content Type Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Post Type</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CONTENT_TYPES.map((type) => (
                <Button
                  key={type.value}
                  variant={contentType === type.value ? "default" : "outline"}
                  className="h-auto p-3 flex flex-col items-center gap-2"
                  onClick={() => setContentType(type.value)}
                >
                  <div className="text-lg">{type.icon}</div>
                  <div className="text-xs font-medium">{type.label}</div>
                  <div className="text-xs text-muted-foreground text-center">{type.description}</div>
                </Button>
              ))}
            </div>
          </div>

          {/* Content Input */}
          <div>
            <Label htmlFor="content" className="text-sm font-medium">
              {contentType === 'poll' ? 'Question' : 'Content'}
            </Label>
            <Textarea
              id="content"
              placeholder={
                contentType === 'poll' ? 'Ask your question here...' :
                contentType === 'link' ? 'Share your thoughts about this link...' :
                'What would you like to share?'
              }
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mt-2 min-h-[120px]"
            />
            {errors.content && (
              <p className="text-sm text-red-600 mt-1">{errors.content}</p>
            )}
          </div>

          {/* Media Upload */}
          {(contentType === 'image' || contentType === 'video') && (
            <div>
              <Label className="text-sm font-medium mb-2 block">
                {contentType === 'image' ? 'Images' : 'Video URL'}
              </Label>
              
              {contentType === 'image' ? (
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="mb-3"
                  >
                    <Image className="h-4 w-4 mr-2" />
                    Upload Images
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  {mediaUrls.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {mediaUrls.map((url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={url}
                            alt={`Media ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0"
                            onClick={() => removeMedia(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Input
                  placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                  value={mediaUrls[0] || ''}
                  onChange={(e) => setMediaUrls([e.target.value])}
                />
              )}
              
              {errors.media && (
                <p className="text-sm text-red-600 mt-1">{errors.media}</p>
              )}
            </div>
          )}

          {/* Tags */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Tags</Label>
            <Input
              placeholder="Type a tag and press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInput}
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    #{tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => removeTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Post Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Visibility</Label>
              <Select value={visibility} onValueChange={(value) => setVisibility(value as PostVisibility)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Public
                    </div>
                  </SelectItem>
                  <SelectItem value="connections">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Connections Only
                    </div>
                  </SelectItem>
                  <SelectItem value="private">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Private
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Add location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Jewelry Specific Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Jewelry Category</Label>
              <Select value={jewelryCategory} onValueChange={setJewelryCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {JEWELRY_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      <div className="flex items-center gap-2">
                        <Gem className="h-4 w-4" />
                        {category}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Price Range</Label>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select price range" />
                </SelectTrigger>
                <SelectContent>
                  {PRICE_RANGES.map((range) => (
                    <SelectItem key={range} value={range}>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        {range}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Industry Context */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Industry Context</Label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="e.g., Custom design, Vintage restoration, Modern trends"
                value={industryContext}
                onChange={(e) => setIndustryContext(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Scheduling */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Schedule Post</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Leave empty to post immediately
            </p>
          </div>

          {/* Post Options */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="allow-comments"
                checked={allowComments}
                onCheckedChange={(checked) => setAllowComments(checked as boolean)}
              />
              <Label htmlFor="allow-comments" className="text-sm">
                Allow comments
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="allow-shares"
                checked={allowShares}
                onCheckedChange={(checked) => setAllowShares(checked as boolean)}
              />
              <Label htmlFor="allow-shares" className="text-sm">
                Allow shares
              </Label>
            </div>
          </div>

          {/* Error Display */}
          {errors.submit && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {errors.submit}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Post'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 