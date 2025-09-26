"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Bar } from "recharts"
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid } from "recharts"

// Mock memos data
const initialMemos = [
  {
    id: "M-001",
    customer: "John Smith",
    date: "2024-05-01",
    amount: 12000,
    status: "Open",
    items: [
      { sku: "FP-001", name: "Diamond Ring", qty: 1, price: 12000, img: "/ring.jpg" },
    ],
    balance: 12000,
  },
  {
    id: "M-002",
    customer: "Jane Doe",
    date: "2024-05-03",
    amount: 8000,
    status: "Returned",
    items: [
      { sku: "FP-002", name: "Gold Necklace", qty: 1, price: 8000, img: "/necklace.jpg" },
    ],
    balance: 0,
  },
]

// Mock invoices data
const initialInvoices = [
  {
    id: "INV-001",
    customer: "John Smith",
    date: "2024-05-01",
    status: "Paid",
    total: 12000,
    items: [
      { sku: "FP-001", name: "Diamond Ring", qty: 1, price: 12000, img: "/ring.jpg" },
    ],
  },
  {
    id: "INV-002",
    customer: "Jane Doe",
    date: "2024-05-03",
    status: "Unpaid",
    total: 8000,
    items: [
      { sku: "FP-002", name: "Gold Necklace", qty: 1, price: 8000, img: "/necklace.jpg" },
    ],
  },
]

// Mock data for Orders & Balances tab
const backOrders = [
  { id: "BO-001", customer: "John Smith", style: "RNG-100", vendor: "Vendor A", qty: 2, status: "Open" },
  { id: "BO-002", customer: "Jane Doe", style: "NCK-200", vendor: "Vendor B", qty: 1, status: "Backordered" },
]
const customers = [
  { id: "C-001", name: "John Smith", email: "john@example.com", phone: "555-1234", address: "123 Main St", profile: "VIP", purchaseHistory: [
    { order: "INV-001", date: "2024-05-01", amount: 12000 },
    { order: "M-001", date: "2024-05-01", amount: 12000 },
  ] },
  { id: "C-002", name: "Jane Doe", email: "jane@example.com", phone: "555-5678", address: "456 Oak Ave", profile: "Regular", purchaseHistory: [
    { order: "INV-002", date: "2024-05-03", amount: 8000 },
    { order: "M-002", date: "2024-05-03", amount: 8000 },
  ] },
]
const openOrders = [
  { id: "INV-001", customer: "John Smith", type: "Invoice", balance: 12000, status: "Open" },
  { id: "M-002", customer: "Jane Doe", type: "Memo", balance: 0, status: "Returned" },
]
const payments = [
  { id: "P-001", customer: "John Smith", date: "2024-05-05", amount: 5000, method: "Credit Card", distribution: "Invoice INV-001" },
  { id: "P-002", customer: "Jane Doe", date: "2024-05-06", amount: 8000, method: "Wire", distribution: "Memo M-002" },
]

// Mock data for Reports tab
const salesData = [
  { date: "2024-05-01", sales: 12000, profit: 4000 },
  { date: "2024-05-02", sales: 8000, profit: 2500 },
  { date: "2024-05-03", sales: 15000, profit: 6000 },
  { date: "2024-05-04", sales: 10000, profit: 3500 },
  { date: "2024-05-05", sales: 18000, profit: 7000 },
]
const commissionData = [
  { salesperson: "Alice", sales: 20000, commission: 2000 },
  { salesperson: "Bob", sales: 15000, commission: 1500 },
  { salesperson: "Carol", sales: 10000, commission: 1000 },
]
const metalPrices = [
  { date: "2024-05-01", platinum: 950, gold: 2300, silver: 28 },
  { date: "2024-05-02", platinum: 960, gold: 2310, silver: 27.8 },
  { date: "2024-05-03", platinum: 940, gold: 2290, silver: 28.2 },
  { date: "2024-05-04", platinum: 955, gold: 2320, silver: 28.5 },
  { date: "2024-05-05", platinum: 970, gold: 2330, silver: 29 },
]

export function AccountsReceivableDashboard() {
  const [activeTab, setActiveTab] = useState("memos")
  const [memos, setMemos] = useState(initialMemos)
  const [reverseDialog, setReverseDialog] = useState<{ open: boolean; memoId: string | null }>({ open: false, memoId: null })
  const [search, setSearch] = useState("")

  // Invoicing tab state
  const [invoices, setInvoices] = useState(initialInvoices)
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [voidDialog, setVoidDialog] = useState<{ open: boolean; invoiceId: string | null }>({ open: false, invoiceId: null })
  const [printEnvelope, setPrintEnvelope] = useState<any | null>(null)

  // Filter memos for balance report
  const filteredMemos = memos.filter(memo =>
    memo.customer.toLowerCase().includes(search.toLowerCase()) ||
    memo.id.toLowerCase().includes(search.toLowerCase())
  )

  const handleReverse = (memoId: string) => {
    setReverseDialog({ open: true, memoId })
  }

  const confirmReverse = () => {
    if (!reverseDialog.memoId) return
    setMemos(memos =>
      memos.map(memo =>
        memo.id === reverseDialog.memoId
          ? { ...memo, status: "Returned", balance: 0 }
          : memo
      )
    )
    setReverseDialog({ open: false, memoId: null })
  }

  const [backOrderFilter, setBackOrderFilter] = useState({ customer: "", style: "", vendor: "" })
  const [selectedCustomer, setSelectedCustomer] = useState<string>("")

  return (
    <div className="space-y-6">
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="memos">Memos & Returns</TabsTrigger>
            <TabsTrigger value="invoicing">Invoicing</TabsTrigger>
            <TabsTrigger value="orders">Orders & Balances</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="memos" className="p-6 space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">Open Memos</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Memo #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memos.map(memo => (
                    <TableRow key={memo.id}>
                      <TableCell>{memo.id}</TableCell>
                      <TableCell>{memo.customer}</TableCell>
                      <TableCell>{memo.date}</TableCell>
                      <TableCell>${memo.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${memo.status === "Open" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>{memo.status}</span>
                      </TableCell>
                      <TableCell>
                        {memo.status === "Open" && (
                          <Button size="sm" onClick={() => handleReverse(memo.id)}>
                            Reverse Memo
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Dialog open={reverseDialog.open} onOpenChange={open => setReverseDialog(d => ({ ...d, open }))}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reverse Memo</DialogTitle>
                </DialogHeader>
                <div>Are you sure you want to reverse memo <b>{reverseDialog.memoId}</b>?</div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setReverseDialog({ open: false, memoId: null })}>Cancel</Button>
                  <Button onClick={confirmReverse}>Confirm</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <div>
              <h3 className="text-lg font-semibold mb-2">Memo Balance Report</h3>
              <Input
                placeholder="Search by customer or memo"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-80 border-2 border-emerald-600 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 rounded-[6px]"
              />
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Memo #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMemos.map(memo => (
                    <TableRow key={memo.id}>
                      <TableCell>{memo.id}</TableCell>
                      <TableCell>{memo.customer}</TableCell>
                      <TableCell>{memo.date}</TableCell>
                      <TableCell>{memo.status}</TableCell>
                      <TableCell>${memo.balance.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          <TabsContent value="invoicing" className="p-6 space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">Invoices</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map(inv => (
                    <TableRow key={inv.id}>
                      <TableCell>{inv.id}</TableCell>
                      <TableCell>{inv.customer}</TableCell>
                      <TableCell>{inv.date}</TableCell>
                      <TableCell>{inv.status}</TableCell>
                      <TableCell>${inv.total.toLocaleString()}</TableCell>
                      <TableCell className="space-x-2">
                        <Button size="sm" onClick={() => { setSelectedInvoice(inv); setShowInvoiceModal(true); }} disabled={inv.status === "Voided"}>
                          View Details
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => setVoidDialog({ open: true, invoiceId: inv.id })} disabled={inv.status === "Voided"}>
                          Void
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Dialog open={voidDialog.open} onOpenChange={open => setVoidDialog(d => ({ ...d, open }))}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Void Invoice</DialogTitle>
                </DialogHeader>
                <div>Are you sure you want to void invoice <b>{voidDialog.invoiceId}</b>? This action cannot be undone.</div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setVoidDialog({ open: false, invoiceId: null })}>Cancel</Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (!voidDialog.invoiceId) return
                      setInvoices(invoices =>
                        invoices.map(inv =>
                          inv.id === voidDialog.invoiceId ? { ...inv, status: "Voided" } : inv
                        )
                      )
                      setVoidDialog({ open: false, invoiceId: null })
                    }}
                  >
                    Confirm
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={showInvoiceModal} onOpenChange={setShowInvoiceModal}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Invoice Details</DialogTitle>
                </DialogHeader>
                {selectedInvoice && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold">Invoice #: {selectedInvoice.id}</div>
                        <div>Customer: {selectedInvoice.customer}</div>
                        <div>Date: {selectedInvoice.date}</div>
                        <div>Status: {selectedInvoice.status}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            // Print logic: open a new window with printable content
                            const printWindow = window.open('', '_blank')
                            if (printWindow) {
                              printWindow.document.write('<html><head><title>Print Invoice</title></head><body>')
                              printWindow.document.write(`<h2>Invoice #: ${selectedInvoice.id}</h2>`)
                              printWindow.document.write(`<div>Customer: ${selectedInvoice.customer}</div>`)
                              printWindow.document.write(`<div>Date: ${selectedInvoice.date}</div>`)
                              printWindow.document.write('<table border="1" style="width:100%;margin-top:1em;"><tr><th>SKU</th><th>Name</th><th>Qty</th><th>Price</th><th>Image</th></tr>')
                              selectedInvoice.items.forEach((item: any) => {
                                printWindow.document.write(`<tr><td>${item.sku}</td><td>${item.name}</td><td>${item.qty}</td><td>$${item.price.toLocaleString()}</td><td><img src='${item.img}' alt='${item.name}' style='height:40px;'/></td></tr>`)
                              })
                              printWindow.document.write('</table>')
                              printWindow.document.write(`<div style='margin-top:1em;font-weight:bold;'>Total: $${selectedInvoice.total.toLocaleString()}</div>`)
                              printWindow.document.write('</body></html>')
                              printWindow.document.close()
                              printWindow.print()
                            }
                          }}
                        >
                          Print
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => setPrintEnvelope(selectedInvoice)}
                        >
                          Print Task Envelope
                        </Button>
                      </div>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>SKU</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Image</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedInvoice.items.map((item: any) => (
                          <TableRow key={item.sku}>
                            <TableCell>{item.sku}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.qty}</TableCell>
                            <TableCell>${item.price.toLocaleString()}</TableCell>
                            <TableCell>
                              <img src={item.img} alt={item.name} className="h-10 w-10 object-cover rounded" />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="text-right font-bold">Total: ${selectedInvoice.total.toLocaleString()}</div>
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowInvoiceModal(false)}>Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {/* Print Task Envelope Window */}
            {printEnvelope && (
              (() => {
                const win = window.open('', '_blank')
                if (win) {
                  win.document.write('<html><head><title>Task Envelope</title></head><body>')
                  win.document.write(`<h2>Task Envelope for Invoice #: ${printEnvelope.id}</h2>`)
                  win.document.write(`<div>Customer: ${printEnvelope.customer}</div>`)
                  win.document.write(`<div>Date: ${printEnvelope.date}</div>`)
                  win.document.write('<table border="1" style="width:100%;margin-top:1em;"><tr><th>SKU</th><th>Name</th><th>Qty</th></tr>')
                  printEnvelope.items.forEach((item: any) => {
                    win.document.write(`<tr><td>${item.sku}</td><td>${item.name}</td><td>${item.qty}</td></tr>`)
                  })
                  win.document.write('</table>')
                  win.document.write('</body></html>')
                  win.document.close()
                  win.print()
                }
                setTimeout(() => setPrintEnvelope(null), 500)
                return null
              })()
            )}
          </TabsContent>
          <TabsContent value="orders" className="p-6 space-y-8">
            {/* Back Order Reports */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Back Order Reports</h3>
              <div className="flex gap-2 mb-2">
                <Input placeholder="Customer" value={backOrderFilter.customer} onChange={e => setBackOrderFilter(f => ({ ...f, customer: e.target.value }))} className="w-40 border-2 border-emerald-600 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 rounded-[6px]" />
                <Input placeholder="Style Code" value={backOrderFilter.style} onChange={e => setBackOrderFilter(f => ({ ...f, style: e.target.value }))} className="w-40 border-2 border-emerald-600 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 rounded-[6px]" />
                <Input placeholder="Vendor" value={backOrderFilter.vendor} onChange={e => setBackOrderFilter(f => ({ ...f, vendor: e.target.value }))} className="w-40 border-2 border-emerald-600 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 rounded-[6px]" />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Back Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Style</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backOrders.filter(bo =>
                    (!backOrderFilter.customer || bo.customer.toLowerCase().includes(backOrderFilter.customer.toLowerCase())) &&
                    (!backOrderFilter.style || bo.style.toLowerCase().includes(backOrderFilter.style.toLowerCase())) &&
                    (!backOrderFilter.vendor || bo.vendor.toLowerCase().includes(backOrderFilter.vendor.toLowerCase()))
                  ).map(bo => (
                    <TableRow key={bo.id}>
                      <TableCell>{bo.id}</TableCell>
                      <TableCell>{bo.customer}</TableCell>
                      <TableCell>{bo.style}</TableCell>
                      <TableCell>{bo.vendor}</TableCell>
                      <TableCell>{bo.qty}</TableCell>
                      <TableCell>{bo.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* Customer Purchase History & Profile */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Customer Purchase History & Profile</h3>
              <div className="flex gap-2 mb-2">
                <select value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)} className="border rounded px-2 py-1">
                  <option value="">Select Customer</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              {selectedCustomer && (
                (() => {
                  const customer = customers.find(c => c.id === selectedCustomer)
                  if (!customer) return null
                  return (
                    <div className="border rounded p-4 mb-2">
                      <div className="font-semibold">{customer.name} ({customer.profile})</div>
                      <div>Email: {customer.email}</div>
                      <div>Phone: {customer.phone}</div>
                      <div>Address: {customer.address}</div>
                      <div className="mt-2 font-semibold">Purchase History:</div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {customer.purchaseHistory.map(ph => (
                            <TableRow key={ph.order}>
                              <TableCell>{ph.order}</TableCell>
                              <TableCell>{ph.date}</TableCell>
                              <TableCell>${ph.amount.toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )
                })()
              )}
            </div>
            {/* Open Orders & Memo Balances */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Open Orders & Memo Balances</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {openOrders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>{order.type}</TableCell>
                      <TableCell>{order.status}</TableCell>
                      <TableCell>${order.balance.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* Customer Payments & Distribution */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Customer Payments & Distribution</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Distribution</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map(payment => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.id}</TableCell>
                      <TableCell>{payment.customer}</TableCell>
                      <TableCell>{payment.date}</TableCell>
                      <TableCell>${payment.amount.toLocaleString()}</TableCell>
                      <TableCell>{payment.method}</TableCell>
                      <TableCell>{payment.distribution}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          <TabsContent value="reports" className="p-6 space-y-8">
            {/* Sales & Profitability Reports */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Sales & Profitability Reports</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="#6366f1" name="Sales" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="profit" fill="#10b981" name="Profit" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Commission Split */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Commission Split</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Salesperson</TableHead>
                    <TableHead>Sales</TableHead>
                    <TableHead>Commission</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissionData.map(row => (
                    <TableRow key={row.salesperson}>
                      <TableCell>{row.salesperson}</TableCell>
                      <TableCell>${row.sales.toLocaleString()}</TableCell>
                      <TableCell>${row.commission.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* Precious Metal Market Database */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Precious Metal Market Database</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={metalPrices} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="platinum" stroke="#6366f1" name="Platinum" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="gold" stroke="#f59e42" name="Gold" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="silver" stroke="#a3a3a3" name="Silver" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
} 