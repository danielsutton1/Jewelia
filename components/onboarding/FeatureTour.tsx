"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Play, 
  Pause, 
  SkipForward,
  HelpCircle,
  Users,
  ShoppingCart,
  Package,
  Settings,
  BarChart3,
  MessageSquare,
  Network,
  CheckCircle,
  Star
} from 'lucide-react'

interface TourStep {
  id: string
  title: string
  description: string
  target: string
  position: 'top' | 'bottom' | 'left' | 'right'
  action?: string
  completed?: boolean
}

interface FeatureTourProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
  tourType?: 'beginner' | 'intermediate' | 'expert'
}

const tourSteps: Record<string, TourStep[]> = {
  beginner: [
    {
      id: 'dashboard-overview',
      title: 'Welcome to Jewelia CRM',
      description: 'This is your main dashboard where you can see key metrics and quick actions for your jewelry business.',
      target: '.dashboard-metrics',
      position: 'bottom'
    },
    {
      id: 'navigation',
      title: 'Navigation Menu',
      description: 'Use this menu to navigate between different sections of your CRM system.',
      target: '.main-navigation',
      position: 'right'
    },
    {
      id: 'quick-actions',
      title: 'Quick Actions',
      description: 'Access frequently used features like creating new orders, adding customers, and checking inventory.',
      target: '.quick-actions',
      position: 'bottom'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Stay updated with important alerts, messages, and system notifications.',
      target: '.notifications-bell',
      position: 'left'
    }
  ],
  intermediate: [
    {
      id: 'customer-management',
      title: 'Customer Management',
      description: 'Manage customer relationships, track interactions, and analyze customer data.',
      target: '.customers-section',
      position: 'bottom'
    },
    {
      id: 'order-processing',
      title: 'Order Processing',
      description: 'Create and track orders, manage payments, and monitor order status.',
      target: '.orders-section',
      position: 'bottom'
    },
    {
      id: 'inventory-tracking',
      title: 'Inventory Management',
      description: 'Track jewelry inventory, manage stock levels, and monitor product performance.',
      target: '.inventory-section',
      position: 'bottom'
    },
    {
      id: 'messaging',
      title: 'Communication Tools',
      description: 'Send messages to customers, manage internal communications, and track conversations.',
      target: '.messaging-section',
      position: 'bottom'
    }
  ],
  expert: [
    {
      id: 'analytics',
      title: 'Business Analytics',
      description: 'Access comprehensive business intelligence, custom reports, and performance metrics.',
      target: '.analytics-section',
      position: 'bottom'
    },
    {
      id: 'production',
      title: 'Production Management',
      description: 'Track manufacturing workflows, manage work orders, and monitor production efficiency.',
      target: '.production-section',
      position: 'bottom'
    },
    {
      id: 'networking',
      title: 'Partner Network',
      description: 'Connect with B2B partners, manage relationships, and discover new opportunities.',
      target: '.networking-section',
      position: 'bottom'
    },
    {
      id: 'settings',
      title: 'System Configuration',
      description: 'Configure system settings, manage users, and customize your CRM experience.',
      target: '.settings-section',
      position: 'bottom'
    }
  ]
}

export function FeatureTour({ isOpen, onClose, onComplete, tourType = 'beginner' }: FeatureTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  
  const steps = tourSteps[tourType]
  const progress = ((currentStep + 1) / steps.length) * 100

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      highlightCurrentStep()
    } else {
      document.body.style.overflow = 'unset'
      removeHighlights()
    }

    return () => {
      document.body.style.overflow = 'unset'
      removeHighlights()
    }
  }, [isOpen, currentStep])

  const highlightCurrentStep = () => {
    removeHighlights()
    const step = steps[currentStep]
    const target = document.querySelector(step.target)
    if (target) {
      target.classList.add('tour-highlight')
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const removeHighlights = () => {
    document.querySelectorAll('.tour-highlight').forEach(el => {
      el.classList.remove('tour-highlight')
    })
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      setCompletedSteps(prev => new Set([...prev, steps[currentStep].id]))
    } else {
      completeTour()
    }
  }

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const skipStep = () => {
    setCompletedSteps(prev => new Set([...prev, steps[currentStep].id]))
    nextStep()
  }

  const completeTour = () => {
    setCompletedSteps(prev => new Set([...prev, steps[currentStep].id]))
    onComplete()
  }

  const getStepIcon = (stepId: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'dashboard-overview': <BarChart3 className="h-5 w-5" />,
      'navigation': <Settings className="h-5 w-5" />,
      'quick-actions': <Play className="h-5 w-5" />,
      'notifications': <MessageSquare className="h-5 w-5" />,
      'customer-management': <Users className="h-5 w-5" />,
      'order-processing': <ShoppingCart className="h-5 w-5" />,
      'inventory-tracking': <Package className="h-5 w-5" />,
      'messaging': <MessageSquare className="h-5 w-5" />,
      'analytics': <BarChart3 className="h-5 w-5" />,
      'production': <Settings className="h-5 w-5" />,
      'networking': <Network className="h-5 w-5" />,
      'settings': <Settings className="h-5 w-5" />
    }
    return iconMap[stepId] || <HelpCircle className="h-5 w-5" />
  }

  if (!isOpen) return null

  const currentStepData = steps[currentStep]

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="relative max-w-2xl w-full">
        {/* Tour Overlay */}
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Tour Card */}
        <Card className="relative bg-white shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  {getStepIcon(currentStepData.id)}
                </div>
                <div>
                  <CardTitle className="text-lg">Feature Tour</CardTitle>
                  <CardDescription>
                    {tourType.charAt(0).toUpperCase() + tourType.slice(1)} Level
                  </CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Progress */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Step {currentStep + 1} of {steps.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Current Step */}
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">
                {currentStepData.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {currentStepData.description}
              </p>
              
              {currentStepData.action && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <p className="text-sm text-emerald-800 font-medium">
                    💡 Tip: {currentStepData.action}
                  </p>
                </div>
              )}
            </div>

            {/* Step Indicators */}
            <div className="flex justify-center gap-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentStep
                      ? 'bg-emerald-500'
                      : completedSteps.has(step.id)
                      ? 'bg-emerald-300'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={previousStep}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={skipStep}
                >
                  <SkipForward className="h-4 w-4 mr-1" />
                  Skip
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {currentStep === steps.length - 1 ? (
                  <Button onClick={completeTour} className="bg-emerald-600 hover:bg-emerald-700">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Complete Tour
                  </Button>
                ) : (
                  <Button onClick={nextStep} className="bg-emerald-600 hover:bg-emerald-700">
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>

            {/* Tour Tips */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Star className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-1">Tour Tips:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Use the navigation to explore different features</li>
                    <li>• Click on highlighted elements to learn more</li>
                    <li>• You can restart this tour anytime from the help menu</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx>{`
        .tour-highlight {
          position: relative;
          z-index: 10;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.3);
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        
        .tour-highlight::before {
          content: '';
          position: absolute;
          inset: -8px;
          border: 2px solid #10b981;
          border-radius: 12px;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}

// Tour Trigger Component
export function TourTrigger({ 
  tourType = 'beginner',
  onStartTour 
}: { 
  tourType?: 'beginner' | 'intermediate' | 'expert'
  onStartTour: (type: string) => void 
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onStartTour(tourType)}
      className="gap-2"
    >
      <HelpCircle className="h-4 w-4" />
      Start {tourType.charAt(0).toUpperCase() + tourType.slice(1)} Tour
    </Button>
  )
}

// Tour Completion Component
export function TourCompletion({ 
  onRestart,
  onClose 
}: { 
  onRestart: () => void
  onClose: () => void 
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-white shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <CardTitle className="text-xl">Tour Completed!</CardTitle>
          <CardDescription>
            You've successfully completed the feature tour. You're now ready to explore Jewelia CRM!
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <h4 className="font-medium text-emerald-800 mb-2">What's Next?</h4>
            <ul className="text-sm text-emerald-700 space-y-1">
              <li>• Start creating your first customer</li>
              <li>• Add inventory items to your catalog</li>
              <li>• Process your first order</li>
              <li>• Explore the analytics dashboard</li>
            </ul>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={onRestart} className="flex-1">
              Restart Tour
            </Button>
            <Button onClick={onClose} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
              Get Started
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 