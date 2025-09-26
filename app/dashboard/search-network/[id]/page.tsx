import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { mockPartners, getCategoryLabel, getSpecialtyLabel } from "@/data/mock-partners"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Phone, Globe, FileText, MapPin, Users, Award, ShoppingBag, StickyNote } from "lucide-react"

interface PartnerDetailPageProps {
  params: Promise<{ id: string }>
}

// Mock extended data for demonstration (in a real app, fetch this)
const mockContacts = [
  { id: "c1", name: "Michael Gold", position: "Account Manager", email: "michael@goldensuppliers.com", phone: "(555) 123-4567", primary: true },
  { id: "c2", name: "Sarah Silver", position: "Sales Rep", email: "sarah@goldensuppliers.com", phone: "(555) 123-4568", primary: false },
]
const mockLocations = [
  { id: "l1", name: "Headquarters", address: "123 Metal Ave, New York, NY 10001", phone: "(555) 123-4567", email: "info@goldensuppliers.com", isPrimary: true },
  { id: "l2", name: "West Coast Office", address: "456 Golden Ave, Los Angeles, CA 90001", phone: "(555) 987-6543", email: "la@goldensuppliers.com", isPrimary: false },
]
const mockCerts = [
  { id: "cert1", name: "Responsible Jewelry Council", issued: "2021-05-10", expires: "2024-05-10" },
  { id: "cert2", name: "ISO 9001:2015", issued: "2022-01-15", expires: "2025-01-15" },
]
const mockOrders = [
  { id: "o1", orderNumber: "ORD-1001", date: "2024-06-01", status: "Completed", total: 2999.99 },
  { id: "o2", orderNumber: "ORD-1002", date: "2024-06-10", status: "Processing", total: 1499.5 },
]
const mockDocs = [
  { id: "d1", title: "Master Service Agreement", type: "Contract", uploadDate: "2023-01-10", fileSize: "1.2 MB" },
  { id: "d2", title: "Material Safety Data Sheet", type: "Compliance", uploadDate: "2023-02-15", fileSize: "850 KB" },
]

export default async function PartnerDetailPage({ params }: PartnerDetailPageProps) {
  const resolvedParams = await params;
  const partner = mockPartners.find((p) => p.id === resolvedParams.id)

  if (!partner) {
    return (
      <div className="container mx-auto py-6 max-w-lg text-destructive">
        Partner not found.
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-4xl">
      <Card className="shadow-lg border border-border bg-background w-full">
        <CardHeader>
          <CardTitle>Partner Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6 items-start mb-6">
            <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-muted border border-border flex items-center justify-center">
              <Image src={partner.logo || "/placeholder.svg"} alt={partner.name} fill className="object-cover" />
            </div>
            <div>
              <div className="text-2xl font-bold mb-1">{partner.name}</div>
              <div className="text-muted-foreground mb-2">{partner.contactName}</div>
              <div className="flex flex-wrap gap-2 mb-2">
                {partner.category.map((cat) => (
                  <Badge key={cat} variant="outline">{getCategoryLabel(cat)}</Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {partner.specialties.map((spec) => (
                  <Badge key={spec} variant="secondary">{getSpecialtyLabel(spec)}</Badge>
                ))}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                <span><Mail className="inline h-4 w-4 mr-1" /> <a href={`mailto:${partner.email}`} className="underline">{partner.email}</a></span>
                <span><Phone className="inline h-4 w-4 mr-1" /> <a href={`tel:${partner.phone}`} className="underline">{partner.phone}</a></span>
              </div>
              <div className="text-sm text-muted-foreground mb-2">
                <Globe className="inline h-4 w-4 mr-1" /> <a href={partner.website} target="_blank" rel="noopener noreferrer" className="underline">{partner.website}</a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span>Rating:</span>
                <span className="font-semibold">{partner.rating.toFixed(1)}</span>
                <span>({partner.recentOrderCount} orders, {partner.responseTime}h avg. response)</span>
              </div>
            </div>
          </div>
          <Tabs defaultValue="business" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="business"><FileText className="h-4 w-4 mr-1" />Business</TabsTrigger>
              <TabsTrigger value="contacts"><Users className="h-4 w-4 mr-1" />Contacts</TabsTrigger>
              <TabsTrigger value="locations"><MapPin className="h-4 w-4 mr-1" />Locations</TabsTrigger>
              <TabsTrigger value="certs"><Award className="h-4 w-4 mr-1" />Certifications</TabsTrigger>
              <TabsTrigger value="orders"><ShoppingBag className="h-4 w-4 mr-1" />Orders</TabsTrigger>
              <TabsTrigger value="docs"><FileText className="h-4 w-4 mr-1" />Documents</TabsTrigger>
              <TabsTrigger value="notes"><StickyNote className="h-4 w-4 mr-1" />Notes</TabsTrigger>
            </TabsList>
            <TabsContent value="business" className="bg-muted/50 rounded-lg p-5 mb-2 border border-border">
              <div className="mb-2"><span className="font-semibold">Address:</span> {partner.address}</div>
              <div className="mb-2"><span className="font-semibold">Website:</span> <a href={partner.website} target="_blank" rel="noopener noreferrer" className="underline">{partner.website}</a></div>
              <div className="mb-2"><span className="font-semibold">Email:</span> <a href={`mailto:${partner.email}`} className="underline">{partner.email}</a></div>
              <div className="mb-2"><span className="font-semibold">Phone:</span> <a href={`tel:${partner.phone}`} className="underline">{partner.phone}</a></div>
              <div className="mb-2"><span className="font-semibold">Rating:</span> {partner.rating.toFixed(1)}</div>
              <div className="mb-2"><span className="font-semibold">Recent Orders:</span> {partner.recentOrderCount}</div>
              <div className="mb-2"><span className="font-semibold">Response Time:</span> {partner.responseTime}h</div>
            </TabsContent>
            <TabsContent value="contacts" className="bg-muted/50 rounded-lg p-5 mb-2 border border-border">
              {mockContacts.map((c) => (
                <div key={c.id} className="mb-3 p-3 border rounded bg-background">
                  <div className="font-semibold">{c.name} {c.primary && <Badge className="ml-2">Primary</Badge>}</div>
                  <div className="text-sm text-muted-foreground">{c.position}</div>
                  <div className="text-sm"><Mail className="inline h-4 w-4 mr-1" /> <a href={`mailto:${c.email}`} className="underline">{c.email}</a></div>
                  <div className="text-sm"><Phone className="inline h-4 w-4 mr-1" /> <a href={`tel:${c.phone}`} className="underline">{c.phone}</a></div>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="locations" className="bg-muted/50 rounded-lg p-5 mb-2 border border-border">
              {mockLocations.map((loc) => (
                <div key={loc.id} className="mb-3 p-3 border rounded bg-background">
                  <div className="font-semibold">{loc.name} {loc.isPrimary && <Badge className="ml-2">Primary</Badge>}</div>
                  <div className="text-sm text-muted-foreground">{loc.address}</div>
                  <div className="text-sm"><Mail className="inline h-4 w-4 mr-1" /> <a href={`mailto:${loc.email}`} className="underline">{loc.email}</a></div>
                  <div className="text-sm"><Phone className="inline h-4 w-4 mr-1" /> <a href={`tel:${loc.phone}`} className="underline">{loc.phone}</a></div>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="certs" className="bg-muted/50 rounded-lg p-5 mb-2 border border-border">
              {mockCerts.map((cert) => (
                <div key={cert.id} className="mb-3 p-3 border rounded bg-background">
                  <div className="font-semibold">{cert.name}</div>
                  <div className="text-sm text-muted-foreground">Issued: {cert.issued} | Expires: {cert.expires}</div>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="orders" className="bg-muted/50 rounded-lg p-5 mb-2 border border-border">
              <table className="min-w-full text-sm mb-2">
                <thead>
                  <tr className="bg-muted">
                    <th className="p-2 text-left">Order #</th>
                    <th className="p-2 text-left">Date</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {mockOrders.map((order) => (
                    <tr key={order.id} className="border-b">
                      <td className="p-2 font-mono">{order.orderNumber}</td>
                      <td className="p-2">{order.date}</td>
                      <td className="p-2">{order.status}</td>
                      <td className="p-2 text-right">${order.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TabsContent>
            <TabsContent value="docs" className="bg-muted/50 rounded-lg p-5 mb-2 border border-border">
              {mockDocs.map((doc) => (
                <div key={doc.id} className="mb-3 p-3 border rounded bg-background">
                  <div className="font-semibold">{doc.title}</div>
                  <div className="text-sm text-muted-foreground">{doc.type} | Uploaded: {doc.uploadDate} | Size: {doc.fileSize}</div>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="notes" className="bg-muted/50 rounded-lg p-5 mb-2 border border-border">
              <div className="mb-2 break-words whitespace-pre-line max-w-full"><span className="font-semibold">Notes:</span> {partner.notes}</div>
              <div className="text-xs text-muted-foreground">Created: {new Date(partner.createdAt).toLocaleDateString()} | Updated: {new Date(partner.updatedAt).toLocaleDateString()}</div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 
 
 