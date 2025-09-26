import type { Metadata } from "next"
import ClientLoginPage from "./ClientPage"

export const metadata: Metadata = {
  title: "Login | Jewelia CRM",
  description: "Login to your Jewelia CRM account",
}

export default function LoginPage() {
  return <ClientLoginPage />
}
