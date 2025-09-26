"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingBag, DollarSign, AlertCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function RecentActivity() {
  // This would be fetched from your API in a real application
  const activities = [
    {
      id: 1,
      type: "sale",
      item: "Diamond Tennis Bracelet",
      date: "May 2, 2024",
      amount: 3500,
      icon: DollarSign,
    },
    {
      id: 2,
      type: "return",
      item: "Emerald Earrings",
      date: "Apr 28, 2024",
      reason: "End of consignment period",
      icon: ShoppingBag,
    },
    {
      id: 3,
      type: "settlement",
      date: "Apr 15, 2024",
      amount: 2850,
      items: 3,
      icon: DollarSign,
    },
    {
      id: 4,
      type: "price_change",
      item: "Sapphire Pendant",
      date: "Apr 10, 2024",
      oldPrice: 2200,
      newPrice: 1950,
      icon: AlertCircle,
    },
    {
      id: 5,
      type: "new_item",
      item: "Pearl Necklace",
      date: "Apr 5, 2024",
      price: 1800,
      icon: ShoppingBag,
    },
  ]

  const getActivityContent = (activity: any) => {
    switch (activity.type) {
      case "sale":
        return (
          <>
            <activity.icon className="h-5 w-5 text-green-500" />
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">Item Sold</p>
              <p className="text-sm text-muted-foreground">
                {activity.item} sold for ${activity.amount}
              </p>
            </div>
            <div className="ml-auto text-xs text-muted-foreground">{activity.date}</div>
          </>
        )
      case "return":
        return (
          <>
            <activity.icon className="h-5 w-5 text-blue-500" />
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">Item Returned</p>
              <p className="text-sm text-muted-foreground">
                {activity.item} - {activity.reason}
              </p>
            </div>
            <div className="ml-auto text-xs text-muted-foreground">{activity.date}</div>
          </>
        )
      case "settlement":
        return (
          <>
            <activity.icon className="h-5 w-5 text-green-500" />
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">Settlement Processed</p>
              <p className="text-sm text-muted-foreground">
                ${activity.amount} for {activity.items} items
              </p>
            </div>
            <div className="ml-auto text-xs text-muted-foreground">{activity.date}</div>
          </>
        )
      case "price_change":
        return (
          <>
            <activity.icon className="h-5 w-5 text-amber-500" />
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">Price Adjusted</p>
              <p className="text-sm text-muted-foreground">
                {activity.item}: ${activity.oldPrice} → ${activity.newPrice}
              </p>
            </div>
            <div className="ml-auto text-xs text-muted-foreground">{activity.date}</div>
          </>
        )
      case "new_item":
        return (
          <>
            <activity.icon className="h-5 w-5 text-blue-500" />
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">New Item Added</p>
              <p className="text-sm text-muted-foreground">
                {activity.item} listed at ${activity.price}
              </p>
            </div>
            <div className="ml-auto text-xs text-muted-foreground">{activity.date}</div>
          </>
        )
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest consignment activity</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center">
            {getActivityContent(activity)}
          </div>
        ))}
        <div className="flex justify-center">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/consignment-portal/activity">
              View All Activity
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
