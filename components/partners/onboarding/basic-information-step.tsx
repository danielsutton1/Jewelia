"use client"

import { useState } from "react"
import type { BasicInformation } from "@/types/partner-onboarding"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Upload, Building2, User, FileText, Landmark } from "lucide-react"
import { cn } from "@/lib/utils"

interface BasicInformationStepProps {
  data: Partial<BasicInformation>
  onSave: (data: Partial<BasicInformation>) => void
  onNext: () => void
  className?: string
}

export function BasicInformationStep({ data, onSave, onNext, className }: BasicInformationStepProps) {
  const [formData, setFormData] = useState<Partial<BasicInformation>>(data || {})
  const [activeTab, setActiveTab] = useState("company")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => {
      // Handle nested fields
      if (field.includes(".")) {
        const [parent, child] = field.split(".")
        return {
          ...prev,
          [parent]: {
            ...((prev[parent as keyof BasicInformation] || {}) as object),
            [child]: value,
          },
        }
      }
      return { ...prev, [field]: value }
    })

    // Clear error when field is changed
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Company details validation
    if (!formData.companyName?.trim()) {
      newErrors["companyName"] = "Company name is required"
    }
    if (!formData.legalName?.trim()) {
      newErrors["legalName"] = "Legal name is required"
    }
    if (!formData.businessType?.trim()) {
      newErrors["businessType"] = "Business type is required"
    }
    if (!formData.yearEstablished) {
      newErrors["yearEstablished"] = "Year established is required"
    }

    // Address validation
    if (!formData.address?.street?.trim()) {
      newErrors["address.street"] = "Street address is required"
    }
    if (!formData.address?.city?.trim()) {
      newErrors["address.city"] = "City is required"
    }
    if (!formData.address?.state?.trim()) {
      newErrors["address.state"] = "State/Province is required"
    }
    if (!formData.address?.postalCode?.trim()) {
      newErrors["address.postalCode"] = "Postal code is required"
    }
    if (!formData.address?.country?.trim()) {
      newErrors["address.country"] = "Country is required"
    }

    // Primary contact validation
    if (!formData.primaryContact?.name?.trim()) {
      newErrors["primaryContact.name"] = "Contact name is required"
    }
    if (!formData.primaryContact?.email?.trim()) {
      newErrors["primaryContact.email"] = "Email is required"
    } else if (!/^\S+@\S+\.\S+$/.test(formData.primaryContact.email)) {
      newErrors["primaryContact.email"] = "Valid email is required"
    }
    if (!formData.primaryContact?.phone?.trim()) {
      newErrors["primaryContact.phone"] = "Phone number is required"
    }

    // Tax information validation
    if (!formData.taxInformation?.taxId?.trim()) {
      newErrors["taxInformation.taxId"] = "Tax ID is required"
    }

    // Banking details validation
    if (!formData.bankingDetails?.accountName?.trim()) {
      newErrors["bankingDetails.accountName"] = "Account name is required"
    }
    if (!formData.bankingDetails?.accountNumber?.trim()) {
      newErrors["bankingDetails.accountNumber"] = "Account number is required"
    }
    if (!formData.bankingDetails?.bankName?.trim()) {
      newErrors["bankingDetails.bankName"] = "Bank name is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    onSave(formData)
  }

  const handleNext = () => {
    if (validateForm()) {
      onSave(formData)
      onNext()
    } else {
      // Find the first tab with errors and switch to it
      const errorFields = Object.keys(errors)
      if (errorFields.some((field) => field.startsWith("company") || !field.includes("."))) {
        setActiveTab("company")
      } else if (errorFields.some((field) => field.startsWith("primaryContact"))) {
        setActiveTab("contact")
      } else if (errorFields.some((field) => field.startsWith("taxInformation"))) {
        setActiveTab("tax")
      } else if (errorFields.some((field) => field.startsWith("bankingDetails"))) {
        setActiveTab("banking")
      }
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Basic Information</h2>
          <p className="text-muted-foreground">Provide essential information about the partner company</p>
        </div>
        <Button variant="outline" onClick={handleSave}>
          Save Progress
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Company</span>
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Contact</span>
          </TabsTrigger>
          <TabsTrigger value="tax" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Tax</span>
          </TabsTrigger>
          <TabsTrigger value="banking" className="flex items-center gap-2">
            <Landmark className="h-4 w-4" />
            <span className="hidden sm:inline">Banking</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
              <CardDescription>Enter the basic information about the partner company</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName || ""}
                    onChange={(e) => handleChange("companyName", e.target.value)}
                    placeholder="Enter company name"
                    className={errors.companyName ? "border-destructive" : ""}
                  />
                  {errors.companyName && <p className="text-sm text-destructive">{errors.companyName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="legalName">Legal Name *</Label>
                  <Input
                    id="legalName"
                    value={formData.legalName || ""}
                    onChange={(e) => handleChange("legalName", e.target.value)}
                    placeholder="Enter legal name"
                    className={errors.legalName ? "border-destructive" : ""}
                  />
                  {errors.legalName && <p className="text-sm text-destructive">{errors.legalName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type *</Label>
                  <Select
                    value={formData.businessType || ""}
                    onValueChange={(value) => handleChange("businessType", value)}
                  >
                    <SelectTrigger id="businessType" className={errors.businessType ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="corporation">Corporation</SelectItem>
                      <SelectItem value="llc">LLC</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                      <SelectItem value="sole-proprietorship">Sole Proprietorship</SelectItem>
                      <SelectItem value="non-profit">Non-Profit</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.businessType && <p className="text-sm text-destructive">{errors.businessType}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearEstablished">Year Established *</Label>
                  <Input
                    id="yearEstablished"
                    type="number"
                    value={formData.yearEstablished || ""}
                    onChange={(e) => handleChange("yearEstablished", Number.parseInt(e.target.value))}
                    placeholder="Enter year established"
                    min={1900}
                    max={new Date().getFullYear()}
                    className={errors.yearEstablished ? "border-destructive" : ""}
                  />
                  {errors.yearEstablished && <p className="text-sm text-destructive">{errors.yearEstablished}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website || ""}
                    onChange={(e) => handleChange("website", e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Company Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Enter a brief description of the company"
                    rows={4}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="logo">Company Logo</Label>
                  <div className="flex items-center gap-4">
                    {formData.logo && typeof formData.logo === "string" && (
                      <div className="relative w-16 h-16 rounded-md overflow-hidden border border-border">
                        <img
                          src={formData.logo || "/placeholder.svg"}
                          alt="Company logo"
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}
                    <Button variant="outline" type="button" className="w-full">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Logo
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Address Information</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="street">Street Address *</Label>
                    <Input
                      id="street"
                      value={formData.address?.street || ""}
                      onChange={(e) => handleChange("address.street", e.target.value)}
                      placeholder="Enter street address"
                      className={errors["address.street"] ? "border-destructive" : ""}
                    />
                    {errors["address.street"] && <p className="text-sm text-destructive">{errors["address.street"]}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.address?.city || ""}
                      onChange={(e) => handleChange("address.city", e.target.value)}
                      placeholder="Enter city"
                      className={errors["address.city"] ? "border-destructive" : ""}
                    />
                    {errors["address.city"] && <p className="text-sm text-destructive">{errors["address.city"]}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province *</Label>
                    <Input
                      id="state"
                      value={formData.address?.state || ""}
                      onChange={(e) => handleChange("address.state", e.target.value)}
                      placeholder="Enter state/province"
                      className={errors["address.state"] ? "border-destructive" : ""}
                    />
                    {errors["address.state"] && <p className="text-sm text-destructive">{errors["address.state"]}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code *</Label>
                    <Input
                      id="postalCode"
                      value={formData.address?.postalCode || ""}
                      onChange={(e) => handleChange("address.postalCode", e.target.value)}
                      placeholder="Enter postal code"
                      className={errors["address.postalCode"] ? "border-destructive" : ""}
                    />
                    {errors["address.postalCode"] && (
                      <p className="text-sm text-destructive">{errors["address.postalCode"]}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      value={formData.address?.country || ""}
                      onChange={(e) => handleChange("address.country", e.target.value)}
                      placeholder="Enter country"
                      className={errors["address.country"] ? "border-destructive" : ""}
                    />
                    {errors["address.country"] && (
                      <p className="text-sm text-destructive">{errors["address.country"]}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Primary Contact</CardTitle>
              <CardDescription>Enter information about the primary contact person</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactName">Contact Name *</Label>
                  <Input
                    id="contactName"
                    value={formData.primaryContact?.name || ""}
                    onChange={(e) => handleChange("primaryContact.name", e.target.value)}
                    placeholder="Enter contact name"
                    className={errors["primaryContact.name"] ? "border-destructive" : ""}
                  />
                  {errors["primaryContact.name"] && (
                    <p className="text-sm text-destructive">{errors["primaryContact.name"]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPosition">Position *</Label>
                  <Input
                    id="contactPosition"
                    value={formData.primaryContact?.position || ""}
                    onChange={(e) => handleChange("primaryContact.position", e.target.value)}
                    placeholder="Enter position"
                    className={errors["primaryContact.position"] ? "border-destructive" : ""}
                  />
                  {errors["primaryContact.position"] && (
                    <p className="text-sm text-destructive">{errors["primaryContact.position"]}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.primaryContact?.email || ""}
                    onChange={(e) => handleChange("primaryContact.email", e.target.value)}
                    placeholder="Enter email address"
                    className={errors["primaryContact.email"] ? "border-destructive" : ""}
                  />
                  {errors["primaryContact.email"] && (
                    <p className="text-sm text-destructive">{errors["primaryContact.email"]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Phone Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="contactPhone"
                      value={formData.primaryContact?.phone || ""}
                      onChange={(e) => handleChange("primaryContact.phone", e.target.value)}
                      placeholder="Enter phone number"
                      className={errors["primaryContact.phone"] ? "border-destructive" : ""}
                    />
                    <Input
                      id="contactExtension"
                      value={formData.primaryContact?.extension || ""}
                      onChange={(e) => handleChange("primaryContact.extension", e.target.value)}
                      placeholder="Ext."
                      maxLength={10}
                      className="w-24"
                    />
                  </div>
                  <div className="flex justify-between">
                    {errors["primaryContact.phone"] && (
                      <p className="text-sm text-destructive">{errors["primaryContact.phone"]}</p>
                    )}
                    <span className="text-xs text-muted-foreground ml-2">Extension (optional)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Tax Information</CardTitle>
              <CardDescription>Enter tax-related information for the partner</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID / EIN *</Label>
                  <Input
                    id="taxId"
                    value={formData.taxInformation?.taxId || ""}
                    onChange={(e) => handleChange("taxInformation.taxId", e.target.value)}
                    placeholder="Enter tax ID"
                    className={errors["taxInformation.taxId"] ? "border-destructive" : ""}
                  />
                  {errors["taxInformation.taxId"] && (
                    <p className="text-sm text-destructive">{errors["taxInformation.taxId"]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vatNumber">VAT Number (if applicable)</Label>
                  <Input
                    id="vatNumber"
                    value={formData.taxInformation?.vatNumber || ""}
                    onChange={(e) => handleChange("taxInformation.vatNumber", e.target.value)}
                    placeholder="Enter VAT number"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="taxExempt"
                  checked={formData.taxInformation?.taxExempt || false}
                  onCheckedChange={(checked) => handleChange("taxInformation.taxExempt", checked === true)}
                />
                <Label htmlFor="taxExempt">Tax Exempt</Label>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxDocuments">Tax Documents</Label>
                  <Button variant="outline" type="button" className="w-full">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Tax Documents
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banking" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Banking Details</CardTitle>
              <CardDescription>Enter banking information for payments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accountName">Account Name *</Label>
                  <Input
                    id="accountName"
                    value={formData.bankingDetails?.accountName || ""}
                    onChange={(e) => handleChange("bankingDetails.accountName", e.target.value)}
                    placeholder="Enter account name"
                    className={errors["bankingDetails.accountName"] ? "border-destructive" : ""}
                  />
                  {errors["bankingDetails.accountName"] && (
                    <p className="text-sm text-destructive">{errors["bankingDetails.accountName"]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number *</Label>
                  <Input
                    id="accountNumber"
                    value={formData.bankingDetails?.accountNumber || ""}
                    onChange={(e) => handleChange("bankingDetails.accountNumber", e.target.value)}
                    placeholder="Enter account number"
                    className={errors["bankingDetails.accountNumber"] ? "border-destructive" : ""}
                  />
                  {errors["bankingDetails.accountNumber"] && (
                    <p className="text-sm text-destructive">{errors["bankingDetails.accountNumber"]}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="routingNumber">Routing Number *</Label>
                  <Input
                    id="routingNumber"
                    value={formData.bankingDetails?.routingNumber || ""}
                    onChange={(e) => handleChange("bankingDetails.routingNumber", e.target.value)}
                    placeholder="Enter routing number"
                    className={errors["bankingDetails.routingNumber"] ? "border-destructive" : ""}
                  />
                  {errors["bankingDetails.routingNumber"] && (
                    <p className="text-sm text-destructive">{errors["bankingDetails.routingNumber"]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name *</Label>
                  <Input
                    id="bankName"
                    value={formData.bankingDetails?.bankName || ""}
                    onChange={(e) => handleChange("bankingDetails.bankName", e.target.value)}
                    placeholder="Enter bank name"
                    className={errors["bankingDetails.bankName"] ? "border-destructive" : ""}
                  />
                  {errors["bankingDetails.bankName"] && (
                    <p className="text-sm text-destructive">{errors["bankingDetails.bankName"]}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankAddress">Bank Address *</Label>
                  <Input
                    id="bankAddress"
                    value={formData.bankingDetails?.bankAddress || ""}
                    onChange={(e) => handleChange("bankingDetails.bankAddress", e.target.value)}
                    placeholder="Enter bank address"
                    className={errors["bankingDetails.bankAddress"] ? "border-destructive" : ""}
                  />
                  {errors["bankingDetails.bankAddress"] && (
                    <p className="text-sm text-destructive">{errors["bankingDetails.bankAddress"]}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="swiftCode">SWIFT Code (for international)</Label>
                  <Input
                    id="swiftCode"
                    value={formData.bankingDetails?.swiftCode || ""}
                    onChange={(e) => handleChange("bankingDetails.swiftCode", e.target.value)}
                    placeholder="Enter SWIFT code"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="iban">IBAN (for international)</Label>
                  <Input
                    id="iban"
                    value={formData.bankingDetails?.iban || ""}
                    onChange={(e) => handleChange("bankingDetails.iban", e.target.value)}
                    placeholder="Enter IBAN"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleNext} size="lg">
          Next: Capabilities Assessment
        </Button>
      </div>
    </div>
  )
}
