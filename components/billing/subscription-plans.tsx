'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Loader2, Crown, Star, Zap } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { loadStripe } from '@stripe/stripe-js'

interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval: 'month' | 'year'
  features: string[]
  limits: {
    products: number
    users: number
    storage: number
    apiCalls: number
  }
  stripePriceId: string
}

interface CurrentSubscription {
  id: string
  status: string
  plan_id: string
  current_period_end: string
  cancel_at_period_end: boolean
}

export function SubscriptionPlans() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    fetchSubscriptionData()
  }, [])

  const fetchSubscriptionData = async () => {
    try {
      const response = await fetch('/api/subscriptions')
      const data = await response.json()
      
      if (data.success) {
        setPlans(data.data.availablePlans)
        setCurrentSubscription(data.data.currentSubscription)
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error)
      toast.error('Failed to load subscription plans')
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (priceId: string) => {
    setProcessing(priceId)
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      })

      const data = await response.json()

      if (data.success && data.data.clientSecret) {
        // Initialize Stripe
        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
        
        if (stripe) {
          const { error } = await stripe.confirmCardPayment(data.data.clientSecret)
          
          if (error) {
            toast.error(error.message || 'Payment failed')
          } else {
            toast.success('Subscription created successfully!')
            fetchSubscriptionData() // Refresh data
          }
        }
      } else {
        toast.error('Failed to create subscription')
      }
    } catch (error) {
      console.error('Error creating subscription:', error)
      toast.error('Failed to create subscription')
    } finally {
      setProcessing(null)
    }
  }

  const handleCancelSubscription = async () => {
    if (!currentSubscription) return

    setProcessing('cancel')
    try {
      const response = await fetch(`/api/subscriptions/${currentSubscription.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cancelAtPeriodEnd: true }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Subscription cancelled successfully')
        fetchSubscriptionData() // Refresh data
      } else {
        toast.error('Failed to cancel subscription')
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      toast.error('Failed to cancel subscription')
    } finally {
      setProcessing(null)
    }
  }

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'basic':
        return <Star className="h-5 w-5" />
      case 'professional':
        return <Crown className="h-5 w-5" />
      case 'enterprise':
        return <Zap className="h-5 w-5" />
      default:
        return <Star className="h-5 w-5" />
    }
  }

  const formatPrice = (price: number, currency: string, interval: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(price) + `/${interval}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl font-semibold">Subscription Plans</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">Choose the plan that best fits your business needs</p>
      </div>

      {/* Current Subscription Status */}
      {currentSubscription && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-green-800">Active Subscription</h3>
                <p className="text-sm text-green-600">
                  Current plan: {plans.find(p => p.stripePriceId === currentSubscription.plan_id)?.name || 'Unknown'}
                </p>
                <p className="text-sm text-green-600">
                  {currentSubscription.cancel_at_period_end 
                    ? `Cancels on ${new Date(currentSubscription.current_period_end).toLocaleDateString()}`
                    : `Renews on ${new Date(currentSubscription.current_period_end).toLocaleDateString()}`
                  }
                </p>
              </div>
              {currentSubscription.cancel_at_period_end && (
                <Button 
                  onClick={handleCancelSubscription}
                  disabled={processing === 'cancel'}
                  variant="outline"
                  size="sm"
                >
                  {processing === 'cancel' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Reactivate'
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3 overflow-x-auto">
        {plans.map((plan) => {
          const isCurrentPlan = currentSubscription?.plan_id === plan.stripePriceId
          const isProcessing = processing === plan.stripePriceId
          
          return (
            <Card 
              key={plan.id} 
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
                isCurrentPlan ? "border-primary shadow-lg" : "min-w-[280px] lg:min-w-0"
              }`}
            >
              {isCurrentPlan && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold rounded-bl-lg">
                  Current Plan
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-center gap-2">
                  {getPlanIcon(plan.name)}
                  <CardTitle className="text-base sm:text-lg">{plan.name}</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-3 sm:space-y-4">
                <div>
                  <span className="text-2xl sm:text-3xl font-bold">
                    {formatPrice(plan.price, plan.currency, plan.interval)}
                  </span>
                </div>
                
                <ul className="space-y-1 sm:space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                      <span className="text-xs sm:text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4">
                  {isCurrentPlan ? (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleCancelSubscription()}
                      disabled={processing === 'cancel'}
                    >
                      {processing === 'cancel' ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      {currentSubscription?.cancel_at_period_end ? 'Reactivate' : 'Cancel Plan'}
                    </Button>
                  ) : (
                    <Button 
                      className="w-full"
                      onClick={() => handleSubscribe(plan.stripePriceId)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Subscribe
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
