"use client"

import { useState } from "react"
import { Mail, MessageSquare, Bell, FileText, Code, Eye } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export function TemplateEditor() {
  const [activeTemplate, setActiveTemplate] = useState("order-confirmation")
  const [editorView, setEditorView] = useState("design")

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Notification Templates</CardTitle>
            </div>
            <Select value={activeTemplate} onValueChange={setActiveTemplate}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="order-confirmation">Order Confirmation</SelectItem>
                <SelectItem value="shipping-update">Shipping Update</SelectItem>
                <SelectItem value="payment-received">Payment Received</SelectItem>
                <SelectItem value="new-account">New Account Welcome</SelectItem>
                <SelectItem value="password-reset">Password Reset</SelectItem>
                <SelectItem value="security-alert">Security Alert</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <CardDescription>Customize notification templates for different channels</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={editorView} onValueChange={setEditorView} className="w-full">
            <TabsList className="mb-4 grid w-full grid-cols-3">
              <TabsTrigger value="design" className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>Visual Editor</span>
              </TabsTrigger>
              <TabsTrigger value="code" className="flex items-center gap-1">
                <Code className="h-4 w-4" />
                <span>Code Editor</span>
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>Preview</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="design" className="space-y-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input defaultValue="Order Confirmation" />
              </div>

              <div className="space-y-2">
                <Label>Subject Line</Label>
                <Input defaultValue="Your order #{{order_number}} has been confirmed" />
              </div>

              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  className="min-h-[200px]"
                  defaultValue={`Dear {{customer_name}},

Thank you for your order! We're pleased to confirm that your order #{{order_number}} has been received and is being processed.

Order Details:
{{order_items}}

Total: {{order_total}}
Estimated Delivery: {{delivery_date}}

You can track your order status here: {{tracking_link}}

If you have any questions about your order, please contact our customer service team.

Thank you for shopping with us!

Best regards,
The Jewelia Team`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Available Variables</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Insert variable" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer_name">{'{ customer_name }'}</SelectItem>
                      <SelectItem value="order_number">{'{ order_number }'}</SelectItem>
                      <SelectItem value="order_items">{'{ order_items }'}</SelectItem>
                      <SelectItem value="order_total">{'{ order_total }'}</SelectItem>
                      <SelectItem value="delivery_date">{'{ delivery_date }'}</SelectItem>
                      <SelectItem value="tracking_link">{'{ tracking_link }'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Template Type</Label>
                  <Select defaultValue="email">
                    <SelectTrigger>
                      <SelectValue placeholder="Select template type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="push">Push Notification</SelectItem>
                      <SelectItem value="in-app">In-App Notification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="code">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>HTML Template</Label>
                  <div className="relative">
                    <Textarea
                      className="font-mono min-h-[400px] p-4"
                      defaultValue={`<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px 0; }
    .logo { max-width: 150px; }
    .content { padding: 20px 0; }
    .footer { text-align: center; padding: 20px 0; font-size: 12px; color: #777; }
    .button { display: inline-block; padding: 10px 20px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="{{logo_url}}" alt="Jewelia" class="logo">
    </div>
    <div class="content">
      <h2>Order Confirmation</h2>
      <p>Dear {{customer_name}},</p>
      <p>Thank you for your order! We're pleased to confirm that your order #{{order_number}} has been received and is being processed.</p>
      <h3>Order Details:</h3>
      <p>{{order_items}}</p>
      <p><strong>Total:</strong> {{order_total}}</p>
      <p><strong>Estimated Delivery:</strong> {{delivery_date}}</p>
      <p>
        <a href="{{tracking_link}}" class="button">Track Your Order</a>
      </p>
      <p>If you have any questions about your order, please contact our customer service team.</p>
      <p>Thank you for shopping with us!</p>
      <p>Best regards,<br>The Jewelia Team</p>
    </div>
    <div class="footer">
      <p>© 2023 Jewelia CRM. All rights reserved.</p>
      <p>
        <a href="{{unsubscribe_link}}">Unsubscribe</a> |
        <a href="{{preferences_link}}">Manage Preferences</a>
      </p>
    </div>
  </div>
</body>
</html>`}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview">
              <div className="rounded-md border p-4">
                <div className="space-y-4">
                  <div className="text-center py-4 border-b">
                    <div className="inline-block rounded-full bg-primary/10 p-2 mb-2">
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
                        className="h-6 w-6 text-primary"
                      >
                        <path d="M12.89 1.45l8 4A2 2 0 0 1 22 7.24v9.53a2 2 0 0 1-1.11 1.79l-8 4a2 2 0 0 1-1.79 0l-8-4a2 2 0 0 1-1.1-1.8V7.24a2 2 0 0 1 1.11-1.79l8-4a2 2 0 0 1 1.78 0z" />
                        <polyline points="2.32 6.16 12 11 21.68 6.16" />
                        <line x1="12" x2="12" y1="22" y2="11" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold">Jewelia</h2>
                  </div>

                  <div className="py-4">
                    <h2 className="text-xl font-bold mb-4">Order Confirmation</h2>
                    <p className="mb-2">Dear John Doe,</p>
                    <p className="mb-4">
                      Thank you for your order! We're pleased to confirm that your order #ORD-12345 has been received
                      and is being processed.
                    </p>

                    <h3 className="font-bold mb-2">Order Details:</h3>
                    <div className="border rounded-md p-3 mb-4 space-y-2">
                      <div className="flex justify-between">
                        <span>1x Silver Necklace</span>
                        <span>$129.99</span>
                      </div>
                      <div className="flex justify-between">
                        <span>2x Gold Earrings</span>
                        <span>$199.98</span>
                      </div>
                      <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                        <span>Total</span>
                        <span>$329.97</span>
                      </div>
                    </div>

                    <p className="mb-2">
                      <strong>Estimated Delivery:</strong> June 15, 2023
                    </p>

                    <div className="my-4 text-center">
                      <Button>Track Your Order</Button>
                    </div>

                    <p className="mb-2">
                      If you have any questions about your order, please contact our customer service team.
                    </p>
                    <p className="mb-4">Thank you for shopping with us!</p>

                    <p>
                      Best regards,
                      <br />
                      The Jewelia Team
                    </p>
                  </div>

                  <div className="text-center text-sm text-muted-foreground border-t pt-4">
                    <p>© 2023 Jewelia CRM. All rights reserved.</p>
                    <p className="mt-1">
                      <a href="#" className="text-primary hover:underline">
                        Unsubscribe
                      </a>{" "}
                      |
                      <a href="#" className="text-primary hover:underline ml-2">
                        Manage Preferences
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <div className="flex justify-between">
          <Button variant="outline">Reset to Default</Button>
          <div className="flex gap-2">
            <Button variant="outline">Test Template</Button>
            <Button>Save Template</Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <CardTitle>Email Templates</CardTitle>
            </div>
            <CardDescription>HTML email notification templates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-md border px-4 py-3">
                <span>Order Confirmation</span>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between rounded-md border px-4 py-3">
                <span>Shipping Update</span>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between rounded-md border px-4 py-3">
                <span>Payment Received</span>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
          <div>
            <Button variant="outline" className="w-full">
              Manage Email Templates
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <CardTitle>SMS Templates</CardTitle>
            </div>
            <CardDescription>Text message notification templates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-md border px-4 py-3">
                <span>Order Confirmation</span>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between rounded-md border px-4 py-3">
                <span>Shipping Update</span>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between rounded-md border px-4 py-3">
                <span>Delivery Notification</span>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
          <div>
            <Button variant="outline" className="w-full">
              Manage SMS Templates
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Push Notification Templates</CardTitle>
            </div>
            <CardDescription>Mobile push notification templates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-md border px-4 py-3">
                <span>Order Status</span>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between rounded-md border px-4 py-3">
                <span>Price Alerts</span>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between rounded-md border px-4 py-3">
                <span>Security Alerts</span>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
          <div>
            <Button variant="outline" className="w-full">
              Manage Push Templates
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
