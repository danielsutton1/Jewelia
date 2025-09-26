import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Orders | Order Management',
  description: 'Manage your jewelry orders, track order status, and process customer orders',
}

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
