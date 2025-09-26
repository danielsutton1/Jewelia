"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function CustomerJourney() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Customer Journey Map</CardTitle>
          <CardDescription>Visualization of customer interactions across touchpoints</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select segment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Segments</SelectItem>
              <SelectItem value="new">New Customers</SelectItem>
              <SelectItem value="returning">Returning Customers</SelectItem>
              <SelectItem value="vip">VIP Customers</SelectItem>
              <SelectItem value="at-risk">At-Risk Customers</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="map">
          <TabsList className="mb-4 grid w-full grid-cols-3">
            <TabsTrigger value="map">Journey Map</TabsTrigger>
            <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
            <TabsTrigger value="touchpoints">Touchpoint Analysis</TabsTrigger>
          </TabsList>
          <TabsContent value="map">
            <div className="relative h-[400px] overflow-x-auto">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full">
                  {/* Journey stages */}
                  <div className="relative">
                    <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 transform bg-gray-200"></div>
                    <div className="relative flex justify-between">
                      {/* Awareness */}
                      <div className="flex flex-col items-center">
                        <div className="z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-eye"
                          >
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </div>
                        <div className="mt-2 text-center">
                          <div className="font-medium">Awareness</div>
                          <div className="text-sm text-muted-foreground">First discovery</div>
                        </div>
                        <div className="mt-4 w-32 text-center text-sm">
                          <div className="font-medium">85%</div>
                          <div className="text-xs text-muted-foreground">Conversion to next stage</div>
                        </div>
                      </div>

                      {/* Consideration */}
                      <div className="flex flex-col items-center">
                        <div className="z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-search"
                          >
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.3-4.3" />
                          </svg>
                        </div>
                        <div className="mt-2 text-center">
                          <div className="font-medium">Consideration</div>
                          <div className="text-sm text-muted-foreground">Research phase</div>
                        </div>
                        <div className="mt-4 w-32 text-center text-sm">
                          <div className="font-medium">62%</div>
                          <div className="text-xs text-muted-foreground">Conversion to next stage</div>
                        </div>
                      </div>

                      {/* Purchase */}
                      <div className="flex flex-col items-center">
                        <div className="z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-shopping-cart"
                          >
                            <circle cx="8" cy="21" r="1" />
                            <circle cx="19" cy="21" r="1" />
                            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                          </svg>
                        </div>
                        <div className="mt-2 text-center">
                          <div className="font-medium">Purchase</div>
                          <div className="text-sm text-muted-foreground">First transaction</div>
                        </div>
                        <div className="mt-4 w-32 text-center text-sm">
                          <div className="font-medium">78%</div>
                          <div className="text-xs text-muted-foreground">Conversion to next stage</div>
                        </div>
                      </div>

                      {/* Retention */}
                      <div className="flex flex-col items-center">
                        <div className="z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-repeat"
                          >
                            <path d="m17 2 4 4-4 4" />
                            <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
                            <path d="m7 22-4-4 4-4" />
                            <path d="M21 13v1a4 4 0 0 1-4 4H3" />
                          </svg>
                        </div>
                        <div className="mt-2 text-center">
                          <div className="font-medium">Retention</div>
                          <div className="text-sm text-muted-foreground">Repeat purchases</div>
                        </div>
                        <div className="mt-4 w-32 text-center text-sm">
                          <div className="font-medium">45%</div>
                          <div className="text-xs text-muted-foreground">Conversion to next stage</div>
                        </div>
                      </div>

                      {/* Advocacy */}
                      <div className="flex flex-col items-center">
                        <div className="z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-megaphone"
                          >
                            <path d="m3 11 18-5v12L3 13" />
                            <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
                          </svg>
                        </div>
                        <div className="mt-2 text-center">
                          <div className="font-medium">Advocacy</div>
                          <div className="text-sm text-muted-foreground">Referrals & reviews</div>
                        </div>
                        <div className="mt-4 w-32 text-center text-sm">
                          <div className="font-medium">22%</div>
                          <div className="text-xs text-muted-foreground">Active advocates</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Touchpoints and emotions */}
                  <div className="mt-20 grid grid-cols-5 gap-4">
                    <div className="space-y-2">
                      <div className="text-center text-sm font-medium">Touchpoints</div>
                      <div className="rounded-md bg-muted p-2 text-xs">Social media ads</div>
                      <div className="rounded-md bg-muted p-2 text-xs">Organic search</div>
                      <div className="rounded-md bg-muted p-2 text-xs">Referrals</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-center text-sm font-medium">Touchpoints</div>
                      <div className="rounded-md bg-muted p-2 text-xs">Website browsing</div>
                      <div className="rounded-md bg-muted p-2 text-xs">Product comparison</div>
                      <div className="rounded-md bg-muted p-2 text-xs">Email marketing</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-center text-sm font-medium">Touchpoints</div>
                      <div className="rounded-md bg-muted p-2 text-xs">Checkout process</div>
                      <div className="rounded-md bg-muted p-2 text-xs">Payment options</div>
                      <div className="rounded-md bg-muted p-2 text-xs">Order confirmation</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-center text-sm font-medium">Touchpoints</div>
                      <div className="rounded-md bg-muted p-2 text-xs">Order delivery</div>
                      <div className="rounded-md bg-muted p-2 text-xs">Follow-up emails</div>
                      <div className="rounded-md bg-muted p-2 text-xs">Support interactions</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-center text-sm font-medium">Touchpoints</div>
                      <div className="rounded-md bg-muted p-2 text-xs">Loyalty program</div>
                      <div className="rounded-md bg-muted p-2 text-xs">Social sharing</div>
                      <div className="rounded-md bg-muted p-2 text-xs">Reviews</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="funnel">
            <div>Conversion Funnel Content</div>
          </TabsContent>
          <TabsContent value="touchpoints">
            <div>Touchpoint Analysis Content</div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
