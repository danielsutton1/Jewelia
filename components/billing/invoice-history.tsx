import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, Eye, MoreHorizontal } from "lucide-react"

const invoices = [
  {
    id: "INV-001",
    date: "May 15, 2023",
    amount: "$49.99",
    status: "Paid",
    description: "Professional Plan - Monthly",
  },
  {
    id: "INV-002",
    date: "Apr 15, 2023",
    amount: "$49.99",
    status: "Paid",
    description: "Professional Plan - Monthly",
  },
  {
    id: "INV-003",
    date: "Mar 15, 2023",
    amount: "$49.99",
    status: "Paid",
    description: "Professional Plan - Monthly",
  },
  {
    id: "INV-004",
    date: "Feb 15, 2023",
    amount: "$49.99",
    status: "Paid",
    description: "Professional Plan - Monthly",
  },
  {
    id: "INV-005",
    date: "Jan 15, 2023",
    amount: "$49.99",
    status: "Paid",
    description: "Professional Plan - Monthly",
  },
  {
    id: "INV-006",
    date: "Dec 15, 2022",
    amount: "$49.99",
    status: "Paid",
    description: "Professional Plan - Monthly",
  },
]

export function InvoiceHistory() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Invoice History</CardTitle>
        <CardDescription className="text-xs sm:text-sm">View and download your past invoices</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs sm:text-sm">Invoice</TableHead>
                <TableHead className="text-xs sm:text-sm">Date</TableHead>
                <TableHead className="text-xs sm:text-sm">Amount</TableHead>
                <TableHead className="text-xs sm:text-sm">Status</TableHead>
                <TableHead className="text-xs sm:text-sm">Description</TableHead>
                <TableHead className="text-right text-xs sm:text-sm">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium text-xs sm:text-sm">{invoice.id}</TableCell>
                  <TableCell className="text-xs sm:text-sm">{invoice.date}</TableCell>
                  <TableCell className="text-xs sm:text-sm">{invoice.amount}</TableCell>
                  <TableCell>
                    <Badge className="bg-emerald-500 text-xs sm:text-sm">{invoice.status}</Badge>
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm">{invoice.description}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0 min-h-[44px] min-w-[44px]">
                          <span className="sr-only">Open actions</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-xs sm:text-sm">
                          <Eye className="mr-2 h-3 w-3 sm:h-4 sm:w-4" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-xs sm:text-sm">
                          <Download className="mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Download
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
