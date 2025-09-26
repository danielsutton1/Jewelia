import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon, CreditCard, DollarSign, Package, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const stats = [
  {
    title: "Total Revenue",
    value: "$45,231.89",
    description: "12% from last month",
    icon: DollarSign,
    trend: "up",
    metric: "+$5,423.22",
  },
  {
    title: "Customers",
    value: "+2,350",
    description: "4% from last month",
    icon: Users,
    trend: "up",
    metric: "+94 new",
  },
  {
    title: "Sales",
    value: "+12,234",
    description: "8% from last month",
    icon: CreditCard,
    trend: "up",
    metric: "978 orders",
  },
  {
    title: "Active Orders",
    value: "+573",
    description: "2% from last month",
    icon: Package,
    trend: "down",
    metric: "12 pending",
  },
]

export function DashboardStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/10 p-1.5 text-primary">
              <stat.icon className="h-full w-full" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {stat.trend === "up" ? (
                  <span className="text-emerald-500 flex items-center">
                    <ArrowUpIcon className="mr-1 h-3 w-3" />
                    {stat.description}
                  </span>
                ) : stat.trend === "down" ? (
                  <span className="text-rose-500 flex items-center">
                    <ArrowDownIcon className="mr-1 h-3 w-3" />
                    {stat.description}
                  </span>
                ) : (
                  <span className="text-muted-foreground flex items-center">
                    <ArrowRightIcon className="mr-1 h-3 w-3" />
                    {stat.description}
                  </span>
                )}
              </p>
              <p className="text-xs font-medium">{stat.metric}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
