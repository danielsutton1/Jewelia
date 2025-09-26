import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, Filter, FileDown } from "lucide-react"
import { mockServiceRequests } from "@/data/mock-service-requests"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getServiceTypeLabel, getStatusInfo, getPriorityInfo } from "@/data/mock-service-requests"
import { format, parseISO } from "date-fns"

export const metadata: Metadata = {
  title: "Service Requests | Jewelia CRM",
  description: "Manage your external service requests",
}

export default function ServiceRequestsPage() {
  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight services-heading">Service Requests</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2 services-subtext">Request and manage external services from your partners</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="min-h-[44px] min-w-[44px] text-xs sm:text-sm">
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Link href="/dashboard/services/create">
            <Button size="sm" className="min-h-[44px] min-w-[44px] text-xs sm:text-sm">
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 items-center gap-2 w-full sm:w-auto">
          <Input placeholder="Search service requests..." className="max-w-sm w-full min-h-[44px] text-sm" />
          <Button variant="outline" size="icon" className="min-h-[44px] min-w-[44px]">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-[180px] min-h-[44px] text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="matching">Finding Providers</SelectItem>
              <SelectItem value="quoted">Quotes Received</SelectItem>
              <SelectItem value="assigned">Provider Assigned</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="quality-check">Quality Check</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="recent">
            <SelectTrigger className="w-full sm:w-[180px] min-h-[44px] text-sm">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="due-soon">Due Soon</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">Title</TableHead>
                  <TableHead className="text-xs sm:text-sm">Service Type</TableHead>
                  <TableHead className="text-xs sm:text-sm">Due Date</TableHead>
                  <TableHead className="text-xs sm:text-sm">Provider</TableHead>
                  <TableHead className="text-xs sm:text-sm">Budget</TableHead>
                  <TableHead className="text-xs sm:text-sm">Priority</TableHead>
                  <TableHead className="text-xs sm:text-sm">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockServiceRequests.map((request) => {
                  const statusInfo = getStatusInfo(request.status)
                  const priorityInfo = getPriorityInfo(request.priority)

                  return (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium text-xs sm:text-sm">
                        <Link href={`/dashboard/services/${request.id}`} className="hover:underline">
                          {request.title}
                        </Link>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">{getServiceTypeLabel(request.serviceType)}</TableCell>
                      <TableCell className="text-xs sm:text-sm">{format(parseISO(request.dueDate), "MMM d, yyyy")}</TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        {request.assignedProviderName || <span className="text-muted-foreground">Not assigned</span>}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        {request.budgetRange.currency} {request.budgetRange.min}-{request.budgetRange.max}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${priorityInfo.color} text-xs`}>{priorityInfo.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusInfo.color} text-xs`}>{statusInfo.label}</Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
