"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, ArrowRightLeft, FileWarning } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Asset } from "@/types/inventory"
import { useState, useMemo } from "react"

interface AssetLocationTableProps {
  assets: Asset[]
  onTransfer?: (assetId: string) => void
  onReportMissing?: (assetId: string) => void
}

const statusColors: { [key: string]: string } = {
  available: "bg-green-100 text-green-800",
  reserved: "bg-blue-100 text-blue-800",
  in_production: "bg-purple-100 text-purple-800",
  with_partner: "bg-amber-100 text-amber-800",
  quality_control: "bg-indigo-100 text-indigo-800",
  awaiting_shipment: "bg-pink-100 text-pink-800",
  shipped: "bg-gray-500 text-white",
  consignment: "bg-orange-100 text-orange-800",
  repair: "bg-teal-100 text-teal-800",
  missing: "bg-red-100 text-red-800",
  delayed: "bg-yellow-100 text-yellow-800",
  urgent: "bg-red-500 text-white",
}

export function AssetLocationTable({ assets, onTransfer, onReportMissing }: AssetLocationTableProps) {
  // --- FILTER STATE ---
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [location, setLocation] = useState("all");
  const [assigned, setAssigned] = useState("all");
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");

  // --- FILTERED DATA ---
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesSearch =
        asset.sku.toLowerCase().includes(search.toLowerCase()) ||
        asset.name.toLowerCase().includes(search.toLowerCase()) ||
        asset.currentLocation.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === "all" || asset.status === status;
      const matchesType = type === "all" || asset.type === type;
      const matchesLocation = location === "all" || asset.currentLocation === location;
      const assignedTo = asset.assignedTo || asset.checkedOutBy || "—";
      const matchesAssigned = assigned === "all" || assignedTo === assigned;
      const matchesMinValue = !minValue || asset.value >= Number(minValue);
      const matchesMaxValue = !maxValue || asset.value <= Number(maxValue);
      return (
        matchesSearch && matchesStatus && matchesType && matchesLocation && matchesAssigned && matchesMinValue && matchesMaxValue
      );
    });
  }, [assets, search, status, type, location, assigned, minValue, maxValue]);

  // --- SUMMARY DATA ---
  const totalValue = filteredAssets.reduce((sum, a) => sum + a.value, 0);
  const statusCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    filteredAssets.forEach(a => {
      counts[a.status] = (counts[a.status] || 0) + 1;
    });
    return counts;
  }, [filteredAssets]);
  const locationCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    filteredAssets.forEach(a => {
      counts[a.currentLocation] = (counts[a.currentLocation] || 0) + 1;
    });
    return counts;
  }, [filteredAssets]);
  const assignedCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    filteredAssets.forEach(a => {
      const key = a.assignedTo || a.checkedOutBy || "—";
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [filteredAssets]);
  const topLocations = Object.entries(locationCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const topAssigned = Object.entries(assignedCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);

  // --- UNIQUE VALUES FOR FILTERS ---
  const uniqueStatuses = Array.from(new Set(assets.map(a => a.status)));
  const uniqueTypes = Array.from(new Set(assets.map(a => a.type)));
  const uniqueLocations = Array.from(new Set(assets.map(a => a.currentLocation)));
  const uniqueAssigned = Array.from(new Set(assets.map(a => a.assignedTo || a.checkedOutBy).filter(Boolean)));

  // --- FORMAT CURRENCY ---
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Asset Locations</CardTitle>
        <CardDescription>
          A detailed list of all tracked assets and their current status.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* --- SUMMARY CARDS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded shadow p-4 flex flex-col items-center">
            <div className="text-xs text-gray-500 mb-1">Total Assets</div>
            <div className="text-2xl font-bold text-emerald-700">{filteredAssets.length}</div>
          </div>
          <div className="bg-white rounded shadow p-4 flex flex-col items-center">
            <div className="text-xs text-gray-500 mb-1">Total Value</div>
            <div className="text-2xl font-bold text-amber-700">{formatCurrency(totalValue)}</div>
          </div>
          <div className="bg-white rounded shadow p-4 flex flex-col items-center">
            <div className="text-xs text-gray-500 mb-1">Top Locations</div>
            <div className="flex flex-col items-center">
              {topLocations.map(([loc, count]) => (
                <div key={loc} className="text-sm text-gray-700">{loc}: <span className="font-bold">{count}</span></div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded shadow p-4 flex flex-col items-center">
            <div className="text-xs text-gray-500 mb-1">Top People/Partners</div>
            <div className="flex flex-col items-center">
              {topAssigned.map(([person, count]) => (
                <div key={person} className="text-sm text-gray-700">{person}: <span className="font-bold">{count}</span></div>
              ))}
            </div>
          </div>
        </div>
        {/* --- STATUS COUNTS --- */}
        <div className="flex flex-wrap gap-2 mb-4">
          {uniqueStatuses.map(s => (
            <div key={s} className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border bg-gray-50">
              <span className={statusColors[s] || "bg-gray-100 text-gray-800"} style={{padding: '2px 8px', borderRadius: '8px'}}>{s.replace(/_/g, ' ')}</span>
              <span>{statusCounts[s] || 0}</span>
            </div>
          ))}
        </div>
        {/* --- FILTERS --- */}
        <div className="flex flex-wrap gap-2 mb-6 items-center">
          <input
            type="text"
            className="border rounded px-3 py-1.5 text-sm w-48"
            placeholder="Search SKU, name, location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="border rounded px-2 py-1 text-sm" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            {uniqueStatuses.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
          <select className="border rounded px-2 py-1 text-sm" value={type} onChange={e => setType(e.target.value)}>
            <option value="all">All Types</option>
            {uniqueTypes.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
          </select>
          <select className="border rounded px-2 py-1 text-sm" value={location} onChange={e => setLocation(e.target.value)}>
            <option value="all">All Locations</option>
            {uniqueLocations.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <select className="border rounded px-2 py-1 text-sm" value={assigned} onChange={e => setAssigned(e.target.value)}>
            <option value="all">All People/Partners</option>
            {uniqueAssigned.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <input
            type="number"
            className="border rounded px-2 py-1 text-sm w-24"
            placeholder="Min $"
            value={minValue}
            onChange={e => setMinValue(e.target.value)}
          />
          <input
            type="number"
            className="border rounded px-2 py-1 text-sm w-24"
            placeholder="Max $"
            value={maxValue}
            onChange={e => setMaxValue(e.target.value)}
          />
        </div>
        {/* --- TABLE --- */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Asset Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Current Location</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned/With</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.map((asset) => {
                const assignedTo = asset.assignedTo || asset.checkedOutBy || "—";
                return (
                  <TableRow key={asset.sku}>
                    <TableCell className="font-mono text-xs">{asset.sku}</TableCell>
                    <TableCell className="font-medium">{asset.name}</TableCell>
                    <TableCell>{asset.type.replace(/_/g, " ")}</TableCell>
                    <TableCell>{asset.currentLocation}</TableCell>
                    <TableCell>{formatCurrency(asset.value)}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[asset.status] || "bg-gray-100 text-gray-800"}>
                        {asset.status.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>{assignedTo}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onTransfer?.(asset.id)}>
                            <ArrowRightLeft className="mr-2 h-4 w-4" />
                            Transfer Asset
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onReportMissing?.(asset.id)}>
                            <FileWarning className="mr-2 h-4 w-4" />
                            Report Missing
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
} 
 