"use client"
import dynamic from "next/dynamic"
import Head from "next/head"

const LocationHierarchy = dynamic(
  () => import("@/components/inventory/location-hierarchy").then(mod => mod.LocationHierarchy),
  { ssr: false }
)

export default function LocationHierarchyPage() {
  return (
    <div className="h-full overflow-auto">
      <Head>
        <title>Location Hierarchy | Jewelia CRM</title>
        <meta name="description" content="Manage your jewelry inventory locations" />
      </Head>
      <LocationHierarchy />
    </div>
  )
}
