import { CheckCircle, FileText, Shield, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export function ComplianceTools() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>GDPR Compliance</CardTitle>
          </div>
          <CardDescription>Tools and settings for GDPR compliance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Data Subject Request Portal</Label>
              <p className="text-sm text-muted-foreground">Allow users to request their data</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Right to be Forgotten</Label>
              <p className="text-sm text-muted-foreground">Enable data deletion requests</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Data Processing Register</Label>
              <p className="text-sm text-muted-foreground">Track all data processing activities</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Cookie Consent Manager</Label>
              <p className="text-sm text-muted-foreground">Manage cookie consent preferences</p>
            </div>
            <Switch defaultChecked={true} />
          </div>
        </CardContent>
        <div>
          <Button variant="outline" className="w-full">
            GDPR Documentation
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            <CardTitle>Compliance Status</CardTitle>
          </div>
          <CardDescription>Current compliance status and certifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-base">GDPR</Label>
              <Badge className="bg-emerald-500">Compliant</Badge>
            </div>
            <Progress value={100} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-base">CCPA</Label>
              <Badge className="bg-emerald-500">Compliant</Badge>
            </div>
            <Progress value={100} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-base">HIPAA</Label>
              <Badge className="bg-amber-500">In Progress</Badge>
            </div>
            <Progress value={75} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-base">SOC 2</Label>
              <Badge className="bg-emerald-500">Compliant</Badge>
            </div>
            <Progress value={100} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-base">ISO 27001</Label>
              <Badge variant="outline">Planned</Badge>
            </div>
            <Progress value={10} className="h-2" />
          </div>
        </CardContent>
        <div>
          <Button variant="outline" className="w-full">
            View Certifications
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Compliance Documentation</CardTitle>
          </div>
          <CardDescription>Access and manage compliance documentation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="font-medium">Privacy Policy</span>
              </div>
              <Badge variant="outline">Updated 30 days ago</Badge>
            </div>
          </div>

          <div className="rounded-md border p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="font-medium">Terms of Service</span>
              </div>
              <Badge variant="outline">Updated 30 days ago</Badge>
            </div>
          </div>

          <div className="rounded-md border p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="font-medium">Data Processing Agreement</span>
              </div>
              <Badge variant="outline">Updated 45 days ago</Badge>
            </div>
          </div>

          <div className="rounded-md border p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="font-medium">Cookie Policy</span>
              </div>
              <Badge variant="outline">Updated 60 days ago</Badge>
            </div>
          </div>

          <div className="rounded-md border p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="font-medium">Security Whitepaper</span>
              </div>
              <Badge variant="outline">Updated 90 days ago</Badge>
            </div>
          </div>
        </CardContent>
        <div className="flex flex-col gap-2">
          <Button className="w-full">Update Documentation</Button>
          <Button variant="outline" className="w-full">
            Download All Documents
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            <CardTitle>Compliance Monitoring</CardTitle>
          </div>
          <CardDescription>Monitor and address compliance issues</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Automated Compliance Scans</Label>
              <p className="text-sm text-muted-foreground">Regularly scan for compliance issues</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Compliance Alerts</Label>
              <p className="text-sm text-muted-foreground">Receive alerts for compliance issues</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Audit Logging</Label>
              <p className="text-sm text-muted-foreground">Log all compliance-related activities</p>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="rounded-md bg-amber-50 p-3 text-amber-800">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <div>
                <p className="font-medium">Compliance Alert</p>
                <p className="text-sm">3 data retention policies need review to maintain GDPR compliance.</p>
              </div>
            </div>
          </div>
        </CardContent>
        <div className="flex flex-col gap-2">
          <Button className="w-full">Run Compliance Scan</Button>
          <Button variant="outline" className="w-full">
            View Compliance Reports
          </Button>
        </div>
      </Card>
    </div>
  )
}
