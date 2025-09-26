import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function RateLimits() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Rate Limits</CardTitle>
          <CardDescription>
            Our API implements rate limiting to ensure stability and fair usage. Different endpoints have different rate
            limits.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="standard">
            <TabsList>
              <TabsTrigger value="standard">Standard Plan</TabsTrigger>
              <TabsTrigger value="premium">Premium Plan</TabsTrigger>
              <TabsTrigger value="enterprise">Enterprise Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="standard" className="space-y-6 pt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Read Operations</h3>
                    <p className="text-sm text-muted-foreground">GET requests</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">100 / minute</p>
                    <p className="text-sm text-muted-foreground">Current: 23 / 100</p>
                  </div>
                </div>
                <Progress value={23} className="h-2" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Write Operations</h3>
                    <p className="text-sm text-muted-foreground">POST, PUT, PATCH, DELETE requests</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">50 / minute</p>
                    <p className="text-sm text-muted-foreground">Current: 12 / 50</p>
                  </div>
                </div>
                <Progress value={24} className="h-2" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Bulk Operations</h3>
                    <p className="text-sm text-muted-foreground">Batch imports and exports</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">10 / hour</p>
                    <p className="text-sm text-muted-foreground">Current: 3 / 10</p>
                  </div>
                </div>
                <Progress value={30} className="h-2" />
              </div>
            </TabsContent>

            <TabsContent value="premium" className="space-y-6 pt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Read Operations</h3>
                    <p className="text-sm text-muted-foreground">GET requests</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">500 / minute</p>
                    <p className="text-sm text-muted-foreground">Current: 45 / 500</p>
                  </div>
                </div>
                <Progress value={9} className="h-2" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Write Operations</h3>
                    <p className="text-sm text-muted-foreground">POST, PUT, PATCH, DELETE requests</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">200 / minute</p>
                    <p className="text-sm text-muted-foreground">Current: 25 / 200</p>
                  </div>
                </div>
                <Progress value={12.5} className="h-2" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Bulk Operations</h3>
                    <p className="text-sm text-muted-foreground">Batch imports and exports</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">50 / hour</p>
                    <p className="text-sm text-muted-foreground">Current: 8 / 50</p>
                  </div>
                </div>
                <Progress value={16} className="h-2" />
              </div>
            </TabsContent>

            <TabsContent value="enterprise" className="space-y-6 pt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Read Operations</h3>
                    <p className="text-sm text-muted-foreground">GET requests</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">2000 / minute</p>
                    <p className="text-sm text-muted-foreground">Current: 120 / 2000</p>
                  </div>
                </div>
                <Progress value={6} className="h-2" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Write Operations</h3>
                    <p className="text-sm text-muted-foreground">POST, PUT, PATCH, DELETE requests</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">1000 / minute</p>
                    <p className="text-sm text-muted-foreground">Current: 75 / 1000</p>
                  </div>
                </div>
                <Progress value={7.5} className="h-2" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Bulk Operations</h3>
                    <p className="text-sm text-muted-foreground">Batch imports and exports</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">200 / hour</p>
                    <p className="text-sm text-muted-foreground">Current: 15 / 200</p>
                  </div>
                </div>
                <Progress value={7.5} className="h-2" />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rate Limit Headers</CardTitle>
          <CardDescription>
            Each API response includes headers that provide information about your current rate limit status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 border-b pb-2">
              <div className="font-medium">Header</div>
              <div className="font-medium">Description</div>
              <div className="font-medium">Example</div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-b py-2">
              <div className="font-mono text-sm">X-Rate-Limit-Limit</div>
              <div className="text-sm">The maximum number of requests allowed in the current time period</div>
              <div className="font-mono text-sm">100</div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-b py-2">
              <div className="font-mono text-sm">X-Rate-Limit-Remaining</div>
              <div className="text-sm">The number of requests remaining in the current time period</div>
              <div className="font-mono text-sm">99</div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-b py-2">
              <div className="font-mono text-sm">X-Rate-Limit-Reset</div>
              <div className="text-sm">The time at which the current rate limit window resets in UTC epoch seconds</div>
              <div className="font-mono text-sm">1620000000</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
