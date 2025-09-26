"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Filter } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Mock data for issues
// TODO: Implement fetching issues from database
interface Issue {
  id: string;
  title: string;
  description: string;
  severity: "High" | "Medium" | "Low";
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  reportedBy: string;
  dateReported: string;
}

const mockIssues: Issue[] = [
  {
    id: "QC-001",
    title: "UI Alignment Issue",
    description: "The alignment of elements on the user profile page is inconsistent.",
    severity: "Medium",
    status: "Open",
    reportedBy: "john.doe",
    dateReported: "2024-01-26",
  },
  {
    id: "QC-002",
    title: "Button Click Not Responsive",
    description: "The 'Submit' button on the feedback form is not responding intermittently.",
    severity: "High",
    status: "In Progress",
    reportedBy: "jane.smith",
    dateReported: "2024-01-25",
  },
  {
    id: "QC-003",
    title: "Typos in Documentation",
    description: "There are several typos and grammatical errors in the API documentation.",
    severity: "Low",
    status: "Resolved",
    reportedBy: "peter.jones",
    dateReported: "2024-01-24",
  },
]

const IssueReportingPage = () => {
  const [open, setOpen] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)

  const handleIssueClick = (issue: Issue) => {
    setSelectedIssue(issue)
    setOpen(true)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quality Control Dashboard</CardTitle>
        <CardDescription>Report and track issues to improve product quality.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Input type="text" placeholder="Search issues..." className="mr-2" />
            <Search className="h-4 w-4 text-gray-500" />
          </div>
          <div className="flex items-center">
            <Button variant="outline" size="sm" className="mr-2">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="default" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Report Issue
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Report an Issue</DialogTitle>
                  <DialogDescription>Submit a new issue to the quality control team.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">
                      Title
                    </Label>
                    <Input id="title" placeholder="Issue title" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Textarea id="description" placeholder="Detailed description of the issue" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="severity" className="text-right">
                      Severity
                    </Label>
                    <Select>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Submit</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reported By</TableHead>
              <TableHead>Date Reported</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockIssues.map((issue) => (
              <TableRow
                key={issue.id}
                onClick={() => handleIssueClick(issue)}
                className="cursor-pointer hover:bg-gray-100"
              >
                <TableCell>{issue.id}</TableCell>
                <TableCell>{issue.title}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      issue.severity === "High"
                        ? "destructive"
                        : issue.severity === "Medium"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {issue.severity}
                  </Badge>
                </TableCell>
                <TableCell>{issue.status}</TableCell>
                <TableCell>{issue.reportedBy}</TableCell>
                <TableCell>{issue.dateReported}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      {selectedIssue && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{selectedIssue.title}</DialogTitle>
              <DialogDescription>Issue Details</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="id" className="text-right">
                  ID
                </Label>
                <Input id="id" value={selectedIssue.id} disabled className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea id="description" value={selectedIssue.description} disabled className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="severity" className="text-right">
                  Severity
                </Label>
                <Input id="severity" value={selectedIssue.severity} disabled className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select defaultValue={selectedIssue.status} disabled>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={selectedIssue.status} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reportedBy" className="text-right">
                  Reported By
                </Label>
                <Input id="reportedBy" value={selectedIssue.reportedBy} disabled className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dateReported" className="text-right">
                  Date Reported
                </Label>
                <Input id="dateReported" value={selectedIssue.dateReported} disabled className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={() => setOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  )
}

export { IssueReportingPage as IssueReporting }
