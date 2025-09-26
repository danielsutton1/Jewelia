"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Slider } from "@/components/ui/slider"

export function PartnerAnalyticsFilters() {
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    to: new Date(),
  })

  const [minTransactions, setMinTransactions] = useState([5])

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="partner-search">Partner Search</Label>
              <Input id="partner-search" placeholder="Search by partner name" />
            </div>

            <div>
              <Label htmlFor="partner-category">Partner Category</Label>
              <Select defaultValue="all">
                <SelectTrigger id="partner-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="supplier-metals">Metal Suppliers</SelectItem>
                  <SelectItem value="supplier-stones">Stone Suppliers</SelectItem>
                  <SelectItem value="supplier-findings">Findings Suppliers</SelectItem>
                  <SelectItem value="service-casting">Casting Services</SelectItem>
                  <SelectItem value="service-engraving">Engraving Services</SelectItem>
                  <SelectItem value="service-plating">Plating Services</SelectItem>
                  <SelectItem value="contractor">Contractors</SelectItem>
                  <SelectItem value="shipping">Shipping Partners</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="partner-specialty">Partner Specialty</Label>
              <Select defaultValue="all">
                <SelectTrigger id="partner-specialty">
                  <SelectValue placeholder="Select specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="platinum">Platinum</SelectItem>
                  <SelectItem value="diamonds">Diamonds</SelectItem>
                  <SelectItem value="gemstones">Gemstones</SelectItem>
                  <SelectItem value="pearls">Pearls</SelectItem>
                  <SelectItem value="lost-wax-casting">Lost Wax Casting</SelectItem>
                  <SelectItem value="hand-engraving">Hand Engraving</SelectItem>
                  <SelectItem value="stone-setting">Stone Setting</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Date Range</Label>
              <DatePickerWithRange 
                dateRange={dateRange} 
                onDateRangeChange={(newDateRange) => {
                  if (newDateRange && newDateRange.from && newDateRange.to) {
                    setDateRange({ from: newDateRange.from, to: newDateRange.to })
                  }
                }} 
              />
            </div>

            <div>
              <Label>Minimum Transactions</Label>
              <div className="pt-2">
                <Slider defaultValue={minTransactions} max={50} step={1} onValueChange={setMinTransactions} />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0</span>
                  <span>{minTransactions[0]} transactions</span>
                  <span>50+</span>
                </div>
              </div>
            </div>

            <div>
              <Label>Performance Metrics</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="metric-satisfaction" defaultChecked />
                  <label htmlFor="metric-satisfaction" className="text-sm">
                    Satisfaction
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="metric-delivery" defaultChecked />
                  <label htmlFor="metric-delivery" className="text-sm">
                    Delivery
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="metric-quality" defaultChecked />
                  <label htmlFor="metric-quality" className="text-sm">
                    Quality
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="metric-cost" defaultChecked />
                  <label htmlFor="metric-cost" className="text-sm">
                    Cost
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="metric-response" defaultChecked />
                  <label htmlFor="metric-response" className="text-sm">
                    Response Time
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="metric-communication" defaultChecked />
                  <label htmlFor="metric-communication" className="text-sm">
                    Communication
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Location</Label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="north-america">North America</SelectItem>
                  <SelectItem value="europe">Europe</SelectItem>
                  <SelectItem value="asia">Asia</SelectItem>
                  <SelectItem value="other">Other Regions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Rating Range</Label>
              <div className="flex items-center gap-2 mt-2">
                <Select defaultValue="0">
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="Min" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                  </SelectContent>
                </Select>
                <span>to</span>
                <Select defaultValue="5">
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="Max" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline">Reset</Button>
              <Button>Apply Filters</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
