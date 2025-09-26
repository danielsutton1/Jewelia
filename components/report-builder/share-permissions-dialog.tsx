"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Plus, Copy } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { copyToClipboard } from "@/components/ui/utils";

interface SharePermissionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SharePermissionsDialog({ open, onOpenChange }: SharePermissionsDialogProps) {
  const [email, setEmail] = useState("")
  const [permission, setPermission] = useState("view")
  const [notifyUsers, setNotifyUsers] = useState(true)
  const [shareLink, setShareLink] = useState("https://jewelia-crm.com/reports/shared/abc123")
  const [sharedUsers, setSharedUsers] = useState([
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      permission: "edit",
      avatar: "/stylized-letters-sj.png",
    },
    {
      id: "2",
      name: "Michael Chen",
      email: "michael.chen@example.com",
      permission: "view",
      avatar: "/microphone-concert-stage.png",
    },
  ])

  const handleAddUser = () => {
    if (!email) return

    // Check if user already exists
    if (sharedUsers.some((user) => user.email === email)) {
      // Update permission instead
      setSharedUsers(sharedUsers.map((user) => (user.email === email ? { ...user, permission } : user)))
    } else {
      // Add new user
      const initials = email
        .split("@")[0]
        .split(".")
        .map((part) => part[0].toUpperCase())
        .join("")

      setSharedUsers([
        ...sharedUsers,
        {
          id: `user_${Date.now()}`,
          name: email.split("@")[0].replace(".", " "),
          email,
          permission,
          avatar: `/placeholder.svg?height=32&width=32&query=${initials}`,
        },
      ])
    }

    // Reset form
    setEmail("")
  }

  const handleRemoveUser = (userId: string) => {
    setSharedUsers(sharedUsers.filter((user) => user.id !== userId))
  }

  const handleUpdatePermission = (userId: string, newPermission: string) => {
    setSharedUsers(sharedUsers.map((user) => (user.id === userId ? { ...user, permission: newPermission } : user)))
  }

  const handleCopyLink = () => {
    copyToClipboard(shareLink, (msg) => alert(msg));
    // You could add a toast notification here
  }

  const handleShare = () => {
    // Logic to share the report
    console.log("Sharing report with:", {
      users: sharedUsers,
      notifyUsers,
    })

    // Close dialog
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Share Report</DialogTitle>
          <DialogDescription>Share this report with team members or external users.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-end gap-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                placeholder="Enter email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="permission">Permission</Label>
              <Select value={permission} onValueChange={setPermission}>
                <SelectTrigger id="permission" className="w-[120px]">
                  <SelectValue placeholder="Select permission" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">Can view</SelectItem>
                  <SelectItem value="edit">Can edit</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button size="icon" onClick={handleAddUser} disabled={!email} className="mb-px">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label>People with access</Label>
            <div className="rounded-md border">
              {sharedUsers.length === 0 ? (
                <div className="flex h-20 items-center justify-center p-4 text-center text-sm text-muted-foreground">
                  No users added yet
                </div>
              ) : (
                <div className="divide-y">
                  {sharedUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                          <AvatarFallback>
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Select
                          value={user.permission}
                          onValueChange={(value) => handleUpdatePermission(user.id, value)}
                        >
                          <SelectTrigger className="h-8 w-[110px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="view">Can view</SelectItem>
                            <SelectItem value="edit">Can edit</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveUser(user.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Share link</Label>
            <div className="flex space-x-2">
              <Input value={shareLink} readOnly />
              <Button variant="outline" size="icon" onClick={handleCopyLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="notifyUsers"
              checked={notifyUsers}
              onCheckedChange={(checked) => setNotifyUsers(checked as boolean)}
            />
            <Label htmlFor="notifyUsers" className="text-sm font-normal">
              Notify users via email
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleShare}>Share Report</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
