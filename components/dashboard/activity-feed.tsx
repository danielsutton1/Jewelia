import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const activities = [
  {
    id: 1,
    user: {
      name: "Olivia Martin",
      avatar: "/diverse-group-avatars.png",
      initials: "OM",
    },
    action: "placed an order",
    target: "Silver Necklace",
    time: "2 minutes ago",
    type: "order",
  },
  {
    id: 2,
    user: {
      name: "Jackson Lee",
      avatar: "/diverse-group-avatars.png",
      initials: "JL",
    },
    action: "left a review",
    target: "Gold Earrings",
    time: "15 minutes ago",
    type: "review",
  },
  {
    id: 3,
    user: {
      name: "Isabella Nguyen",
      avatar: "/diverse-group-avatars.png",
      initials: "IN",
    },
    action: "created an account",
    target: "",
    time: "1 hour ago",
    type: "account",
  },
  {
    id: 4,
    user: {
      name: "William Kim",
      avatar: "/diverse-group-avatars.png",
      initials: "WK",
    },
    action: "updated their profile",
    target: "",
    time: "2 hours ago",
    type: "profile",
  },
  {
    id: 5,
    user: {
      name: "Sofia Davis",
      avatar: "/diverse-group-avatars.png",
      initials: "SD",
    },
    action: "contacted support",
    target: "Order #12345",
    time: "3 hours ago",
    type: "support",
  },
]

export function ActivityFeed() {
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-4 rounded-lg border p-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={activity.user.avatar || "/placeholder.svg"} alt={activity.user.name} />
            <AvatarFallback>{activity.user.initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">{activity.user.name}</p>
              <Badge variant="outline" className="text-xs">
                {activity.type}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {activity.action} {activity.target && <span className="font-medium">{activity.target}</span>}
            </p>
            <p className="text-xs text-muted-foreground">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
