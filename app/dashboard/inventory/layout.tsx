import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Inventory | Product Management',
  description: 'Comprehensive inventory management system for jewelry pieces, raw materials, and stones',
}

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}