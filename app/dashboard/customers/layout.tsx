import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Customers | Customer Management',
  description: 'Manage your jewelry customers, track interactions, and analyze customer data',
}

export default function CustomersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
