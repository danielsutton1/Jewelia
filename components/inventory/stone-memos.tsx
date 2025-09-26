"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Plus } from "lucide-react"

// Sample data - replace with actual data fetching
const sampleMemos = [
  {
    id: "1",
    memoNumber: "MEMO-001",
    dealer: "Diamond Source Inc.",
    date: "2024-03-15",
    dueDate: "2024-04-15",
    status: "Active",
    stones: [
      {
        id: "1",
        type: "Diamond",
        shape: "Round",
        carat: "1.5",
        color: "D",
        clarity: "VVS1",
        cut: "Excellent",
        price: 15000,
      },
    ],
    totalValue: 15000,
  },
  // Add more sample items...
]

export function StoneMemos() {
  const [searchQuery, setSearchQuery] = useState("")
  const [memos, setMemos] = useState(sampleMemos)
  const [showForm, setShowForm] = useState(false)
  const [newMemo, setNewMemo] = useState({
    dealer: "",
    dueDate: "",
    stones: [],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Add validation and API call here
    setShowForm(false)
    setNewMemo({
      dealer: "",
      dueDate: "",
      stones: [],
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Memos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memos.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Memos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {memos.filter((memo) => memo.status === "Active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {memos.reduce((acc, memo) => acc + memo.stones.length, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${memos.reduce((acc, memo) => acc + memo.totalValue, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search memos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[300px] rounded-[6px] border-2 border-emerald-600 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
          />
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          New Memo
        </Button>
      </div>

      {showForm && (
        <div className="rounded-lg border p-4 space-y-4">
          <h3 className="text-lg font-semibold">New Stone Memo</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Dealer</label>
                <Input
                  value={newMemo.dealer}
                  onChange={(e) =>
                    setNewMemo({ ...newMemo, dealer: e.target.value })
                  }
                  placeholder="Enter dealer name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Due Date</label>
                <Input
                  type="date"
                  value={newMemo.dueDate}
                  onChange={(e) =>
                    setNewMemo({ ...newMemo, dueDate: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Memo</Button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Memo Number</TableHead>
              <TableHead>Dealer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Stones</TableHead>
              <TableHead>Total Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {memos.map((memo) => (
              <TableRow key={memo.id}>
                <TableCell>{memo.memoNumber}</TableCell>
                <TableCell>{memo.dealer}</TableCell>
                <TableCell>{memo.date}</TableCell>
                <TableCell>{memo.dueDate}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      memo.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {memo.status}
                  </span>
                </TableCell>
                <TableCell>{memo.stones.length}</TableCell>
                <TableCell>${memo.totalValue.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 
 
 