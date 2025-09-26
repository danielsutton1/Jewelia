"use client"

import type { Partner } from "@/types/partner-management"
import { getCategoryLabel, getSpecialtyLabel } from "@/data/mock-partners"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Phone, Mail, Globe, MoreHorizontal, Star } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface PartnerListViewProps {
  partners: Partner[]
}

export function PartnerListView({ partners }: PartnerListViewProps) {
  const router = useRouter()
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Partner</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Specialties</TableHead>
            <TableHead className="text-center">Rating</TableHead>
            <TableHead className="text-center">Orders</TableHead>
            <TableHead className="text-center">Response</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {partners.map((partner) => (
            <TableRow
              key={partner.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => router.push(`/dashboard/search-network/${partner.id}`)}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 rounded-md overflow-hidden bg-muted">
                    <Image
                      src={partner.logo || "/placeholder.svg"}
                      alt={`${partner.name} logo`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-medium">{partner.name}</div>
                    <div className="text-sm text-muted-foreground">{partner.contactName}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {partner.category.map((cat) => (
                  <div key={cat}>{getCategoryLabel(cat)}</div>
                ))}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {partner.specialties.slice(0, 3).map((specialty) => (
                    <Badge key={specialty} variant="outline" className="text-xs">
                      {getSpecialtyLabel(specialty)}
                    </Badge>
                  ))}
                  {partner.specialties.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{partner.specialties.length - 3} more
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <span>{partner.rating.toFixed(1)}</span>
                </div>
              </TableCell>
              <TableCell className="text-center">{partner.recentOrderCount}</TableCell>
              <TableCell className="text-center">{partner.responseTime}h</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button size="icon" variant="ghost" title={`Call ${partner.contactName}`}>
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" title={`Email ${partner.contactName}`}>
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" title={`Visit website`}>
                    <Globe className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" title="More options">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
