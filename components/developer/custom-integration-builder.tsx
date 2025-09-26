"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, Code, Play, Save, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

interface IntegrationBuilder {
  name: string
  description: string
  template: string
  configuration: {
    triggers: Array<{
      type: string
      config: Record<string, any>
    }>
    actions: Array<{
      type: string
      config: Record<string, any>
    }>
    conditions: Array<{
      field: string
      operator: string
      value: any
    }>
    dataMapping: Record<string, string>
    errorHandling: {
      retryCount: number
      retryDelay: number
      fallbackAction: string
    }
  }
  isActive: boolean
  schedule: {
    enabled: boolean
    cronExpression: string
    timezone: string
  }
  permissions: string[]
  metadata: {
    version: string
    author: string
    tags: string[]
    category: string
  }
}

const TEMPLATES = [
  { value: 'webhook_receiver', label: 'Webhook Receiver', description: 'Receive and process webhook data' },
  { value: 'data_sync', label: 'Data Sync', description: 'Synchronize data between systems' },
  { value: 'file_processor', label: 'File Processor', description: 'Process uploaded files' },
  { value: 'notification_sender', label: 'Notification Sender', description: 'Send notifications to users' },
  { value: 'data_transformer', label: 'Data Transformer', description: 'Transform data formats' },
  { value: 'custom_endpoint', label: 'Custom Endpoint', description: 'Create custom API endpoints' },
  { value: 'scheduled_task', label: 'Scheduled Task', description: 'Run tasks on a schedule' },
  { value: 'event_trigger', label: 'Event Trigger', description: 'Trigger actions on events' }
]

const TRIGGER_TYPES = [
  { value: 'webhook', label: 'Webhook', description: 'Trigger on webhook calls' },
  { value: 'schedule', label: 'Schedule', description: 'Trigger on time schedule' },
  { value: 'database_change', label: 'Database Change', description: 'Trigger on database changes' },
  { value: 'api_call', label: 'API Call', description: 'Trigger on API calls' }
]

const ACTION_TYPES = [
  { value: 'http_request', label: 'HTTP Request', description: 'Make HTTP requests' },
  { value: 'database_operation', label: 'Database Operation', description: 'Perform database operations' },
  { value: 'file_operation', label: 'File Operation', description: 'Perform file operations' },
  { value: 'notification', label: 'Notification', description: 'Send notifications' },
  { value: 'data_transform', label: 'Data Transform', description: 'Transform data' }
]

const OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'regex', label: 'Regex Match' }
]

export function CustomIntegrationBuilder() {
  const [integration, setIntegration] = useState<IntegrationBuilder>({
    name: '',
    description: '',
    template: '',
    configuration: {
      triggers: [],
      actions: [],
      conditions: [],
      dataMapping: {},
      errorHandling: {
        retryCount: 3,
        retryDelay: 5000,
        fallbackAction: ''
      }
    },
    isActive: false,
    schedule: {
      enabled: false,
      cronExpression: '',
      timezone: 'UTC'
    },
    permissions: [],
    metadata: {
      version: '1.0.0',
      author: '',
      tags: [],
      category: ''
    }
  })

  const [generatedCode, setGeneratedCode] = useState<string>('')
  const [showCode, setShowCode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const updateIntegration = (updates: Partial<IntegrationBuilder>) => {
    setIntegration(prev => ({ ...prev, ...updates }))
  }

  const updateConfiguration = (updates: Partial<IntegrationBuilder['configuration']>) => {
    setIntegration(prev => ({
      ...prev,
      configuration: { ...prev.configuration, ...updates }
    }))
  }

  const addTrigger = () => {
    const newTrigger = {
      type: 'webhook',
      config: {}
    }
    updateConfiguration({
      triggers: [...integration.configuration.triggers, newTrigger]
    })
  }

  const updateTrigger = (index: number, updates: any) => {
    const updatedTriggers = [...integration.configuration.triggers]
    updatedTriggers[index] = { ...updatedTriggers[index], ...updates }
    updateConfiguration({ triggers: updatedTriggers })
  }

  const removeTrigger = (index: number) => {
    const updatedTriggers = integration.configuration.triggers.filter((_, i) => i !== index)
    updateConfiguration({ triggers: updatedTriggers })
  }

  const addAction = () => {
    const newAction = {
      type: 'http_request',
      config: {}
    }
    updateConfiguration({
      actions: [...integration.configuration.actions, newAction]
    })
  }

  const updateAction = (index: number, updates: any) => {
    const updatedActions = [...integration.configuration.actions]
    updatedActions[index] = { ...updatedActions[index], ...updates }
    updateConfiguration({ actions: updatedActions })
  }

  const removeAction = (index: number) => {
    const updatedActions = integration.configuration.actions.filter((_, i) => i !== index)
    updateConfiguration({ actions: updatedActions })
  }

  const addCondition = () => {
    const newCondition = {
      field: '',
      operator: 'equals',
      value: ''
    }
    updateConfiguration({
      conditions: [...integration.configuration.conditions, newCondition]
    })
  }

  const updateCondition = (index: number, updates: any) => {
    const updatedConditions = [...integration.configuration.conditions]
    updatedConditions[index] = { ...updatedConditions[index], ...updates }
    updateConfiguration({ conditions: updatedConditions })
  }

  const removeCondition = (index: number) => {
    const updatedConditions = integration.configuration.conditions.filter((_, i) => i !== index)
    updateConfiguration({ conditions: updatedConditions })
  }

  const generateCode = async () => {
    try {
      const response = await fetch('/api/integrations/builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(integration)
      })

      if (response.ok) {
        const data = await response.json()
        setGeneratedCode(data.data.generatedCode)
        setShowCode(true)
        toast.success('Integration code generated successfully!')
      } else {
        throw new Error('Failed to generate code')
      }
    } catch (error) {
      toast.error('Failed to generate integration code')
      console.error('Error generating code:', error)
    }
  }

  const saveIntegration = async () => {
    if (!integration.name || !integration.template) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/integrations/builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(integration)
      })

      if (response.ok) {
        toast.success('Integration saved successfully!')
      } else {
        throw new Error('Failed to save integration')
      }
    } catch (error) {
      toast.error('Failed to save integration')
      console.error('Error saving integration:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const testIntegration = async () => {
    toast.info('Testing integration... (This would run the integration in a test environment)')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Custom Integration Builder</h2>
        <p className="text-muted-foreground">
          Create custom integrations without writing code using our visual builder
        </p>
      </div>

      <Tabs defaultValue="configuration" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="triggers">Triggers</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="code">Generated Code</TabsTrigger>
        </TabsList>

        <TabsContent value="configuration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Configure the basic details of your integration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Integration Name *</Label>
                  <Input
                    id="name"
                    value={integration.name}
                    onChange={(e) => updateIntegration({ name: e.target.value })}
                    placeholder="e.g., Customer Data Sync"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template">Template *</Label>
                  <Select value={integration.template} onValueChange={(value) => updateIntegration({ template: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {TEMPLATES.map((template) => (
                        <SelectItem key={template.value} value={template.value}>
                          <div>
                            <div className="font-medium">{template.label}</div>
                            <div className="text-sm text-muted-foreground">{template.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={integration.description}
                  onChange={(e) => updateIntegration({ description: e.target.value })}
                  placeholder="Describe what this integration does..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="version">Version</Label>
                  <Input
                    id="version"
                    value={integration.metadata.version}
                    onChange={(e) => updateIntegration({ 
                      metadata: { ...integration.metadata, version: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={integration.metadata.author}
                    onChange={(e) => updateIntegration({ 
                      metadata: { ...integration.metadata, author: e.target.value }
                    })}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={integration.metadata.category}
                    onChange={(e) => updateIntegration({ 
                      metadata: { ...integration.metadata, category: e.target.value }
                    })}
                    placeholder="e.g., customer_management"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={integration.isActive}
                  onCheckedChange={(checked) => updateIntegration({ isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Schedule Configuration</CardTitle>
              <CardDescription>Configure when this integration should run</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="scheduleEnabled"
                  checked={integration.schedule.enabled}
                  onCheckedChange={(checked) => updateIntegration({ 
                    schedule: { ...integration.schedule, enabled: checked }
                  })}
                />
                <Label htmlFor="scheduleEnabled">Enable Scheduling</Label>
              </div>

              {integration.schedule.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cronExpression">Cron Expression</Label>
                    <Input
                      id="cronExpression"
                      value={integration.schedule.cronExpression}
                      onChange={(e) => updateIntegration({ 
                        schedule: { ...integration.schedule, cronExpression: e.target.value }
                      })}
                      placeholder="0 0 * * * (daily at midnight)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select 
                      value={integration.schedule.timezone} 
                      onValueChange={(value) => updateIntegration({ 
                        schedule: { ...integration.schedule, timezone: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Error Handling</CardTitle>
              <CardDescription>Configure how errors should be handled</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="retryCount">Retry Count</Label>
                  <Input
                    id="retryCount"
                    type="number"
                    min="0"
                    max="10"
                    value={integration.configuration.errorHandling.retryCount}
                    onChange={(e) => updateConfiguration({
                      errorHandling: {
                        ...integration.configuration.errorHandling,
                        retryCount: parseInt(e.target.value)
                      }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retryDelay">Retry Delay (ms)</Label>
                  <Input
                    id="retryDelay"
                    type="number"
                    min="1000"
                    max="60000"
                    value={integration.configuration.errorHandling.retryDelay}
                    onChange={(e) => updateConfiguration({
                      errorHandling: {
                        ...integration.configuration.errorHandling,
                        retryDelay: parseInt(e.target.value)
                      }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="triggers" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Triggers</CardTitle>
                  <CardDescription>Configure what triggers this integration to run</CardDescription>
                </div>
                <Button onClick={addTrigger} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Trigger
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {integration.configuration.triggers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No triggers configured</p>
                  <p className="text-sm">Add a trigger to define when this integration should run</p>
                </div>
              ) : (
                integration.configuration.triggers.map((trigger, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="outline">Trigger {index + 1}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTrigger(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Trigger Type</Label>
                        <Select
                          value={trigger.type}
                          onValueChange={(value) => updateTrigger(index, { type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TRIGGER_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Configuration</Label>
                        <Input
                          placeholder="Configuration details..."
                          value={JSON.stringify(trigger.config)}
                          onChange={(e) => {
                            try {
                              const config = JSON.parse(e.target.value)
                              updateTrigger(index, { config })
                            } catch {
                              // Invalid JSON, ignore
                            }
                          }}
                        />
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Actions</CardTitle>
                  <CardDescription>Configure what actions this integration should perform</CardDescription>
                </div>
                <Button onClick={addAction} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Action
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {integration.configuration.actions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No actions configured</p>
                  <p className="text-sm">Add an action to define what this integration should do</p>
                </div>
              ) : (
                integration.configuration.actions.map((action, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="outline">Action {index + 1}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAction(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Action Type</Label>
                        <Select
                          value={action.type}
                          onValueChange={(value) => updateAction(index, { type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ACTION_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Configuration</Label>
                        <Input
                          placeholder="Configuration details..."
                          value={JSON.stringify(action.config)}
                          onChange={(e) => {
                            try {
                              const config = JSON.parse(e.target.value)
                              updateAction(index, { config })
                            } catch {
                              // Invalid JSON, ignore
                            }
                          }}
                        />
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Conditions</CardTitle>
                  <CardDescription>Configure conditions that must be met for actions to execute</CardDescription>
                </div>
                <Button onClick={addCondition} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Condition
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {integration.configuration.conditions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No conditions configured</p>
                  <p className="text-sm">Add conditions to control when actions should execute</p>
                </div>
              ) : (
                integration.configuration.conditions.map((condition, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="outline">Condition {index + 1}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCondition(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Field</Label>
                        <Input
                          placeholder="Field name"
                          value={condition.field}
                          onChange={(e) => updateCondition(index, { field: e.target.value })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Operator</Label>
                        <Select
                          value={condition.operator}
                          onValueChange={(value) => updateCondition(index, { operator: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {OPERATORS.map((op) => (
                              <SelectItem key={op.value} value={op.value}>
                                {op.value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Value</Label>
                        <Input
                          placeholder="Value to compare"
                          value={condition.value}
                          onChange={(e) => updateCondition(index, { value: e.target.value })}
                        />
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="code" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Generated Code</CardTitle>
                  <CardDescription>Review the generated code for your integration</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={generateCode} variant="outline" size="sm">
                    <Code className="h-4 w-4 mr-2" />
                    Generate Code
                  </Button>
                  <Button onClick={testIntegration} variant="outline" size="sm">
                    <Play className="h-4 w-4 mr-2" />
                    Test
                  </Button>
                  <Button onClick={saveIntegration} disabled={isSaving} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {generatedCode ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Generated Integration Code</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCode(!showCode)}
                    >
                      {showCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      {showCode ? 'Hide' : 'Show'} Code
                    </Button>
                  </div>
                  
                  {showCode && (
                    <div className="bg-muted p-4 rounded-lg">
                      <pre className="text-sm overflow-x-auto">
                        <code>{generatedCode}</code>
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Code className="h-12 w-12 mx-auto mb-4" />
                  <p>No code generated yet</p>
                  <p className="text-sm">Click "Generate Code" to create the integration code</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
