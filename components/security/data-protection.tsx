import { Lock, Database, FileText, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function DataProtection() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <CardTitle>Data Encryption</CardTitle>
          </div>
          <CardDescription>Configure encryption settings for your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Encrypt Data at Rest</Label>
              <p className="text-sm text-muted-foreground">Encrypt all stored data</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Encrypt Data in Transit</Label>
              <p className="text-sm text-muted-foreground">Use TLS for all data transfers</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">End-to-End Encryption</Label>
              <p className="text-sm text-muted-foreground">Enable for sensitive communications</p>
            </div>
            <Switch defaultChecked={false} />
          </div>

          <div className="space-y-2">
            <Label>Encryption Algorithm</Label>
            <Select defaultValue="aes256">
              <SelectTrigger>
                <SelectValue placeholder="Select encryption algorithm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aes128">AES-128</SelectItem>
                <SelectItem value="aes256">AES-256 (Recommended)</SelectItem>
                <SelectItem value="chacha20">ChaCha20-Poly1305</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            Key Management
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle>Backup & Recovery</CardTitle>
          </div>
          <CardDescription>Configure data backup and recovery options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Automated Backups</Label>
              <p className="text-sm text-muted-foreground">Schedule regular data backups</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="space-y-2">
            <Label>Backup Frequency</Label>
            <Select defaultValue="daily">
              <SelectTrigger>
                <SelectValue placeholder="Select backup frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Backup Retention</Label>
            <Select defaultValue="90">
              <SelectTrigger>
                <SelectValue placeholder="Select retention period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="60">60 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="365">1 year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Encrypt Backups</Label>
              <p className="text-sm text-muted-foreground">Apply encryption to backup files</p>
            </div>
            <Switch defaultChecked={true} />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button className="w-full">Run Manual Backup</Button>
          <Button variant="outline" className="w-full">
            Restore from Backup
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Data Retention</CardTitle>
          </div>
          <CardDescription>Configure how long data is stored in the system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Automatic Data Pruning</Label>
              <p className="text-sm text-muted-foreground">Automatically remove old data</p>
            </div>
            <Switch defaultChecked={false} />
          </div>

          <div className="space-y-2">
            <Label>Customer Data Retention</Label>
            <Select defaultValue="indefinite">
              <SelectTrigger>
                <SelectValue placeholder="Select retention period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1year">1 year after last activity</SelectItem>
                <SelectItem value="2years">2 years after last activity</SelectItem>
                <SelectItem value="5years">5 years after last activity</SelectItem>
                <SelectItem value="indefinite">Indefinite</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Transaction Data Retention</Label>
            <Select defaultValue="7years">
              <SelectTrigger>
                <SelectValue placeholder="Select retention period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1year">1 year</SelectItem>
                <SelectItem value="3years">3 years</SelectItem>
                <SelectItem value="5years">5 years</SelectItem>
                <SelectItem value="7years">7 years</SelectItem>
                <SelectItem value="indefinite">Indefinite</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Log Data Retention</Label>
            <Select defaultValue="90days">
              <SelectTrigger>
                <SelectValue placeholder="Select retention period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30days">30 days</SelectItem>
                <SelectItem value="90days">90 days</SelectItem>
                <SelectItem value="1year">1 year</SelectItem>
                <SelectItem value="indefinite">Indefinite</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            Configure Custom Retention Policies
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            <CardTitle>Disaster Recovery</CardTitle>
          </div>
          <CardDescription>Configure disaster recovery settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Geo-Redundant Storage</Label>
              <p className="text-sm text-muted-foreground">Store backups in multiple locations</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Automatic Failover</Label>
              <p className="text-sm text-muted-foreground">Automatically switch to backup systems</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="space-y-2">
            <Label>Recovery Time Objective (RTO)</Label>
            <Select defaultValue="4hours">
              <SelectTrigger>
                <SelectValue placeholder="Select RTO" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1hour">1 hour</SelectItem>
                <SelectItem value="4hours">4 hours</SelectItem>
                <SelectItem value="8hours">8 hours</SelectItem>
                <SelectItem value="24hours">24 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Recovery Point Objective (RPO)</Label>
            <Select defaultValue="1hour">
              <SelectTrigger>
                <SelectValue placeholder="Select RPO" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15min">15 minutes</SelectItem>
                <SelectItem value="1hour">1 hour</SelectItem>
                <SelectItem value="4hours">4 hours</SelectItem>
                <SelectItem value="24hours">24 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button className="w-full">Test Recovery Plan</Button>
          <Button variant="outline" className="w-full">
            View Recovery Documentation
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
