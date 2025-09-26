"use client"

import { QRScanner } from "@/components/scanner/qr-scanner"
import { ArrowLeft, Crown, Sparkles, Gem, Shield, Target, Settings, RefreshCw, Zap, Award, Globe, Briefcase, Database, Warehouse, Diamond, Circle, Square, Hexagon, Clock, CheckCircle, AlertCircle, Package, Users, Building, QrCode, Search, Filter, Download, Upload, Plus, Edit, Trash2, Eye, MoreHorizontal, Calendar, Phone, Mail, MapPin, Star, Heart, TrendingUp, DollarSign, ShoppingBag, Camera, Flashlight, Smartphone, Scan, Barcode, Tag, Hash, Key, Lock, Unlock, ScanLine, QrCodeIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ScannerPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/50 relative overflow-hidden">
      {/* Luxury Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200/20 to-emerald-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-200/20 to-teal-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-200/10 to-pink-200/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex flex-col gap-4 sm:gap-6 md:gap-8 p-3 sm:p-4 md:p-6 max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"></div>
          <div className="relative p-4 sm:p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl shadow-lg self-start sm:self-auto">
                    <QrCode className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent tracking-tight">
                      QR Scanner
                    </h1>
                    <p className="text-slate-600 text-sm sm:text-base md:text-lg font-medium">Scan QR codes to quickly track and manage jewelry items</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                    <span>Real-time Scanning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gem className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500" />
                    <span>Instant Asset Tracking</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 sm:gap-3 items-center justify-center sm:justify-end">
                <Button 
                  variant="outline" 
                  size="icon"
                  className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300 min-h-[44px] min-w-[44px]"
                  aria-label="Flashlight"
                  title="Flashlight"
                >
                  <Flashlight className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="icon"
                  className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300 min-h-[44px] min-w-[44px]"
                  aria-label="Switch Camera"
                  title="Switch Camera"
                >
                  <Camera className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => router.back()}
                  className="bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300 min-h-[44px] text-xs sm:text-sm"
                >
                  <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Back</span>
                  <span className="sm:hidden">←</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Main Content */}
        <div className="relative">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"></div>
          <div className="relative p-4 sm:p-6 md:p-8">
            {/* Scanner Interface */}
            <div className="mb-4 sm:mb-6 md:mb-8">
              <Card className="relative overflow-hidden bg-white/80 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500">
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <QRScanner />
                </CardContent>
              </Card>
            </div>

            {/* Instructions and QR Code Types */}
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              {/* Scanner Instructions */}
              <Card className="relative overflow-hidden bg-white/80 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500">
                <CardHeader className="relative z-10 p-3 sm:p-4 md:p-6">
                  <CardTitle className="text-lg sm:text-xl font-semibold text-slate-800 flex items-center gap-2">
                    <ScanLine className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
                    Scanner Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 p-3 sm:p-4 md:p-6">
                  <ul className="space-y-2 sm:space-y-3 list-none">
                    <li className="flex items-center gap-2 sm:gap-3 text-slate-700 text-sm sm:text-base">
                      <div className="p-1 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex-shrink-0">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                      <span>Position the QR code within the scanning area</span>
                    </li>
                    <li className="flex items-center gap-2 sm:gap-3 text-slate-700 text-sm sm:text-base">
                      <div className="p-1 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex-shrink-0">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                      <span>Hold the device steady until the code is recognized</span>
                    </li>
                    <li className="flex items-center gap-2 sm:gap-3 text-slate-700 text-sm sm:text-base">
                      <div className="p-1 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex-shrink-0">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                      <span>Use the flashlight in low-light conditions</span>
                    </li>
                    <li className="flex items-center gap-2 sm:gap-3 text-slate-700 text-sm sm:text-base">
                      <div className="p-1 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex-shrink-0">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                      <span>Switch cameras if needed for better scanning</span>
                    </li>
                    <li className="flex items-center gap-2 sm:gap-3 text-slate-700 text-sm sm:text-base">
                      <div className="p-1 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex-shrink-0">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                      <span>Enter codes manually if scanning is difficult</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* QR Code Types */}
              <Card className="relative overflow-hidden bg-white/80 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500">
                <CardHeader className="relative z-10 p-3 sm:p-4 md:p-6">
                  <CardTitle className="text-lg sm:text-xl font-semibold text-slate-800 flex items-center gap-2">
                    <QrCodeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
                    QR Code Types
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 p-3 sm:p-4 md:p-6">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Package className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 text-sm sm:text-base">Product QR Codes</h3>
                        <p className="text-xs sm:text-sm text-slate-600">
                          Scan to view product details, history, and current status
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 text-sm sm:text-base">Customer QR Codes</h3>
                        <p className="text-xs sm:text-sm text-slate-600">
                          Scan to quickly access customer profiles and purchase history
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/50">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                        <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 text-sm sm:text-base">Order QR Codes</h3>
                        <p className="text-xs sm:text-sm text-slate-600">
                          Scan to view order details and update order status
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200/50">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Package className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 text-sm sm:text-base">Asset QR Codes</h3>
                        <p className="text-xs sm:text-sm text-slate-600">
                          Scan to track inventory assets and their locations
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
