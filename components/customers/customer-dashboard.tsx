import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

// Mock customers data
const customers = [
  {
    id: "C-001",
    firstName: "John",
    lastName: "Smith",
    company: "Smith Jewelers",
    phone: "555-1234",
    account: "A-1001",
    salesRep: "Alice Johnson",
    referrals: ["Jane Doe", "Bob Lee"],
    conversations: [
      { date: "2024-05-01", summary: "Discussed new order." },
      { date: "2024-05-03", summary: "Follow-up call about delivery." },
    ],
    orders: [
      { id: "INV-001", date: "2024-05-01", amount: 12000, status: "Paid" },
      { id: "M-001", date: "2024-05-01", amount: 12000, status: "Open" },
    ],
  },
  {
    id: "C-002",
    firstName: "Jane",
    lastName: "Doe",
    company: "Doe Diamonds",
    phone: "555-5678",
    account: "A-1002",
    salesRep: "Bob Lee",
    referrals: ["John Smith"],
    conversations: [
      { date: "2024-05-02", summary: "Inquiry about pricing." },
    ],
    orders: [
      { id: "INV-002", date: "2024-05-03", amount: 8000, status: "Unpaid" },
    ],
  },
]

// Helper to normalize phone numbers
function normalizePhone(phone: string) {
  return phone.replace(/[^\d]/g, "").replace(/^1/, ""); // Remove non-digits and leading country code
}

export function CustomerDashboard() {
  const [search, setSearch] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<string>("")

  const normalizedSearch = normalizePhone(search)
  const isPhoneSearch = /\d/.test(search)
  const filtered = customers.filter(c => {
    if (isPhoneSearch && normalizedSearch) {
      return normalizePhone(c.phone).includes(normalizedSearch)
    }
    return (
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.firstName.toLowerCase().includes(search.toLowerCase()) ||
      c.lastName.toLowerCase().includes(search.toLowerCase()) ||
      c.account.toLowerCase().includes(search.toLowerCase())
    )
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Customer Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input placeholder="Search by company, phone, name, or account #..." value={search} onChange={e => setSearch(e.target.value)} className="w-80" />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>First Name</TableHead>
                <TableHead>Last Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Account #</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(c => (
                <TableRow key={c.id}>
                  <TableCell>{c.company}</TableCell>
                  <TableCell>{c.firstName}</TableCell>
                  <TableCell>{c.lastName}</TableCell>
                  <TableCell>{c.phone}</TableCell>
                  <TableCell>{c.account}</TableCell>
                  <TableCell>
                    <Button size="sm" onClick={() => setSelectedCustomer(c.id)}>View</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {selectedCustomer && (() => {
        const c = customers.find(cu => cu.id === selectedCustomer)
        if (!c) return null
        return (
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2 font-semibold text-lg">{c.firstName} {c.lastName} ({c.company})</div>
              <div>Phone: {c.phone}</div>
              <div>Account #: {c.account}</div>
              <div>Assigned Sales Rep: {c.salesRep}</div>
              <div className="mt-2 font-semibold">Orders:</div>
              <Table className="mb-4">
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {c.orders.map(o => (
                    <TableRow key={o.id}>
                      <TableCell>{o.id}</TableCell>
                      <TableCell>{o.date}</TableCell>
                      <TableCell>${o.amount.toLocaleString()}</TableCell>
                      <TableCell>{o.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="font-semibold">Phone Conversations:</div>
              <ul className="mb-4 list-disc ml-6">
                {c.conversations.map((conv, idx) => (
                  <li key={idx}><b>{conv.date}:</b> {conv.summary}</li>
                ))}
              </ul>
              <div className="font-semibold">Referrals:</div>
              <ul className="list-disc ml-6">
                {c.referrals.map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )
      })()}
    </div>
  )
} 
 