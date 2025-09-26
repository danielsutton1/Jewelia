"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, MessageSquare, Check, X, HelpCircle, DollarSign, Clock } from "lucide-react"
import type { ProviderMatch } from "@/types/service-request"

interface ProviderMatchingProps {
  providers: ProviderMatch[]
  onAcceptQuote: (providerId: string, quoteId: string) => void
  onRejectQuote: (providerId: string, quoteId: string) => void
  onRequestMoreInfo: (providerId: string) => void
}

export function ProviderMatching({
  providers,
  onAcceptQuote,
  onRejectQuote,
  onRequestMoreInfo,
}: ProviderMatchingProps) {
  const [activeTab, setActiveTab] = useState("all")

  const filteredProviders = providers.filter((provider) => {
    if (activeTab === "all") return true
    if (activeTab === "quoted") return provider.response === "quoted"
    if (activeTab === "interested") return provider.response === "interested"
    if (activeTab === "need-info") return provider.response === "need-more-info"
    if (activeTab === "not-interested") return provider.response === "not-interested"
    return true
  })

  const sortedProviders = [...filteredProviders].sort((a, b) => {
    // Sort by match score (highest first)
    return b.matchScore - a.matchScore
  })

  const getResponseBadge = (response?: string) => {
    switch (response) {
      case "quoted":
        return <Badge className="bg-green-100 text-green-800">Quote Provided</Badge>
      case "interested":
        return <Badge className="bg-blue-100 text-blue-800">Interested</Badge>
      case "need-more-info":
        return <Badge className="bg-yellow-100 text-yellow-800">Needs More Info</Badge>
      case "not-interested":
        return <Badge className="bg-red-100 text-red-800">Not Interested</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Providers</TabsTrigger>
          <TabsTrigger value="quoted">Quoted</TabsTrigger>
          <TabsTrigger value="interested">Interested</TabsTrigger>
          <TabsTrigger value="need-info">Need Info</TabsTrigger>
          <TabsTrigger value="not-interested">Not Interested</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {sortedProviders.length > 0 ? (
            sortedProviders.map((provider) => (
              <Card key={provider.providerId} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted">
                        <Image
                          src={provider.providerLogo || "/placeholder.svg"}
                          alt={provider.providerName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{provider.providerName}</CardTitle>
                        <div className="flex items-center mt-1">
                          <div className="flex items-center mr-3">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="text-sm">{provider.averageRating.toFixed(1)}</span>
                            <span className="text-xs text-muted-foreground ml-1">({provider.reviewCount} reviews)</span>
                          </div>
                          <Badge className="bg-blue-50 text-blue-700">{provider.matchScore}% Match</Badge>
                        </div>
                      </div>
                    </div>
                    <div>{getResponseBadge(provider.response)}</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Capabilities</h4>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {provider.capabilities.map((capability) => (
                          <Badge key={capability} variant="outline" className="capitalize">
                            {capability}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center text-sm mb-2">
                        <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                        <span className="font-medium">Estimated Price:</span>
                        <span className="ml-1">
                          {provider.estimatedPrice ? `$${provider.estimatedPrice}` : "Not provided"}
                        </span>
                      </div>

                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 text-blue-600 mr-1" />
                        <span className="font-medium">Estimated Turnaround:</span>
                        <span className="ml-1">{provider.estimatedTurnaround || "Not provided"}</span>
                      </div>

                      <div className="mt-3 text-sm">
                        <span className="font-medium">Previous Tasks:</span>
                        <span className="ml-1">{provider.previousTaskCount}</span>
                      </div>
                    </div>

                    {provider.quote && (
                      <div className="bg-green-50 p-3 rounded-md">
                        <h4 className="text-sm font-medium mb-2 flex items-center">
                          <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                          Quote Details
                        </h4>
                        <div className="text-sm mb-2">
                          <span className="font-medium">Amount:</span>
                          <span className="ml-1">
                            ${provider.quote.amount} {provider.quote.currency}
                          </span>
                        </div>
                        <div className="text-sm mb-2">
                          <span className="font-medium">Completion Date:</span>
                          <span className="ml-1">
                            {new Date(provider.quote.estimatedCompletionTime).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-sm mb-3">
                          <span className="font-medium">Notes:</span>
                          <p className="mt-1 text-xs">{provider.quote.notes}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => onAcceptQuote(provider.providerId, provider.quote!.id)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={() => onRejectQuote(provider.providerId, provider.quote!.id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Decline
                          </Button>
                        </div>
                      </div>
                    )}

                    {provider.response === "need-more-info" && (
                      <div className="bg-yellow-50 p-3 rounded-md">
                        <h4 className="text-sm font-medium mb-2 flex items-center">
                          <HelpCircle className="h-4 w-4 mr-1 text-yellow-600" />
                          Additional Information Needed
                        </h4>
                        <p className="text-sm mb-3">
                          This provider needs more information before they can provide a quote.
                        </p>
                        <Button size="sm" onClick={() => onRequestMoreInfo(provider.providerId)}>
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Respond
                        </Button>
                      </div>
                    )}

                    {!provider.quote &&
                      provider.response !== "need-more-info" &&
                      provider.response !== "not-interested" && (
                        <div className="flex items-center justify-center h-full">
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Contact Provider
                          </Button>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No providers found matching the selected filter</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
