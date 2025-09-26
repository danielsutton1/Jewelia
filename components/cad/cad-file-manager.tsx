"use client"

import { useState } from "react"
import { FileBrowser } from "./file-browser"
import { DesignViewer } from "./design-viewer"
import { RevisionHistory } from "./revision-history"
import { WorkOrderLinking } from "./work-order-linking"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { mockCadFiles } from "./mock-data"
import { Eye, History, Link, FileText, Box, Folder, File, Search, Filter, Download, Upload, Plus, Edit, Trash2, Star, Heart, Clock, CheckCircle, AlertCircle, TrendingUp, BarChart3, Users, Calendar, Crown, Sparkles, Gem, Zap, Award, Globe, Briefcase, Database, Warehouse, Diamond, Circle, Square, Hexagon } from "lucide-react"

export type CadFile = {
  id: string
  name: string
  path: string
  type: "folder" | "file"
  fileType?: string
  thumbnail?: string
  dateModified: string
  modifiedBy: string
  checkedOut?: boolean
  checkedOutBy?: string
  versions?: {
    version: number
    date: string
    author: string
    changes: string
    approved?: boolean
    approvedBy?: string
    approvedDate?: string
  }[]
  currentVersion?: number
  linkedWorkOrders?: string[]
  previewUrl?: string
}

export function CadFileManager() {
  const [selectedFile, setSelectedFile] = useState<CadFile | null>(null)
  const [activeTab, setActiveTab] = useState("browser")

  const handleFileSelect = (file: CadFile) => {
    if (file.type === "file") {
      setSelectedFile(file)
      setActiveTab("viewer")
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="col-span-1 lg:col-span-1 relative overflow-hidden bg-white/80 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500">
        <FileBrowser files={mockCadFiles} onFileSelect={handleFileSelect} />
      </Card>

      <div className="col-span-1 lg:col-span-2">
        {selectedFile ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 h-auto p-2 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl shadow-lg border border-white/20">
              <TabsTrigger 
                value="viewer" 
                className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
              >
                <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
                  <Eye className="h-4 w-4 text-white" />
                </div>
                Design Viewer
              </TabsTrigger>
              <TabsTrigger 
                value="revisions" 
                className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
              >
                <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
                  <History className="h-4 w-4 text-white" />
                </div>
                Revision History
              </TabsTrigger>
              <TabsTrigger 
                value="workorders" 
                className="flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-lg border border-transparent hover:border-slate-300 data-[state=active]:border-slate-200"
              >
                <div className="p-1 bg-gradient-to-br from-slate-500 to-slate-600 rounded data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500">
                  <Link className="h-4 w-4 text-white" />
                </div>
                Work Orders
              </TabsTrigger>
            </TabsList>
            <TabsContent value="viewer" className="mt-6">
              <Card className="relative overflow-hidden bg-white/80 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500">
                <DesignViewer file={selectedFile} />
              </Card>
            </TabsContent>
            <TabsContent value="revisions" className="mt-6">
              <Card className="relative overflow-hidden bg-white/80 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500">
                <RevisionHistory file={selectedFile} />
              </Card>
            </TabsContent>
            <TabsContent value="workorders" className="mt-6">
              <Card className="relative overflow-hidden bg-white/80 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500">
                <WorkOrderLinking file={selectedFile} />
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="flex h-[500px] items-center justify-center relative overflow-hidden bg-white/80 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500">
            <div className="text-center text-slate-600 space-y-4">
              <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                <Box className="h-8 w-8 text-slate-500" />
              </div>
              <p className="text-lg font-medium">Select a CAD file to view details</p>
              <p className="text-sm text-slate-500">Choose from the file browser to explore your designs</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
