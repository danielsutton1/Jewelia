"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, Clock, DollarSign, FileText, MessageSquare, Package, Tag } from "lucide-react"
import { format, parseISO } from "date-fns"
import { mockServiceRequests } from "@/data/mock-service-requests"
import {
  getServiceTypeLabel,
  getStatusInfo,
  getMaterialProvisionLabel,
  getPriorityInfo,
} from "@/data/mock-service-requests"
import { ProviderMatching } from "@/components/services/provider-matching"
import { RequestTracking } from "@/components/services/request-tracking"
import { FeedbackForm } from "@/components/services/feedback-form"
import type { ServiceRequestFeedback } from "@/types/service-request"

export default function ServiceRequestDetailPage() {
  const params = useParams()
  const requestId = params.id as string
  const [activeTab, setActiveTab] = useState("details")

  // Find the service request in the mock data
  const serviceRequest = mockServiceRequests.find((request) => request.id === requestId)

  if (!serviceRequest) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <h1 className="text-2xl font-bold mb-2">Service Request Not Found</h1>
        <p className="text-muted-foreground mb-4">The service request you are looking for does not exist.</p>
        <Link href="/dashboard/services">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Service Requests
          </Button>
        </Link>
      </div>
    )
  }

  const statusInfo = getStatusInfo(serviceRequest.status)
  const priorityInfo = getPriorityInfo(serviceRequest.priority)

  const handleAcceptQuote = (providerId: string, quoteId: string) => {
    // In a real app, this would send the acceptance to the API
    console.log(`Accepting quote ${quoteId} from provider ${providerId}`)
    alert(`Quote accepted! In a real app, this would assign the provider to the request.`)
  }

  const handleRejectQuote = (providerId: string, quoteId: string) => {
    // In a real app, this would send the rejection to the API
    console.log(`Rejecting quote ${quoteId} from provider ${providerId}`)
    alert(`Quote rejected! In a real app, this would notify the provider.`)
  }

  const handleRequestMoreInfo = (providerId: string) => {
    // In a real app, this would open a dialog to send a message
    console.log(`Requesting more info from provider ${providerId}`)
    alert(`In a real app, this would open a dialog to send a message to the provider.`)
  }

  const handleAddUpdate = (message: string, files: File[]) => {
    // In a real app, this would send the update to the API
    console.log("Adding update:", message, files)
    alert(`Update added! In a real app, this would be saved to the database.`)
  }

  const handleSubmitFeedback = (feedback: Omit<ServiceRequestFeedback, "id" | "createdAt">) => {
    // In a real app, this would send the feedback to the API
    console.log("Submitting feedback:", feedback)
    alert(`Feedback submitted! In a real app, this would be saved to the database.`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard/services">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Button>
            </Link>
            <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
            <Badge className={priorityInfo.color}>{priorityInfo.label}</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{serviceRequest.title}</h1>
          <div className="flex items-center gap-2 mt-1 text-muted-foreground">
            <Badge variant="outline">{getServiceTypeLabel(serviceRequest.serviceType)}</Badge>
            <span>•</span>
            <span className="text-sm">Created {format(parseISO(serviceRequest.createdAt), "MMMM d, yyyy")}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline">
            <MessageSquare className="h-4 w-4 mr-2" />
            Contact Provider
          </Button>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="providers">Provider Matching</TabsTrigger>
          <TabsTrigger value="tracking">Request Tracking</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Request Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Description</h3>
                  <p className="text-sm whitespace-pre-wrap">{serviceRequest.description}</p>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium mb-2">Specifications</h3>
                  {serviceRequest.specifications.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {serviceRequest.specifications.map((spec) => (
                        <div key={spec.id} className="text-sm border rounded p-2">
                          <span className="font-medium">{spec.name}:</span> {spec.value} {spec.unit}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No specifications provided</p>
                  )}
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium mb-2">Materials</h3>
                  <div className="text-sm">
                    <p>
                      <span className="font-medium">Material Provision:</span>{" "}
                      {getMaterialProvisionLabel(serviceRequest.materialProvision)}
                    </p>
                    {serviceRequest.materialDetails && (
                      <div className="mt-2">
                        <span className="font-medium">Material Details:</span>
                        <p className="mt-1 whitespace-pre-wrap">{serviceRequest.materialDetails}</p>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium mb-2">Files</h3>
                  {serviceRequest.files.length > 0 ? (
                    <div className="space-y-2">
                      {serviceRequest.files.map((file) => (
                        <div key={file.id} className="flex items-center p-2 rounded-md border">
                          <FileText className="h-5 w-5 text-muted-foreground mr-2" />
                          <div className="flex-grow">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {file.type} • {(file.size / 1024).toFixed(0)} KB
                            </p>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={file.url} download target="_blank" rel="noopener noreferrer">
                              <span className="sr-only">Download</span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                              >
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                              </svg>
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No files attached</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Timeline & Budget</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-muted-foreground mr-2" />
                    <div>
                      <p className="text-sm font-medium">Due Date</p>
                      <p className="text-sm">{format(parseISO(serviceRequest.dueDate), "MMMM d, yyyy")}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-muted-foreground mr-2" />
                    <div>
                      <p className="text-sm font-medium">Budget Range</p>
                      <p className="text-sm">
                        {serviceRequest.budgetRange.currency} {serviceRequest.budgetRange.min.toLocaleString()} -{" "}
                        {serviceRequest.budgetRange.max.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {serviceRequest.assignedProviderId && (
                    <div className="flex items-center">
                      <Package className="h-5 w-5 text-muted-foreground mr-2" />
                      <div>
                        <p className="text-sm font-medium">Assigned Provider</p>
                        <p className="text-sm">{serviceRequest.assignedProviderName}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-muted-foreground mr-2" />
                    <div>
                      <p className="text-sm font-medium">Last Updated</p>
                      <p className="text-sm">{format(parseISO(serviceRequest.updatedAt), "MMMM d, yyyy")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {serviceRequest.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="providers">
          <ProviderMatching
            providers={serviceRequest.providerMatches}
            onAcceptQuote={handleAcceptQuote}
            onRejectQuote={handleRejectQuote}
            onRequestMoreInfo={handleRequestMoreInfo}
          />
        </TabsContent>

        <TabsContent value="tracking">
          <RequestTracking
            progressUpdates={serviceRequest.progressUpdates}
            qualityCheckpoints={serviceRequest.qualityCheckpoints}
            onAddUpdate={handleAddUpdate}
          />
        </TabsContent>

        <TabsContent value="feedback">
          {serviceRequest.status === "completed" ? (
            <FeedbackForm
              requestId={serviceRequest.id}
              providerId={serviceRequest.assignedProviderId || ""}
              providerName={serviceRequest.assignedProviderName || "the provider"}
              existingFeedback={serviceRequest.feedback}
              onSubmit={handleSubmitFeedback}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Feedback can only be provided once the service request is completed
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
