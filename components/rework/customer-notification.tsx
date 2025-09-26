"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, Clock, Check, X, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import type { CustomerNotificationTemplate } from "@/types/rework-tracking"

const formSchema = z.object({
  templateName: z.string().min(1, "Template name is required"),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(10, "Body must be at least 10 characters"),
  delayNotification: z.boolean(),
  delayDuration: z.number().optional(),
  requireApproval: z.boolean(),
  approvalRole: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

// Mock data for demonstration
const mockTemplates: CustomerNotificationTemplate[] = [
  {
    id: "t1",
    name: "Minor Rework Notification",
    subject: "Update on Your Order: Minor Adjustments Required",
    body: "Dear [Customer Name],\n\nWe hope this message finds you well. We wanted to inform you that during our quality control process, we identified a minor issue with your order that requires a small adjustment. This is to ensure that the final piece meets our high-quality standards and your expectations.\n\nThe issue: [Issue Description]\n\nEstimated additional time: [Time Impact] days\n\nWe apologize for any inconvenience this may cause. Please be assured that we are working diligently to complete the adjustments as quickly as possible while maintaining the highest quality.\n\nIf you have any questions or concerns, please don't hesitate to contact us.\n\nThank you for your understanding and patience.\n\nBest regards,\n[Your Name]\n[Company Name]",
    delayNotification: false,
    requireApproval: false,
  },
  {
    id: "t2",
    name: "Major Rework Notification",
    subject: "Important Update on Your Order: Rework Required",
    body: "Dear [Customer Name],\n\nI hope this message finds you well. I'm writing to inform you about an important update regarding your order.\n\nDuring our quality control process, we identified an issue that requires significant rework to ensure that your piece meets our quality standards and your expectations.\n\nThe issue: [Issue Description]\n\nRoot cause: [Root Cause]\n\nEstimated additional time: [Time Impact] days\n\nWe sincerely apologize for this delay and any inconvenience it may cause. Please be assured that we are prioritizing your order and will work diligently to complete the rework as quickly as possible while maintaining the highest quality.\n\nIf you would like to discuss this further or have any questions, please don't hesitate to contact me directly at [Your Phone/Email].\n\nThank you for your understanding and patience.\n\nBest regards,\n[Your Name]\n[Company Name]",
    delayNotification: true,
    delayDuration: 24,
    requireApproval: true,
    approvalRole: "Production Manager",
  },
  {
    id: "t3",
    name: "Delivery Delay Notification",
    subject: "Update on Your Order: Revised Delivery Timeline",
    body: "Dear [Customer Name],\n\nI hope this message finds you well. I'm writing to inform you about a change in the expected delivery date for your order.\n\nDuring our production process, we encountered an issue that requires additional work to ensure that your piece meets our quality standards. As a result, we need to adjust the delivery timeline.\n\nOriginal delivery date: [Original Date]\nRevised delivery date: [New Date]\n\nReason for delay: [Brief Explanation]\n\nWe sincerely apologize for this change and any inconvenience it may cause. We understand the importance of timely delivery and are making every effort to minimize the delay while ensuring exceptional quality.\n\nIf this new timeline poses any significant problems for you, or if you have any questions, please contact us immediately so we can discuss possible solutions.\n\nThank you for your understanding and patience.\n\nBest regards,\n[Your Name]\n[Company Name]",
    delayNotification: false,
    requireApproval: true,
    approvalRole: "Store Manager",
  },
]

// Mock notification history
const mockNotificationHistory = [
  {
    id: "n1",
    customer: "Emma Johnson",
    orderId: "ORD-2023-0542",
    template: "Minor Rework Notification",
    sentDate: new Date(2023, 9, 15, 14, 30),
    status: "delivered",
    openedBy: true,
    responseReceived: true,
  },
  {
    id: "n2",
    customer: "Michael Chen",
    orderId: "ORD-2023-0561",
    template: "Major Rework Notification",
    sentDate: new Date(2023, 9, 18, 10, 15),
    status: "delivered",
    openedBy: true,
    responseReceived: false,
  },
  {
    id: "n3",
    customer: "Sophia Rodriguez",
    orderId: "ORD-2023-0578",
    template: "Delivery Delay Notification",
    sentDate: new Date(2023, 9, 20, 16, 45),
    status: "pending",
    openedBy: false,
    responseReceived: false,
  },
]

export function CustomerNotification() {
  const [activeTab, setActiveTab] = useState("templates")
  const [templates, setTemplates] = useState<CustomerNotificationTemplate[]>(mockTemplates)
  const [editingTemplate, setEditingTemplate] = useState<CustomerNotificationTemplate | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      templateName: "",
      subject: "",
      body: "",
      delayNotification: false,
      delayDuration: 24,
      requireApproval: false,
      approvalRole: "",
    },
  })

  useEffect(() => {
    if (editingTemplate) {
      form.reset({
        templateName: editingTemplate.name,
        subject: editingTemplate.subject,
        body: editingTemplate.body,
        delayNotification: editingTemplate.delayNotification,
        delayDuration: editingTemplate.delayDuration || 24,
        requireApproval: editingTemplate.requireApproval,
        approvalRole: editingTemplate.approvalRole || "",
      })
    } else {
      form.reset({
        templateName: "",
        subject: "",
        body: "",
        delayNotification: false,
        delayDuration: 24,
        requireApproval: false,
        approvalRole: "",
      })
    }
  }, [editingTemplate, form])

  function onSubmit(values: FormValues) {
    if (editingTemplate) {
      // Edit existing template
      setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? { ...t, name: values.templateName, ...values } : t))
      toast.success("Template updated successfully!")
    } else {
      // Create new template
      const newTemplate: CustomerNotificationTemplate = {
        id: `t${templates.length + 1}`,
        name: values.templateName,
        subject: values.subject,
        body: values.body,
        delayNotification: values.delayNotification,
        delayDuration: values.delayDuration,
        requireApproval: values.requireApproval,
        approvalRole: values.approvalRole,
      }
      setTemplates(prev => [...prev, newTemplate])
      toast.success("Template created successfully!")
    }
    
    setEditingTemplate(null)
    setActiveTab("templates")
  }

  const handleDeleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    toast.success("Template deleted successfully!");
  }
  
  const handleDuplicateTemplate = (template: CustomerNotificationTemplate) => {
    setEditingTemplate({
        ...template,
        name: `${template.name} (Copy)`,
        id: '' // No ID for a new template
    });
    setActiveTab("create");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Customer Notifications</h2>
          <p className="text-muted-foreground">Manage templates and settings for customer rework notifications.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">Notification Templates</TabsTrigger>
          <TabsTrigger value="create">Create Template</TabsTrigger>
          <TabsTrigger value="history">Notification History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{templates.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Notifications Sent (30 days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockNotificationHistory.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(
                    (mockNotificationHistory.filter((n) => n.responseReceived).length /
                      mockNotificationHistory.length) *
                      100,
                  )}
                  %
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Available Templates</h3>
            <Button onClick={() => { setEditingTemplate(null); setActiveTab("create"); }}>
              <Plus className="mr-2 h-4 w-4" /> New Template
            </Button>
          </div>

          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{template.name}</CardTitle>
                  <div className="flex gap-2">
                    {template.requireApproval && <Badge variant="outline">Requires Approval</Badge>}
                    {template.delayNotification && <Badge variant="outline">Delayed Send</Badge>}
                  </div>
                </div>
                <CardDescription>Subject: {template.subject}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md">
                  <pre className="text-sm whitespace-pre-wrap font-sans">
                    {template.body.length > 200 ? template.body.substring(0, 200) + "..." : template.body}
                  </pre>
                </div>

                {(template.delayNotification || template.requireApproval) && (
                  <div className="mt-4 space-y-2">
                    {template.delayNotification && (
                      <div className="flex items-center text-sm">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Delayed send: {template.delayDuration} hours after creation</span>
                      </div>
                    )}
                    {template.requireApproval && (
                      <div className="flex items-center text-sm">
                        <Check className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Requires approval from: {template.approvalRole}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              <div className="flex justify-between p-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingTemplate(template)
                      setActiveTab("create")
                    }}
                  >
                    Edit
                  </Button>
                  <Button variant="outline" onClick={() => handleDuplicateTemplate(template)}>Duplicate</Button>
                   <Button variant="destructive" onClick={() => handleDeleteTemplate(template.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
                <Button>Use Template</Button>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{editingTemplate ? "Edit Template" : "Create New Template"}</CardTitle>
              <CardDescription>
                {editingTemplate
                  ? "Modify an existing notification template"
                  : "Create a new customer notification template for rework issues"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="templateName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Template Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Minor Rework Notification" {...field} />
                        </FormControl>
                        <FormDescription>Internal name for this template</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Update on Your Order: Minor Adjustments Required" {...field} />
                        </FormControl>
                        <FormDescription>Subject line for the notification email</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="body"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Body</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter the notification message..."
                            className="min-h-[300px] font-mono"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Use placeholders like [Customer Name], [Issue Description], [Time Impact], etc.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="delayNotification"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Delay Notification</FormLabel>
                              <FormDescription>Wait before sending the notification</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {form.watch("delayNotification") && (
                        <FormField
                          control={form.control}
                          name="delayDuration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Delay Duration (hours)</FormLabel>
                              <FormControl>
                                <Input type="number" min="1" max="72" {...field} />
                              </FormControl>
                              <FormDescription>How many hours to wait before sending</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="requireApproval"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Require Approval</FormLabel>
                              <FormDescription>Notification requires approval before sending</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {form.watch("requireApproval") && (
                        <FormField
                          control={form.control}
                          name="approvalRole"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Approval Role</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Production Manager">Production Manager</SelectItem>
                                  <SelectItem value="Store Manager">Store Manager</SelectItem>
                                  <SelectItem value="Customer Service Manager">Customer Service Manager</SelectItem>
                                  <SelectItem value="General Manager">General Manager</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>Who needs to approve this notification</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        form.reset()
                        setEditingTemplate(null)
                        setActiveTab("templates")
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">{editingTemplate ? "Update Template" : "Save Template"}</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification History</CardTitle>
              <CardDescription>Recent customer notifications related to rework issues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-7 bg-muted p-4 font-medium">
                  <div>Customer</div>
                  <div>Order ID</div>
                  <div>Template</div>
                  <div>Sent Date</div>
                  <div className="text-center">Status</div>
                  <div className="text-center">Opened</div>
                  <div className="text-center">Response</div>
                </div>
                {mockNotificationHistory.map((notification) => (
                  <div key={notification.id} className="grid grid-cols-7 p-4 border-t">
                    <div>{notification.customer}</div>
                    <div>{notification.orderId}</div>
                    <div>{notification.template}</div>
                    <div>{format(notification.sentDate, "MMM d, yyyy h:mm a")}</div>
                    <div className="text-center">
                      <Badge
                        variant={
                          notification.status === "delivered"
                            ? "default"
                            : notification.status === "pending"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {notification.status}
                      </Badge>
                    </div>
                    <div className="text-center">
                      {notification.openedBy ? (
                        <Check className="h-4 w-4 mx-auto text-green-500" />
                      ) : (
                        <X className="h-4 w-4 mx-auto text-muted-foreground" />
                      )}
                    </div>
                    <div className="text-center">
                      {notification.responseReceived ? (
                        <Check className="h-4 w-4 mx-auto text-green-500" />
                      ) : (
                        <X className="h-4 w-4 mx-auto text-muted-foreground" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <div className="flex justify-between">
              <Button variant="outline">Export History</Button>
              <Button>View All</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure default settings for customer notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <h4 className="text-base font-medium">Automatic Notifications</h4>
                  <p className="text-sm text-muted-foreground">
                    Automatically notify customers when rework is required
                  </p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <h4 className="text-base font-medium">Default Approval Requirement</h4>
                  <p className="text-sm text-muted-foreground">Require approval for all notifications by default</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <h4 className="text-base font-medium">Send Follow-up Reminders</h4>
                  <p className="text-sm text-muted-foreground">Send follow-up reminders if no response is received</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-2">
                <h4 className="text-base font-medium">Default Notification Template</h4>
                <Select defaultValue="t1">
                  <SelectTrigger>
                    <SelectValue placeholder="Select default template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">Template to use when no specific template is selected</p>
              </div>

              <div className="space-y-2">
                <h4 className="text-base font-medium">Email Sender Name</h4>
                <Input defaultValue="Jewelia Customer Service" />
                <p className="text-sm text-muted-foreground">Name that appears as the sender of notification emails</p>
              </div>

              <div className="space-y-2">
                <h4 className="text-base font-medium">Reply-To Email</h4>
                <Input defaultValue="customerservice@jeweliacrm.com" />
                <p className="text-sm text-muted-foreground">Email address for customer replies</p>
              </div>
            </CardContent>
            <div className="flex justify-between">
              <Button className="ml-auto">Save Settings</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
