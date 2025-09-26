"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Flashlight,
  FlashlightOff,
  SwitchCamera,
  Keyboard,
  Settings,
  Check,
  X,
  ChevronUp,
  Maximize,
  Minimize,
  History,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useMobile } from "@/hooks/use-mobile"
import { ScanHistoryPanel, type ScanHistoryItem } from "./scan-history-panel"

// Sample jewelry images for history items
const jewelryImages = [
  "/gold-necklace.png",
  "/silver-earrings.png",
  "/sapphire-pendant.png",
  "/emerald-bracelet.png",
  "/sparkling-diamond-ring.png",
]

// Sample jewelry types
const jewelryTypes = ["Necklace", "Earrings", "Pendant", "Bracelet", "Ring", "Watch"]

// Sample jewelry categories
const jewelryCategories = ["Gold", "Silver", "Diamond", "Gemstone", "Pearl", "Platinum"]

type ScanResult = {
  id: string
  timestamp: Date
  type: string
}

export function QRScanner() {
  const router = useRouter()
  const isMobile = useMobile()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])
  const [activeCameraIndex, setActiveCameraIndex] = useState(0)
  const [flashlightOn, setFlashlightOn] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [scanHistory, setHistory] = useState<ScanHistoryItem[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [historyPanelOpen, setHistoryPanelOpen] = useState(false)
  const [manualEntryOpen, setManualEntryOpen] = useState(false)
  const [manualCode, setManualCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const scannerRef = useRef<HTMLDivElement>(null)

  // Generate a random jewelry item for the scan history
  const generateRandomJewelryItem = (id: string): ScanHistoryItem => {
    const type = jewelryTypes[Math.floor(Math.random() * jewelryTypes.length)]
    const category = jewelryCategories[Math.floor(Math.random() * jewelryCategories.length)]
    const imageIndex = Math.floor(Math.random() * jewelryImages.length)

    return {
      id,
      name: `${category} ${type} - ${id.split("-")[1]}`,
      sku: `JWL-${id.split("-")[1]}`,
      timestamp: new Date(),
      imageUrl: jewelryImages[imageIndex],
      type,
      category,
    }
  }

  // Initialize with some sample history items
  useEffect(() => {
    const sampleHistory: ScanHistoryItem[] = []

    // Create sample history items with timestamps spread over the last week
    for (let i = 0; i < 10; i++) {
      const id = `JWL-${1000 + i}`
      const item = generateRandomJewelryItem(id)

      // Adjust timestamp to spread over the last week
      const hoursAgo = Math.floor(Math.random() * 168) // Up to 7 days (168 hours)
      item.timestamp = new Date(Date.now() - hoursAgo * 60 * 60 * 1000)

      sampleHistory.push(item)
    }

    // Sort by timestamp, newest first
    sampleHistory.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    setHistory(sampleHistory)
  }, [])

  // Mock function to simulate QR code detection
  const mockDetectQRCode = () => {
    const shouldDetect = Math.random() > 0.7
    if (shouldDetect) {
      return {
        data: `JWL-${Math.floor(Math.random() * 10000)}`,
        type: "product",
      }
    }
    return null
  }

  // Initialize camera
  useEffect(() => {
    const initCamera = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter((device) => device.kind === "videoinput")
        setCameras(videoDevices)

        if (videoDevices.length > 0) {
          startCamera()
        }
      } catch (err) {
        console.error("Error accessing camera:", err)
        setError("Camera access denied. Please check your permissions.")
      }
    }

    initCamera()

    return () => {
      // Clean up video stream when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  // Start camera with selected device
  const startCamera = async () => {
    try {
      setError(null)
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
      }

      const constraints = {
        video: {
          deviceId: cameras.length > 0 ? { exact: cameras[activeCameraIndex].deviceId } : undefined,
          facingMode: cameras.length === 0 ? "environment" : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setScanning(true)
        startScanning()
      }

      // Check if flashlight is available
      const track = stream.getVideoTracks()[0]
      const capabilities = track.getCapabilities()
      if (capabilities.torch) {
        // Flashlight is available
        if (flashlightOn) {
          await track.applyConstraints({ advanced: [{ torch: true }] as any })
        }
      } else {
        // Flashlight not available
        setFlashlightOn(false)
      }
    } catch (err) {
      console.error("Error starting camera:", err)
      setError("Failed to start camera. Please check your permissions.")
      setScanning(false)
    }
  }

  // Toggle flashlight
  const toggleFlashlight = async () => {
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        const track = stream.getVideoTracks()[0]

        if (track) {
          const capabilities = track.getCapabilities()
          if (capabilities.torch) {
            const newState = !flashlightOn
            await track.applyConstraints({ advanced: [{ torch: newState }] as any })
            setFlashlightOn(newState)
          }
        }
      }
    } catch (err) {
      console.error("Error toggling flashlight:", err)
    }
  }

  // Switch camera
  const switchCamera = () => {
    if (cameras.length > 1) {
      const newIndex = (activeCameraIndex + 1) % cameras.length
      setActiveCameraIndex(newIndex)
      startCamera()
    }
  }

  // Start scanning for QR codes
  const startScanning = () => {
    if (!scanning) return

    const scanInterval = setInterval(() => {
      if (!scanning) {
        clearInterval(scanInterval)
        return
      }

      // In a real app, you would use a library like jsQR to detect QR codes
      // For this demo, we'll use a mock function
      const result = mockDetectQRCode()

      if (result) {
        handleScanSuccess(result.data, result.type)
        clearInterval(scanInterval)
      }
    }, 500)

    return () => clearInterval(scanInterval)
  }

  // Handle successful scan
  const handleScanSuccess = (data: string, type: string) => {
    setScanning(false)
    const result = {
      id: data,
      timestamp: new Date(),
      type,
    }
    setScanResult(result)

    // Create a new history item
    const newHistoryItem = generateRandomJewelryItem(data)
    setHistory((prev) => [newHistoryItem, ...prev])

    // Restart scanning after 3 seconds
    setTimeout(() => {
      setScanResult(null)
      setScanning(true)
      startScanning()
    }, 3000)
  }

  // Handle manual code entry
  const handleManualEntry = () => {
    if (manualCode.trim()) {
      handleScanSuccess(manualCode, "manual")
      setManualEntryOpen(false)
      setManualCode("")
    }
  }

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      scannerRef.current?.requestFullscreen()
      setFullscreen(true)
    } else {
      document.exitFullscreen()
      setFullscreen(false)
    }
  }

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  // Handle history panel actions
  const handleClearHistory = () => {
    setHistory([])
  }

  const handleViewItem = (id: string) => {
    router.push(`/dashboard/products/${id}`)
  }

  const handleEditItem = (id: string) => {
    router.push(`/dashboard/products/${id}/edit`)
  }

  const handleDeleteItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div
      ref={scannerRef}
      className={cn(
        "flex flex-col items-center justify-center bg-black/90 relative overflow-hidden",
        isMobile ? "w-full h-full" : "rounded-lg w-full max-w-3xl mx-auto",
        fullscreen && "fixed inset-0 z-50",
      )}
    >
      {/* Camera View */}
      <div className={cn("relative overflow-hidden bg-black", isMobile ? "w-full h-full" : "w-[640px] h-[480px]")}>
        <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />

        {/* Scanning Overlay */}
        <div className="absolute inset-0 bg-black/50">
          {/* Scanning Area */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-white/20">
            {/* Animated Corner Guides */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary animate-pulse" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary animate-pulse" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary animate-pulse" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary animate-pulse" />

            {/* Scanning Line Animation */}
            <div className="absolute top-0 left-0 w-full h-1 bg-primary/70 animate-scanline" />
          </div>
        </div>

        {/* Success Animation */}
        {scanResult && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
            <div className="bg-white rounded-lg p-6 max-w-xs w-full text-center animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Scan Successful</h3>
              <p className="text-gray-600 mb-4">Item ID: {scanResult.id}</p>
              <Button onClick={() => setScanResult(null)}>Continue Scanning</Button>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
            <div className="bg-white rounded-lg p-6 max-w-xs w-full text-center animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Error</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => setError(null)}>Retry</Button>
            </div>
          </div>
        )}

        {/* Mobile Scan History (Swipe Up) */}
        {isMobile && (
          <div
            className={cn(
              "absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl transition-transform duration-300 ease-in-out",
              showHistory ? "translate-y-0" : "translate-y-[calc(100%-40px)]",
            )}
            style={{ height: "calc(70vh)" }}
          >
            <div
              className="h-10 flex items-center justify-center cursor-pointer"
              onClick={() => setShowHistory(!showHistory)}
            >
              <div className="w-12 h-1 bg-gray-300 rounded-full mb-1" />
              <ChevronUp className={cn("w-5 h-5 text-gray-500 transition-transform", showHistory && "rotate-180")} />
            </div>
            <div className="p-4 overflow-y-auto" style={{ height: "calc(70vh - 40px)" }}>
              <h3 className="text-lg font-bold mb-4">Scan History</h3>
              {scanHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No scan history yet</p>
              ) : (
                <div className="space-y-3">
                  {scanHistory.slice(0, 10).map((item, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-md bg-muted overflow-hidden">
                          <img
                            src={item.imageUrl || "/placeholder.svg"}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/products/${item.id}`)}>
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div
        className={cn(
          "flex items-center justify-center gap-4 bg-black p-4 w-full",
          isMobile && "absolute bottom-12 left-0 right-0 bg-transparent",
        )}
      >
        <Button
          variant={isMobile ? "outline" : "secondary"}
          size={isMobile ? "icon" : "default"}
          className={isMobile ? "rounded-full bg-black/50 backdrop-blur-sm border-white/20" : ""}
          onClick={toggleFlashlight}
        >
          {isMobile ? (
            flashlightOn ? (
              <FlashlightOff className="h-5 w-5 text-white" />
            ) : (
              <Flashlight className="h-5 w-5 text-white" />
            )
          ) : (
            <>
              {flashlightOn ? <FlashlightOff className="h-5 w-5 mr-2" /> : <Flashlight className="h-5 w-5 mr-2" />}
              {flashlightOn ? "Turn Off Flashlight" : "Turn On Flashlight"}
            </>
          )}
        </Button>

        {cameras.length > 1 && (
          <Button
            variant={isMobile ? "outline" : "secondary"}
            size={isMobile ? "icon" : "default"}
            className={isMobile ? "rounded-full bg-black/50 backdrop-blur-sm border-white/20" : ""}
            onClick={switchCamera}
          >
            {isMobile ? (
              <SwitchCamera className="h-5 w-5 text-white" />
            ) : (
              <>
                <SwitchCamera className="h-5 w-5 mr-2" />
                Switch Camera
              </>
            )}
          </Button>
        )}

        <Button
          variant={isMobile ? "outline" : "secondary"}
          size={isMobile ? "icon" : "default"}
          className={isMobile ? "rounded-full bg-black/50 backdrop-blur-sm border-white/20" : ""}
          onClick={() => setManualEntryOpen(true)}
        >
          {isMobile ? (
            <Keyboard className="h-5 w-5 text-white" />
          ) : (
            <>
              <Keyboard className="h-5 w-5 mr-2" />
              Manual Entry
            </>
          )}
        </Button>

        {!isMobile && (
          <Button variant="secondary" onClick={() => setHistoryPanelOpen(true)}>
            <History className="h-5 w-5 mr-2" />
            History
          </Button>
        )}

        {!isMobile && (
          <Button variant="secondary" onClick={toggleFullscreen}>
            {fullscreen ? (
              <>
                <Minimize className="h-5 w-5 mr-2" />
                Exit Fullscreen
              </>
            ) : (
              <>
                <Maximize className="h-5 w-5 mr-2" />
                Fullscreen
              </>
            )}
          </Button>
        )}

        <Button
          variant={isMobile ? "outline" : "ghost"}
          size={isMobile ? "icon" : "default"}
          className={isMobile ? "rounded-full bg-black/50 backdrop-blur-sm border-white/20" : ""}
        >
          {isMobile ? (
            <Settings className="h-5 w-5 text-white" />
          ) : (
            <>
              <Settings className="h-5 w-5 mr-2" />
              Settings
            </>
          )}
        </Button>
      </div>

      {/* Manual Entry Dialog */}
      <Dialog open={manualEntryOpen} onOpenChange={setManualEntryOpen}>
        <DialogContent className="sm:max-w-md">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Manual Code Entry</h2>
            <p className="text-sm text-gray-500">Enter the item code manually if scanning is not working</p>
            <div className="flex gap-2">
              <Input
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Enter item code (e.g., JWL-1234)"
                className="flex-1"
              />
              <Button onClick={handleManualEntry}>Submit</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Scan History Panel */}
      <ScanHistoryPanel
        isOpen={historyPanelOpen}
        onClose={() => setHistoryPanelOpen(false)}
        onClearAll={handleClearHistory}
        onViewItem={handleViewItem}
        onEditItem={handleEditItem}
        onDeleteItem={handleDeleteItem}
        items={scanHistory}
      />

      {/* Hidden canvas for QR processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
