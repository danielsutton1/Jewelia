"use client"

import { useState } from "react"
import { Clock, User, FileText, CheckCircle, XCircle, RotateCcw, ChevronDown, ChevronUp, Eye } from "lucide-react"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { CadFile } from "./cad-file-manager"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface RevisionHistoryProps {
  file: CadFile
}

export function RevisionHistory({ file }: RevisionHistoryProps) {
  const [expandedVersions, setExpandedVersions] = useState<Record<number, boolean>>({})
  const [rollbackDialogOpen, setRollbackDialogOpen] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null)
  const [rollbackReason, setRollbackReason] = useState("")

  const toggleVersion = (version: number) => {
    setExpandedVersions((prev) => ({
      ...prev,
      [version]: !prev[version],
    }))
  }

  const handleRollback = (version: number) => {
    setSelectedVersion(version)
    setRollbackDialogOpen(true)
  }

  const confirmRollback = () => {
    // In a real app, this would trigger the rollback process
    alert(`Rolling back to version ${selectedVersion} with reason: ${rollbackReason}`)
    setRollbackDialogOpen(false)
    setRollbackReason("")
  }

  // Sort versions in descending order (newest first)
  const sortedVersions = [...(file.versions || [])].sort((a, b) => b.version - a.version)

  return (
    <>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Revision History</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {sortedVersions.length > 0 ? (
            sortedVersions.map((version) => (
              <div key={version.version} className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div
                  className="flex cursor-pointer items-center justify-between p-4"
                  onClick={() => toggleVersion(version.version)}
                >
                  <div className="flex items-center space-x-4">
                    <Badge variant={version.version === file.currentVersion ? "default" : "outline"}>
                      v{version.version}
                    </Badge>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      {version.date}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <User className="mr-1 h-3 w-3" />
                      {version.author}
                    </div>
                    {version.approved !== undefined && (
                      <div className="flex items-center">
                        {version.approved ? (
                          <Badge variant="success" className="flex items-center space-x-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>Approved</span>
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="flex items-center space-x-1">
                            <XCircle className="h-3 w-3" />
                            <span>Rejected</span>
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {expandedVersions[version.version] ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </div>

                {expandedVersions[version.version] && (
                  <div className="border-t p-4">
                    <div className="mb-4">
                      <h4 className="mb-1 text-sm font-medium">Changes</h4>
                      <p className="text-sm text-muted-foreground">{version.changes}</p>
                    </div>

                    {version.approved && (
                      <div className="mb-4">
                        <h4 className="mb-1 text-sm font-medium">Approval</h4>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <User className="mr-1 h-3 w-3" />
                            {version.approvedBy}
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {version.approvedDate}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      {version.version !== file.currentVersion && (
                        <Button size="sm" variant="outline" onClick={() => handleRollback(version.version)}>
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Rollback
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
              <div className="text-center">
                <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">No revision history available</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <Dialog open={rollbackDialogOpen} onOpenChange={setRollbackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rollback to Version {selectedVersion}</DialogTitle>
            <DialogDescription>
              This will revert the file to version {selectedVersion}. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rollback-reason">Reason for rollback</Label>
              <Textarea
                id="rollback-reason"
                placeholder="Enter reason for rollback..."
                value={rollbackReason}
                onChange={(e) => setRollbackReason(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRollbackDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmRollback} disabled={!rollbackReason.trim()}>
              Confirm Rollback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
