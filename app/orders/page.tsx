"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Plus, Search, Filter, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200/20 to-emerald-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-200/20 to-teal-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-200/10 to-pink-200/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex flex-col gap-2 p-2 sm:p-3 md:p-4 max-w-7xl mx-auto w-full">
        {/* Enhanced Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"></div>
          <div className="relative p-2 sm:p-3">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0 mb-2">
              <div className="space-y-3 w-full md:w-auto">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg shadow-lg">
                    <ShoppingCart className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 bg-clip-text text-transparent tracking-tight">
                      Orders Management
                    </h1>
                    <p className="text-sm text-slate-600 font-medium">Manage your jewelry orders and track their status</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <Button variant="outline" size="sm" className="h-9 px-3 bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" className="h-9 px-3 bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Link href="/orders/new">
                  <Button className="h-9 px-3 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full text-xs">
                    <Plus className="h-4 w-4 mr-2" />
                    New Order
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Orders Grid */}
        <div className="relative">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"></div>
          <div className="relative p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Sample Order Cards */}
              <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg shadow-lg">
                      <ShoppingCart className="h-4 w-4 text-white" />
                    </div>
                    Order #ORD-001
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-slate-600">Customer: Sarah Johnson</p>
                  <p className="text-sm text-slate-600">Items: 2</p>
                  <p className="text-sm text-slate-600">Total: $2,500.00</p>
                  <p className="text-sm text-emerald-600 font-medium">Status: In Production</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg shadow-lg">
                      <ShoppingCart className="h-4 w-4 text-white" />
                    </div>
                    Order #ORD-002
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-slate-600">Customer: Michael Chen</p>
                  <p className="text-sm text-slate-600">Items: 1</p>
                  <p className="text-sm text-slate-600">Total: $1,800.00</p>
                  <p className="text-sm text-blue-600 font-medium">Status: Pending</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg shadow-lg">
                      <ShoppingCart className="h-4 w-4 text-white" />
                    </div>
                    Order #ORD-003
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-slate-600">Customer: Emily Davis</p>
                  <p className="text-sm text-slate-600">Items: 3</p>
                  <p className="text-sm text-slate-600">Total: $4,200.00</p>
                  <p className="text-sm text-green-600 font-medium">Status: Completed</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Quick Stats - Matching Dashboard Style */}
        <div className="relative">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"></div>
          <div className="relative p-4">
            <div className="w-full overflow-x-auto md:overflow-visible">
              <div className="flex md:grid md:grid-cols-4 gap-3 md:gap-4 min-w-[320px] md:min-w-0 flex-nowrap">
                <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-102 group hover:bg-white/80">
                  <CardHeader className="flex flex-col items-center justify-center space-y-0 pb-0 relative z-10 text-center">
                    <CardTitle className="text-xs font-semibold text-slate-700 group-hover:text-slate-700 mb-1">Total Orders</CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10 text-center pb-2 pt-0">
                    <div className="text-base font-bold text-slate-800 mb-1">12</div>
                    <div className="flex items-center justify-center gap-1">
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-emerald-600">+15.2%</span>
                        <span className="text-slate-600">from last month</span>
                      </div>
                      <TrendingUp className="h-3 w-3 text-emerald-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-xl border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-102 group hover:bg-white/80">
                  <CardHeader className="flex flex-col items-center justify-center space-y-0 pb-0 relative z-10 text-center">
                    <CardTitle className="text-xs font-semibold text-slate-700 group-hover:text-slate-700 mb-1">In Production</CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10 text-center pb-2 pt-0">
                    <div className="text-base font-bold text-slate-800 mb-1">5</div>
                    <div className="flex items-center justify-center gap-1">
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-emerald-600">+8.3%</span>
                        <span className="text-slate-600">from last month</span>
                      </div>
                      <TrendingUp className="h-3 w-3 text-emerald-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="relative overflow-hidden bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-102 group hover:bg-white/80">
                  <CardHeader className="flex flex-col items-center justify-center space-y-0 pb-0 relative z-10 text-center">
                    <CardTitle className="text-xs font-semibold text-slate-700 group-hover:text-slate-700 mb-1">Pending</CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10 text-center pb-2 pt-0">
                    <div className="text-base font-bold text-slate-800 mb-1">3</div>
                    <div className="flex items-center justify-center gap-1">
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-emerald-600">+12.5%</span>
                        <span className="text-slate-600">from last month</span>
                      </div>
                      <TrendingUp className="h-3 w-3 text-emerald-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-102 group hover:bg-white/80">
                  <CardHeader className="flex flex-col items-center justify-center space-y-0 pb-0 relative z-10 text-center">
                    <CardTitle className="text-xs font-semibold text-slate-700 group-hover:text-slate-700 mb-1">Completed</CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10 text-center pb-2 pt-0">
                    <div className="text-base font-bold text-slate-800 mb-1">4</div>
                    <div className="flex items-center justify-center gap-1">
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-emerald-600">+5.2%</span>
                        <span className="text-slate-600">from last month</span>
                      </div>
                      <TrendingUp className="h-3 w-3 text-emerald-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}