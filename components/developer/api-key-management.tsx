"use client"

import { useState } from "react"
import { Copy, Eye, EyeOff, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { copyToClipboard } from "@/components/ui/utils";
import { useToast } from "@/components/ui/use-toast";

interface ApiKey {
  id: string
  name: string
  key: string
  created: string
  last_used?: string
  active: boolean
  permissions: string[]
}

const sampleApiKeys: ApiKey[] = [
  {
    id: "key_123456",
    name: "Production API Key",
    key: "sk_live_***YOUR_PRODUCTION_KEY_HERE***",
    created: "2023-01-15T12:00:00Z",
    last_used: "2023-05-10T15:23:45Z",
    active: true,
    permissions: ["read:inventory", "write:inventory", "read:categories", "write:categories"],
  },
  {
    id: "key_789012",
    name: "Test API Key",
    key: "sk_test_***YOUR_TEST_KEY_HERE***",
    created: "2023-02-20T09:30:00Z",
    last_used: "2023-05-09T11:12:33Z",
    active: true,
    permissions: ["read:inventory", "read:categories"],
  },
]

export function ApiKeyManagement() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(sampleApiKeys)
  const [newKeyName, setNewKeyName] = useState("")
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [newApiKey, setNewApiKey] = useState<string | null>(null)
  const { toast } = useToast();

  const handleAddApiKey = () => {
    if (!newKeyName || selectedPermissions.length === 0) return

    const newKey = `sk_${Math.random().toString(36).substring(2, 8)}_jewelia_${Math.random().toString(36).substring(2, 12)}`

    setNewApiKey(newKey)

    const newApiKey: ApiKey = {
      id: `key_${Math.random().toString(36).substring(2, 8)}`,
      name: newKeyName,
      key: newKey,
      created: new Date().toISOString(),
      active: true,
      permissions: selectedPermissions,
    }

    setApiKeys([...apiKeys, newApiKey])
    setNewKeyName("")
    setSelectedPermissions([])
  }

  const handleDeleteApiKey = (id: string) => {
    setApiKeys(apiKeys.filter((key) => key.id !== id))
  }

  const handleToggleApiKey = (id: string) => {
    setApiKeys(apiKeys.map((key) => (key.id === id ? { ...key, active: !key.active } : key)))
  }

  const handleToggleShowKey = (id: string) => {
    setShowKeys({
      ...showKeys,
      [id]: !showKeys[id],
    })
  }

  const handlePermissionToggle = (permission: string) => {
    if (selectedPermissions.includes(permission)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== permission))
    } else {
      setSelectedPermissions([...selectedPermissions, permission])
    }
  }

  const handleCopyKey = (key: string) => {
    copyToClipboard(key, (msg) => toast({ title: msg }));
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>Manage your API keys for accessing the Jewelia CRM API.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {apiKeys.map((apiKey) => (
              <Card key={apiKey.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{apiKey.name}</CardTitle>
                      <CardDescription>ID: {apiKey.id}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`apikey-${apiKey.id}`}
                          checked={apiKey.active}
                          onCheckedChange={() => handleToggleApiKey(apiKey.id)}
                        />
                        <Label htmlFor={`apikey-${apiKey.id}`}>{apiKey.active ? "Active" : "Inactive"}</Label>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteApiKey(apiKey.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="relative flex-1">
                      <Input
                        value={showKeys[apiKey.id] ? apiKey.key : "•".repeat(apiKey.key.length)}
                        readOnly
                        className="pr-20 font-mono text-sm"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleToggleShowKey(apiKey.id)}
                        >
                          {showKeys[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleCopyKey(apiKey.key)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {apiKey.permissions.map((permission) => (
                      <Badge key={permission} variant="secondary">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span>Created: {new Date(apiKey.created).toLocaleDateString()}</span>
                    {apiKey.last_used && (
                      <span className="ml-4">
                        Last used: {new Date(apiKey.last_used).toLocaleDateString()}{" "}
                        {new Date(apiKey.last_used).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create New API Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New API Key</DialogTitle>
                <DialogDescription>Create a new API key to access the Jewelia CRM API.</DialogDescription>
              </DialogHeader>

              {newApiKey ? (
                <div className="space-y-4">
                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertTitle className="text-amber-800">Important!</AlertTitle>
                    <AlertDescription className="text-amber-800">
                      This is the only time your API key will be displayed. Please copy it now and store it securely.
                    </AlertDescription>
                  </Alert>

                  <div className="flex items-center space-x-2">
                    <Input value={newApiKey} readOnly className="font-mono text-sm" />
                    <Button variant="outline" size="icon" onClick={() => handleCopyKey(newApiKey)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  <DialogFooter>
                    <Button onClick={() => setNewApiKey(null)}>Done</Button>
                  </DialogFooter>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="api-key-name">API Key Name</Label>
                      <Input
                        id="api-key-name"
                        placeholder="e.g., Production API Key"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Permissions</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          "read:inventory",
                          "write:inventory",
                          "read:categories",
                          "write:categories",
                          "read:stones",
                          "write:stones",
                          "read:locations",
                          "write:locations",
                        ].map((permission) => (
                          <div key={permission} className="flex items-center space-x-2">
                            <Switch
                              id={`permission-${permission}`}
                              checked={selectedPermissions.includes(permission)}
                              onCheckedChange={() => handlePermissionToggle(permission)}
                            />
                            <Label htmlFor={`permission-${permission}`} className="text-sm">
                              {permission}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setNewKeyName("")}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddApiKey}>Create API Key</Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Key Best Practices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">Keep Your API Keys Secure</h3>
            <p className="text-sm text-muted-foreground">
              Your API keys carry many privileges, so be sure to keep them secure. Don't share your API keys in publicly
              accessible areas such as GitHub, client-side code, or in calls to the API.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Use Environment Variables</h3>
            <p className="text-sm text-muted-foreground">
              Store your API keys in environment variables instead of hardcoding them into your application. This helps
              prevent accidental exposure of your keys.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Rotate API Keys Regularly</h3>
            <p className="text-sm text-muted-foreground">
              Regularly rotating your API keys helps minimize damage in case a key is compromised. We recommend rotating
              your keys at least every 90 days.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Use Separate Keys for Different Environments</h3>
            <p className="text-sm text-muted-foreground">
              Use different API keys for development, testing, and production environments. This helps isolate issues
              and minimize the impact of a compromised key.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
