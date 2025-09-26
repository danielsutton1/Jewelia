import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Settings | Configuration',
  description: 'Manage your account settings, preferences, and system configuration',
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
