"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, RefreshCw, Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { copyToClipboard } from "@/components/ui/utils";

export function AuthenticationConfig() {
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKey, setApiKey] = useState("sk_live_***YOUR_API_KEY_HERE***")

  const handleCopyApiKey = () => {
    copyToClipboard(apiKey);
    // You would typically show a toast notification here
  }

  const handleRegenerateApiKey = () => {
    // In a real app, this would call an API to regenerate the key
    setApiKey("sk_live_***NEW_API_KEY_GENERATED***")
    // You would typically show a toast notification here
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Authentication Settings</h3>
        <p className="text-sm text-muted-foreground">Configure how your applications authenticate with the API</p>
      </div>

      <Tabs defaultValue="api-keys" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="oauth">OAuth</TabsTrigger>
          <TabsTrigger value="jwt">JWT</TabsTrigger>
        </TabsList>

        <TabsContent value="api-keys" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Manage your API keys for authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">Live API Key</Label>
                <div className="flex">
                  <div className="relative flex-1">
                    <Input
                      id="api-key"
                      value={apiKey}
                      type={showApiKey ? "text" : "password"}
                      readOnly
                      className="pr-10 font-mono"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button variant="outline" onClick={handleCopyApiKey} className="ml-2">
                    <Copy className="h-4 w-4 mr-2" /> Copy
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="key-name">Key Name</Label>
                <Input id="key-name" placeholder="Production API Key" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="permissions">Permissions</Label>
                <Select defaultValue="read-write">
                  <SelectTrigger id="permissions">
                    <SelectValue placeholder="Select permissions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="read-only">Read Only</SelectItem>
                    <SelectItem value="read-write">Read & Write</SelectItem>
                    <SelectItem value="full-access">Full Access</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <div className="flex justify-between">
              <Button variant="outline" onClick={handleRegenerateApiKey}>
                <RefreshCw className="h-4 w-4 mr-2" /> Regenerate
              </Button>
              <Button>Save Changes</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="oauth" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>OAuth Configuration</CardTitle>
              <CardDescription>Set up OAuth 2.0 for secure API access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="client-id">Client ID</Label>
                <Input id="client-id" value="jewelia_client_12345" readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-secret">Client Secret</Label>
                <div className="flex">
                  <Input
                    id="client-secret"
                    type="password"
                    value="cs_jewelia_secret_67890"
                    readOnly
                    className="flex-1"
                  />
                  <Button variant="outline" className="ml-2">
                    <Copy className="h-4 w-4 mr-2" /> Copy
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="redirect-uri">Redirect URI</Label>
                <Input id="redirect-uri" placeholder="https://your-app.com/callback" />
              </div>
            </CardContent>
            <div>
              <Button>Save Changes</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="jwt" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>JWT Settings</CardTitle>
              <CardDescription>Configure JSON Web Token authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="jwt-secret">JWT Secret</Label>
                <Input id="jwt-secret" type="password" value="jwt_secret_key_123" readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jwt-expiry">Token Expiry (seconds)</Label>
                <Input id="jwt-expiry" type="number" defaultValue={3600} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jwt-algorithm">Signing Algorithm</Label>
                <Select defaultValue="HS256">
                  <SelectTrigger id="jwt-algorithm">
                    <SelectValue placeholder="Select algorithm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HS256">HS256</SelectItem>
                    <SelectItem value="HS384">HS384</SelectItem>
                    <SelectItem value="HS512">HS512</SelectItem>
                    <SelectItem value="RS256">RS256</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <div>
              <Button>Save Changes</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
