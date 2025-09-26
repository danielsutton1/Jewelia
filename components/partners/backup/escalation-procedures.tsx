"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { AlertTriangle, PhoneCall, Clock, ArrowUpRight } from "lucide-react"

export function EscalationProcedures() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-2">
              <AlertTriangle className="h-8 w-8 text-amber-600" />
              <h3 className="font-medium">Level 1: Initial Response</h3>
              <p className="text-sm text-muted-foreground">For delays up to 4 hours or minor quality issues</p>
              <Button size="sm" variant="outline" className="mt-2">
                <PhoneCall className="h-4 w-4 mr-2" />
                Contact Partner
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-2">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <h3 className="font-medium">Level 2: Manager Intervention</h3>
              <p className="text-sm text-muted-foreground">For delays of 4-24 hours or significant quality issues</p>
              <Button size="sm" variant="outline" className="mt-2">
                <Clock className="h-4 w-4 mr-2" />
                Escalate to Manager
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-2">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <h3 className="font-medium">Level 3: Emergency Protocol</h3>
              <p className="text-sm text-muted-foreground">For delays over 24 hours or critical failures</p>
              <Button size="sm" variant="outline" className="mt-2">
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Activate Emergency Protocol
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>Level 1 Escalation Procedure</AccordionTrigger>
          <AccordionContent>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Contact partner directly using emergency contact information</li>
              <li>Document the issue in the partner management system</li>
              <li>Set a 2-hour timer for response</li>
              <li>If no resolution within 2 hours, proceed to Level 2</li>
            </ol>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger>Level 2 Escalation Procedure</AccordionTrigger>
          <AccordionContent>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Notify department manager of the issue</li>
              <li>Manager contacts partner's management team</li>
              <li>Update customer about potential delays</li>
              <li>Identify alternative solutions or partners</li>
              <li>If no resolution within 4 hours, proceed to Level 3</li>
            </ol>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger>Level 3 Escalation Procedure</AccordionTrigger>
          <AccordionContent>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Activate emergency response team</li>
              <li>Executive management notification</li>
              <li>Immediate partner replacement protocol</li>
              <li>Customer compensation procedure</li>
              <li>Post-incident review and partner evaluation</li>
            </ol>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
