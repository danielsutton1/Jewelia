"use client"

import { useState } from "react"
import type { PartnerProfile } from "@/types/partner-profile"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, CreditCard, Clock, Download, CheckCircle, AlertCircle, Clock3 } from "lucide-react"

interface TermsHistoryProps {
  partner: PartnerProfile
}

export function TermsHistory({ partner }: TermsHistoryProps) {
  const [activeTab, setActiveTab] = useState("pricing")

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        )
      case "in-progress":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <Clock3 className="w-3 h-3 mr-1" />
            In Progress
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Terms & History
            </CardTitle>
            <CardDescription>Pricing agreements, payment terms, and order history</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pricing" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="pricing" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Pricing Agreements</h3>
              {partner.pricingAgreements.map((agreement) => (
                <div key={agreement.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{agreement.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(agreement.startDate)} - {formatDate(agreement.endDate)}
                      </p>
                    </div>
                    {agreement.documentUrl && (
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Document
                      </Button>
                    )}
                  </div>
                  <p className="mt-3 text-sm">{agreement.terms}</p>
                </div>
              ))}
              {partner.pricingAgreements.length === 0 && (
                <p className="text-gray-500 italic">No pricing agreements on file.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="payment">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Payment Methods</h3>
                  <p className="mt-1">{partner.paymentTerms.method}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Currency</h3>
                  <p className="mt-1">{partner.paymentTerms.currency}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Payment Terms</h3>
                  <p className="mt-1">{partner.paymentTerms.terms}</p>
                </div>
                {partner.paymentTerms.creditLimit && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Credit Limit</h3>
                    <p className="mt-1">{formatCurrency(partner.paymentTerms.creditLimit)}</p>
                  </div>
                )}
                {partner.paymentTerms.discounts && (
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-gray-700">Discounts</h3>
                    <p className="mt-1">{partner.paymentTerms.discounts}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center">
                  <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="font-medium">Payment Status</span>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-200">Good Standing</Badge>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Current Tasks</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Order #
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Date
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Items
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Amount
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {partner.currentTasks.map((task) => (
                        <tr key={task.id}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                            {task.orderNumber}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatDate(task.date)}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{task.items}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(task.amount)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">{getStatusBadge(task.status)}</td>
                        </tr>
                      ))}
                      {partner.currentTasks.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-4 text-center text-sm text-gray-500">
                            No current tasks
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Order History</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Order #
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Date
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Items
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Amount
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {partner.orderHistory.map((order) => (
                        <tr key={order.id}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                            {order.orderNumber}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(order.date)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{order.items}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(order.amount)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">{getStatusBadge(order.status)}</td>
                        </tr>
                      ))}
                      {partner.orderHistory.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-4 text-center text-sm text-gray-500">
                            No order history
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="documents">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Documents</h3>
              {partner.documents && partner.documents.length > 0 ? (
                <ul className="list-disc pl-5">
                  {partner.documents.map((doc, index) => (
                    <li key={index} className="mb-2">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        {doc.title}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No documents available.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
