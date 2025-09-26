"use client"

import { Bell, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export function MobileHeader() {
  const [notificationCount, setNotificationCount] = useState(3)

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            <nav className="flex flex-col gap-4 py-6">
              <h2 className="px-2 text-lg font-semibold tracking-tight">Jewelia Quality Control</h2>
              <div className="flex flex-col gap-1">
                <Button variant="ghost" className="justify-start">
                  Dashboard
                </Button>
                <Button variant="ghost" className="justify-start">
                  Inspections
                </Button>
                <Button variant="ghost" className="justify-start">
                  Issues
                </Button>
                <Button variant="ghost" className="justify-start">
                  Reports
                </Button>
                <Button variant="ghost" className="justify-start">
                  Settings
                </Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
        <h1 className="text-lg font-semibold">QC Inspector</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <Badge className="absolute -right-1 -top-1 h-5 w-5 justify-center rounded-full p-0" variant="destructive">
              {notificationCount}
            </Badge>
          )}
        </Button>
        <Avatar className="h-8 w-8">
          <AvatarImage src="/inspector.png" alt="Inspector" />
          <AvatarFallback>IN</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
