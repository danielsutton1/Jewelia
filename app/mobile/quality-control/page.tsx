import type { Metadata } from "next"
import { MobileQualityControlApp } from "@/components/quality-control/mobile/mobile-app"

export const metadata: Metadata = {
  title: "Quality Control - Mobile App",
  description: "Mobile interface for quality control inspectors",
}

export default function MobileQualityControlPage() {
  return <MobileQualityControlApp />
}
