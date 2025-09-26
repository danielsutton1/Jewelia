"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { STLLoader } from "three/examples/jsm/loaders/STLLoader"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { ZoomIn, ZoomOut, RotateCcw, Download, Ruler, StickyNote, Printer } from "lucide-react"
import { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { CadFile } from "./cad-file-manager"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface DesignViewerProps {
  file: CadFile
}

export function DesignViewer({ file }: DesignViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const modelRef = useRef<THREE.Object3D | null>(null)

  const [viewMode, setViewMode] = useState<"solid" | "wireframe">("solid")
  const [measurementMode, setMeasurementMode] = useState(false)
  const [annotationMode, setAnnotationMode] = useState(false)
  const [annotations, setAnnotations] = useState<{ id: string; position: THREE.Vector3; text: string }[]>([])
  const [zoomLevel, setZoomLevel] = useState(1)

  useEffect(() => {
    if (!containerRef.current) return

    // Setup scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf5f5f5)
    sceneRef.current = scene

    // Setup camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    )
    camera.position.z = 5
    cameraRef.current = camera

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Setup controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controlsRef.current = controls

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(1, 1, 1)
    scene.add(directionalLight)

    // Load model based on file type
    if (file.fileType === "stl") {
      const loader = new STLLoader()
      // In a real app, this would be the actual file URL
      loader.load("/models/sample-ring.stl", (geometry) => {
        const material = new THREE.MeshStandardMaterial({
          color: 0xd4af37, // Gold color
          metalness: 0.8,
          roughness: 0.2,
        })
        const mesh = new THREE.Mesh(geometry, material)

        // Center the model
        geometry.computeBoundingBox()
        const center = new THREE.Vector3()
        geometry.boundingBox!.getCenter(center)
        mesh.position.sub(center)

        scene.add(mesh)
        modelRef.current = mesh

        // Adjust camera to fit model
        const box = new THREE.Box3().setFromObject(mesh)
        const size = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)
        camera.position.z = maxDim * 2.5

        controls.update()
      })
    } else if (file.fileType === "gltf" || file.fileType === "glb") {
      const loader = new GLTFLoader()
      // In a real app, this would be the actual file URL
      loader.load("/models/sample-pendant.glb", (gltf) => {
        scene.add(gltf.scene)
        modelRef.current = gltf.scene

        // Adjust camera to fit model
        const box = new THREE.Box3().setFromObject(gltf.scene)
        const size = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)
        camera.position.z = maxDim * 2.5

        controls.update()
      })
    } else {
      // Fallback to a placeholder model for demo purposes
      const geometry = new THREE.TorusGeometry(1, 0.4, 16, 100)
      const material = new THREE.MeshStandardMaterial({
        color: 0xd4af37, // Gold color
        metalness: 0.8,
        roughness: 0.2,
      })
      const torus = new THREE.Mesh(geometry, material)
      scene.add(torus)
      modelRef.current = torus
    }

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return

      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement)
      }
    }
  }, [file.fileType])

  // Toggle wireframe mode
  useEffect(() => {
    if (!modelRef.current) return

    modelRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (viewMode === "wireframe") {
          child.material.wireframe = true
        } else {
          child.material.wireframe = false
        }
      }
    })
  }, [viewMode])

  // Handle zoom
  const handleZoom = (zoomIn: boolean) => {
    if (!cameraRef.current) return

    if (zoomIn) {
      cameraRef.current.position.z *= 0.9
      setZoomLevel((prev) => Math.min(prev * 1.1, 5))
    } else {
      cameraRef.current.position.z *= 1.1
      setZoomLevel((prev) => Math.max(prev * 0.9, 0.2))
    }
  }

  // Reset view
  const resetView = () => {
    if (!controlsRef.current || !cameraRef.current || !modelRef.current) return

    controlsRef.current.reset()

    // Reset camera position
    if (modelRef.current) {
      const box = new THREE.Box3().setFromObject(modelRef.current)
      const size = box.getSize(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)
      cameraRef.current.position.z = maxDim * 2.5
    } else {
      cameraRef.current.position.set(0, 0, 5)
    }

    setZoomLevel(1)
    controlsRef.current.update()
  }

  // Export to STL
  const exportSTL = () => {
    // In a real app, this would trigger a server-side conversion if needed
    // and then download the STL file
    alert("STL export functionality would be implemented here")
  }

  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl">
          {file.name}
          <Badge variant="outline" className="ml-2">
            v{file.currentVersion || 1}
          </Badge>
        </CardTitle>
        <div className="flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" onClick={() => handleZoom(true)}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom In</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" onClick={() => handleZoom(false)}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom Out</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" onClick={resetView}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset View</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant={measurementMode ? "default" : "outline"}
                  onClick={() => setMeasurementMode(!measurementMode)}
                >
                  <Ruler className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Measurement Tool</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant={annotationMode ? "default" : "outline"}
                  onClick={() => setAnnotationMode(!annotationMode)}
                >
                  <StickyNote className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add Annotation</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative">
          <div ref={containerRef} className="h-[400px] w-full rounded-md border"></div>

          {measurementMode && (
            <div className="absolute top-2 left-2 rounded-md bg-background/80 p-2 shadow-sm">
              <p className="text-xs">Click two points to measure distance</p>
            </div>
          )}

          {annotationMode && (
            <div className="absolute top-2 left-2 rounded-md bg-background/80 p-2 shadow-sm">
              <p className="text-xs">Click to place annotation</p>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <span className="text-xs text-muted-foreground">View Mode</span>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "solid" | "wireframe")}>
              <TabsList className="h-8">
                <TabsTrigger value="solid" className="text-xs">
                  Solid
                </TabsTrigger>
                <TabsTrigger value="wireframe" className="text-xs">
                  Wireframe
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <Separator orientation="vertical" className="h-8" />

          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">Zoom</span>
            <Slider
              value={[zoomLevel * 100]}
              min={20}
              max={500}
              step={10}
              className="w-24"
              onValueChange={(value) => {
                if (!cameraRef.current || !modelRef.current) return

                const newZoom = value[0] / 100
                const box = new THREE.Box3().setFromObject(modelRef.current)
                const size = box.getSize(new THREE.Vector3())
                const maxDim = Math.max(size.x, size.y, size.z)

                cameraRef.current.position.z = (maxDim * 2.5) / newZoom
                setZoomLevel(newZoom)
              }}
            />
            <span className="w-8 text-xs">{Math.round(zoomLevel * 100)}%</span>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={exportSTL}>
            <Printer className="mr-2 h-4 w-4" />
            Export STL
          </Button>
          <Button size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </CardFooter>
    </>
  )
}
