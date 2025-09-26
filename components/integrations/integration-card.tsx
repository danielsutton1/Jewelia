import { Check } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface IntegrationCardProps {
  title: string
  description: string
  category: string
  icon: string
  status: "connected" | "not-connected"
}

export function IntegrationCard({ title, description, category, icon, status }: IntegrationCardProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 overflow-hidden rounded-md border bg-white p-1">
              <img src={icon || "/placeholder.svg"} alt={title} className="h-full w-full object-contain" />
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <Badge variant="outline" className="mt-1">
                {category}
              </Badge>
            </div>
          </div>
          {status === "connected" ? (
            <Badge className="bg-emerald-500 hover:bg-emerald-600">
              <Check className="mr-1 h-3 w-3" /> Connected
            </Badge>
          ) : (
            <Badge variant="outline">Not Connected</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="min-h-[40px]">{description}</CardDescription>
        <div className="mt-4 space-y-2">
          {status === "connected" && (
            <div className="flex items-center justify-between">
              <Label htmlFor={`${title}-sync`} className="text-sm">
                Auto-sync data
              </Label>
              <Switch id={`${title}-sync`} defaultChecked={true} />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        {status === "connected" ? (
          <div className="flex w-full gap-2">
            <Button variant="outline" className="flex-1">
              Settings
            </Button>
            <Button variant="outline" className="flex-1 text-destructive hover:bg-destructive/10">
              Disconnect
            </Button>
          </div>
        ) : (
          <Button className="w-full">Connect</Button>
        )}
      </CardFooter>
    </Card>
  )
}
