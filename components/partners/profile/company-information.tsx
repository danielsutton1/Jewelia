"use client"

import { useState } from "react"
import type { PartnerProfile } from "@/types/partner-profile"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building, Users, MapPin, Award, Phone, Mail, ExternalLink, Calendar } from "lucide-react"
import Image from "next/image"

interface CompanyInformationProps {
  partner: PartnerProfile
}

export function CompanyInformation({ partner }: CompanyInformationProps) {
  const [activeTab, setActiveTab] = useState("business")

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold flex items-center">
              <Building className="mr-2 h-5 w-5" />
              Company Information
            </CardTitle>
            <CardDescription>Business details, contacts, locations, and certifications</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="business" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="certifications">Certifications</TabsTrigger>
          </TabsList>

          <TabsContent value="business" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Company Name</h3>
                <p className="mt-1 text-base">{partner.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Website</h3>
                <p className="mt-1 text-base flex items-center">
                  <a
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    {partner.website}
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Primary Email</h3>
                <p className="mt-1 text-base">{partner.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Primary Phone</h3>
                <p className="mt-1 text-base">{partner.phone}</p>
              </div>
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500">Categories</h3>
                <div className="mt-1 flex flex-wrap gap-2">
                  {partner.category.map((cat) => {
                    const categoryName = cat
                      .split("-")
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(" ")

                    return (
                      <Badge key={cat} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {categoryName}
                      </Badge>
                    )
                  })}
                </div>
              </div>
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500">Business Hours</h3>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div>
                    <p className="text-xs font-medium text-gray-500">Monday</p>
                    <p className="text-sm">{partner.businessHours.monday}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Tuesday</p>
                    <p className="text-sm">{partner.businessHours.tuesday}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Wednesday</p>
                    <p className="text-sm">{partner.businessHours.wednesday}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Thursday</p>
                    <p className="text-sm">{partner.businessHours.thursday}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Friday</p>
                    <p className="text-sm">{partner.businessHours.friday}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Saturday</p>
                    <p className="text-sm">{partner.businessHours.saturday}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Sunday</p>
                    <p className="text-sm">{partner.businessHours.sunday}</p>
                  </div>
                </div>
                {partner.businessHours.notes && (
                  <p className="mt-2 text-sm text-gray-500">{partner.businessHours.notes}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                <p className="mt-1 text-base">{partner.notes}</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contacts">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {partner.contactPersons.map((contact) => (
                <div key={contact.id} className="border rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 mr-3">
                      {contact.avatar ? (
                        <Image
                          src={contact.avatar || "/placeholder.svg"}
                          alt={contact.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Users className="w-6 h-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{contact.name}</h3>
                      <p className="text-sm text-gray-500">{contact.position}</p>
                    </div>
                    {contact.primaryContact && (
                      <Badge className="ml-auto" variant="secondary">
                        Primary
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                        {contact.email}
                      </a>
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline">
                        {contact.phone}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="locations">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {partner.locations.map((location) => (
                <div key={location.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{location.name}</h3>
                      {location.isPrimary && (
                        <Badge className="mt-1" variant="secondary">
                          Primary Location
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start text-sm">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                      <div>
                        <p>{location.address}</p>
                        <p>
                          {location.city}, {location.state} {location.postalCode}
                        </p>
                        <p>{location.country}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      <a href={`tel:${location.phone}`} className="text-blue-600 hover:underline">
                        {location.phone}
                      </a>
                    </div>
                    <div className="flex items-center text-sm">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      <a href={`mailto:${location.email}`} className="text-blue-600 hover:underline">
                        {location.email}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="certifications">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {partner.certifications.map((cert) => (
                <div key={cert.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{cert.name}</h3>
                      <p className="text-sm text-gray-500">Issued by: {cert.issuingBody}</p>
                    </div>
                    <Award className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span>Issued: {new Date(cert.dateIssued).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span>Expires: {new Date(cert.expiryDate).toLocaleDateString()}</span>
                    </div>
                    {cert.documentUrl && (
                      <Button variant="outline" size="sm" className="mt-2 w-full">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Certificate
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
