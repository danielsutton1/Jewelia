"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Download, Printer, FileText, Clock } from "lucide-react"

export function AgreementDisplay() {
  // This would be fetched from your API in a real application
  const agreementData = {
    id: "AGR-2023-001",
    partner: "Eleanor's Fine Jewelry",
    startDate: "September 1, 2023",
    endDate: "September 1, 2025",
    status: "active",
    commissionRate: 30,
    paymentSchedule: "Monthly (15th)",
    consignmentPeriod: "12 months",
    renewalType: "Automatic",
    lastUpdated: "September 1, 2023",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Consignment Agreement</h2>
          <p className="text-muted-foreground">Review your current agreement terms and conditions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Agreement Summary</CardTitle>
            <CardDescription>Key details of your consignment agreement</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="font-medium">Agreement ID</dt>
                <dd>{agreementData.id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Status</dt>
                <dd>
                  <Badge className="bg-green-500">Active</Badge>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Partner Name</dt>
                <dd>{agreementData.partner}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Start Date</dt>
                <dd>{agreementData.startDate}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">End Date</dt>
                <dd>{agreementData.endDate}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Last Updated</dt>
                <dd>{agreementData.lastUpdated}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Terms</CardTitle>
            <CardDescription>Important terms of your agreement</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="font-medium">Commission Rate</dt>
                <dd>{agreementData.commissionRate}%</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Payment Schedule</dt>
                <dd>{agreementData.paymentSchedule}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Consignment Period</dt>
                <dd>{agreementData.consignmentPeriod}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Renewal Type</dt>
                <dd>{agreementData.renewalType}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Insurance Coverage</dt>
                <dd>Full replacement value</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Return Policy</dt>
                <dd>15 days after period end</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agreement Details</CardTitle>
          <CardDescription>Complete terms and conditions</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="terms" className="space-y-4">
            <TabsList>
              <TabsTrigger value="terms">Terms & Conditions</TabsTrigger>
              <TabsTrigger value="commission">Commission Structure</TabsTrigger>
              <TabsTrigger value="payment">Payment Terms</TabsTrigger>
              <TabsTrigger value="history">Amendment History</TabsTrigger>
            </TabsList>
            <TabsContent value="terms" className="space-y-4">
              <div className="prose max-w-none">
                <h3>1. Parties</h3>
                <p>
                  This Consignment Agreement ("Agreement") is entered into between Jewelia CRM ("Company") and Eleanor's
                  Fine Jewelry ("Consignor") as of September 1, 2023.
                </p>

                <h3>2. Purpose</h3>
                <p>
                  The Consignor wishes to place certain items of jewelry and related goods ("Consigned Items") with the
                  Company for sale, and the Company wishes to accept such items on consignment for the purpose of
                  selling them to its customers.
                </p>

                <h3>3. Term</h3>
                <p>
                  This Agreement shall commence on September 1, 2023 and continue until September 1, 2025, unless
                  terminated earlier as provided herein. This Agreement shall automatically renew for successive
                  one-year periods unless either party provides written notice of non-renewal at least 30 days prior to
                  the end of the current term.
                </p>

                <h3>4. Consignment Process</h3>
                <p>
                  The Consignor shall deliver Consigned Items to the Company along with a description of each item,
                  including its suggested retail price. The Company shall inspect each item upon receipt and document
                  its condition. The Company reserves the right to refuse any item for any reason.
                </p>

                <h3>5. Title and Risk of Loss</h3>
                <p>
                  Title to Consigned Items shall remain with the Consignor until sold to a customer. The Company shall
                  be responsible for the safekeeping of Consigned Items and shall maintain insurance covering their full
                  replacement value while in the Company's possession.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="commission" className="space-y-4">
              <div className="prose max-w-none">
                <h3>Commission Structure</h3>
                <p>
                  The Company shall retain a commission of 30% of the final sale price of each Consigned Item sold. This
                  commission rate applies to all items unless otherwise specified in writing for particular items.
                </p>

                <h3>Commission Rate Tiers</h3>
                <p>The following commission rate tiers may apply based on the final sale price:</p>
                <ul>
                  <li>Items selling for less than $1,000: 35% commission</li>
                  <li>Items selling for $1,000 - $5,000: 30% commission</li>
                  <li>Items selling for more than $5,000: 25% commission</li>
                </ul>

                <h3>Volume Discounts</h3>
                <p>
                  Consignors who maintain an average of 20 or more active items on consignment during a calendar quarter
                  may be eligible for a 2% reduction in commission rates for the following quarter.
                </p>

                <h3>Special Promotions</h3>
                <p>
                  The Company may, from time to time, run special promotions or sales events. The Consignor will be
                  notified in advance of such events and may choose whether to participate. During such events, the
                  commission structure may be adjusted as agreed upon by both parties.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="payment" className="space-y-4">
              <div className="prose max-w-none">
                <h3>Payment Schedule</h3>
                <p>
                  The Company shall pay the Consignor their share of the proceeds from the sale of Consigned Items on a
                  monthly basis. Payments shall be made on the 15th day of each month for all items sold during the
                  previous month.
                </p>

                <h3>Payment Methods</h3>
                <p>
                  Payments shall be made by direct deposit to the Consignor's designated bank account. Alternative
                  payment methods may be arranged upon mutual agreement.
                </p>

                <h3>Settlement Statements</h3>
                <p>Each payment shall be accompanied by a detailed settlement statement showing:</p>
                <ul>
                  <li>Each item sold during the period</li>
                  <li>The date of each sale</li>
                  <li>The sale price of each item</li>
                  <li>The commission retained by the Company</li>
                  <li>The net amount due to the Consignor</li>
                </ul>

                <h3>Taxes</h3>
                <p>
                  The Consignor is responsible for reporting and paying all applicable taxes on income received from the
                  sale of Consigned Items. The Company will provide an annual statement of earnings for tax purposes.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="history" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-start space-x-4 rounded-md border p-4">
                  <Clock className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium">Original Agreement</h4>
                    <p className="text-sm text-muted-foreground">September 1, 2023</p>
                    <p className="mt-1 text-sm">Initial consignment agreement established with standard terms.</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <FileText className="mr-2 h-4 w-4" />
                      View Document
                    </Button>
                  </div>
                </div>
                <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                  No amendments have been made to the original agreement.
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
