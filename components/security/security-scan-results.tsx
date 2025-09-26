import { Shield, CheckCircle, AlertTriangle, XCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

export function SecurityScanResults() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Security Scan Results</CardTitle>
            </div>
            <Badge className="bg-emerald-500">Last scan: Today, 09:45 AM</Badge>
          </div>
          <CardDescription>Results from the latest security scan of your system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center rounded-lg bg-muted p-6 text-center">
            <div className="text-6xl font-bold text-emerald-500">92</div>
            <div className="mt-2 text-xl font-semibold">Security Score</div>
            <div className="mt-1 text-sm text-muted-foreground">Your system is well-protected</div>
            <Progress value={92} className="mt-4 h-2 w-full max-w-md" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <span className="font-medium">Passed</span>
              </div>
              <div className="mt-2 text-3xl font-bold">42</div>
              <div className="mt-1 text-sm text-muted-foreground">Security checks passed</div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <span className="font-medium">Warnings</span>
              </div>
              <div className="mt-2 text-3xl font-bold">3</div>
              <div className="mt-1 text-sm text-muted-foreground">Issues requiring attention</div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive" />
                <span className="font-medium">Critical</span>
              </div>
              <div className="mt-2 text-3xl font-bold">0</div>
              <div className="mt-1 text-sm text-muted-foreground">Critical security issues</div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">View Full Report</Button>
          <Button>Run New Scan</Button>
        </CardFooter>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Security Warnings</CardTitle>
            <CardDescription>Issues that require your attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-500" />
                <div>
                  <div className="font-medium">Password Policy</div>
                  <p className="text-sm text-muted-foreground">3 admin users have passwords older than 90 days</p>
                  <Button variant="link" className="h-auto p-0 text-primary">
                    Enforce password reset
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-md border p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-500" />
                <div>
                  <div className="font-medium">MFA Not Enabled</div>
                  <p className="text-sm text-muted-foreground">2 users with admin access don't have MFA enabled</p>
                  <Button variant="link" className="h-auto p-0 text-primary">
                    Enforce MFA
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-md border p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-500" />
                <div>
                  <div className="font-medium">Software Updates</div>
                  <p className="text-sm text-muted-foreground">3 dependencies have security updates available</p>
                  <Button variant="link" className="h-auto p-0 text-primary">
                    View updates
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Fix All Issues
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Recommendations</CardTitle>
            <CardDescription>Suggestions to improve your security posture</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border p-4">
              <div className="flex items-start gap-2">
                <Shield className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">Enable IP Restrictions</div>
                  <p className="text-sm text-muted-foreground">Limit admin access to specific IP addresses</p>
                  <Button variant="link" className="h-auto p-0 text-primary">
                    Configure now
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-md border p-4">
              <div className="flex items-start gap-2">
                <Shield className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">Security Awareness Training</div>
                  <p className="text-sm text-muted-foreground">5 users haven't completed security training</p>
                  <Button variant="link" className="h-auto p-0 text-primary">
                    Send reminders
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-md border p-4">
              <div className="flex items-start gap-2">
                <Shield className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">API Security Audit</div>
                  <p className="text-sm text-muted-foreground">Last API security audit was 6 months ago</p>
                  <Button variant="link" className="h-auto p-0 text-primary">
                    Schedule audit
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-md border p-4">
              <div className="flex items-start gap-2">
                <Shield className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <div className="font-medium">Data Classification</div>
                  <p className="text-sm text-muted-foreground">Implement data classification for better protection</p>
                  <Button variant="link" className="h-auto p-0 text-primary">
                    Learn more
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Implement All Recommendations
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
