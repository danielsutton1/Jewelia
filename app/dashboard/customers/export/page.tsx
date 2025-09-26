"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

// Mock customer data (should match table columns)
const mockCustomers = [
  {
    id: "CUST-001",
    name: "Olivia Martin",
    company: "Martin Jewelers",
    email: "olivia.martin@email.com",
    phone: "+1 (555) 123-4567",
    status: "Active",
  },
  {
    id: "CUST-002",
    name: "Jackson Lee",
    company: "Lee Fine Gems",
    email: "jackson.lee@email.com",
    phone: "+1 (555) 234-5678",
    status: "Active",
  },
  {
    id: "CUST-003",
    name: "Isabella Nguyen",
    company: "Nguyen Luxury",
    email: "isabella.nguyen@email.com",
    phone: "+1 (555) 345-6789",
    status: "Inactive",
  },
  // ... add more as needed
]

type Customer = {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone: string;
  status: string;
};

function toCSV(customers: Customer[]): string {
  const header = ["ID", "Name", "Company", "Email", "Phone", "Status"];
  const rows = customers.map((c: Customer) => [c.id, c.name, c.company || "", c.email, c.phone, c.status]);
  return [header, ...rows].map((row: string[]) => row.map((field: string) => `"${String(field).replace(/"/g, '""')}"`).join(",")).join("\n");
}

export default function ExportCustomersPage() {
  const router = useRouter();

  useEffect(() => {
    const csv = toCSV(mockCustomers);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customers.csv";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      router.push("/dashboard/customers");
    }, 100);
  }, [router]);

  return (
    <div className="container mx-auto py-10 max-w-lg text-center">
      <h1 className="text-2xl font-bold mb-4">Exporting Customers...</h1>
      <p className="text-muted-foreground">Your download should begin automatically. If not, please try again.</p>
    </div>
  );
} 
 
 