"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { UploadCloud, CheckCircle, XCircle, HelpCircle, Download, MessageCircle, Video, Save, Keyboard, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useHotkeys } from "react-hotkeys-hook"
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

const steps = [
  "Welcome & Account Setup",
  "Data Import Hub (CRM + Inventory)",
  "System Configuration",
  "Feature Tour & Training",
  "Go-Live Checklist",
]

const LOCAL_STORAGE_KEY = "onboardingWizardProgress"

// Mock system fields for mapping
const SYSTEM_FIELDS = ["Name", "Email", "Phone", "Address", "Company", "Notes"]

// Inventory import wizard for jewelry businesses
const INVENTORY_FIELDS = [
  "SKU", "Description", "Category", "Price", "Stock", "Location", "Image", "Document", "Supplier", "Vendor", "Cost", "Pricing Tier", "GIA Number", "Carat", "Color", "Clarity", "Cut", "Polish", "Symmetry", "Fluorescence"
]

// Tutorial content for each step
const TUTORIAL_CONTENT = {
  0: {
    title: "Welcome to Jewelia CRM",
    content: "This dashboard shows your onboarding progress and next steps.",
    video: "https://example.com/videos/welcome.mp4"
  },
  1: {
    title: "Data Import",
    content: "Import your customer and inventory data using our templates.",
    video: "https://example.com/videos/import.mp4"
  },
  2: {
    title: "System Configuration",
    content: "Configure your system settings and preferences.",
    video: "https://example.com/videos/config.mp4"
  },
  3: {
    title: "Feature Tour",
    content: "Learn about key features and how to use them.",
    video: "https://example.com/videos/tour.mp4"
  },
  4: {
    title: "Go-Live Checklist",
    content: "Final steps before you go live with Jewelia CRM.",
    video: "https://example.com/videos/golive.mp4"
  }
}

// Sample data templates
const SAMPLE_TEMPLATES = {
  customer: {
    name: "customer_template.csv",
    url: "/templates/customer_template.csv",
    fields: ["Full Name", "Email Address", "Phone Number", "Address", "Company", "Notes"]
  },
  inventory: {
    name: "inventory_template.csv",
    url: "/templates/inventory_template.csv",
    fields: ["SKU", "Description", "Category", "Price", "Stock", "Location", "Image", "Supplier", "GIA Number", "Carat", "Color", "Clarity", "Cut"]
  }
}

// Keyboard shortcuts
const SHORTCUTS = {
  "alt+n": "Next step",
  "alt+b": "Previous step",
  "alt+s": "Save progress",
  "alt+h": "Toggle help",
  "alt+d": "Download templates",
  "alt+c": "Toggle chat"
}

function validateEmail(email: string) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
}
function validatePhone(phone: string) {
  return /^\+?\d{7,15}$/.test(phone.replace(/[^\d]/g, ""))
}
function validateDiamondSpecs(row: any) {
  // Example: carat must be > 0, color in D-M, clarity in allowed list
  const errors: any = {}
  if (row.Carat && (isNaN(Number(row.Carat)) || Number(row.Carat) <= 0)) errors.Carat = "Invalid carat weight"
  if (row.Color && !["D","E","F","G","H","I","J","K","L","M"].includes(row.Color)) errors.Color = "Invalid color"
  if (row.Clarity && !["FL","IF","VVS1","VVS2","VS1","VS2","SI1","SI2","I1","I2","I3"].includes(row.Clarity)) errors.Clarity = "Invalid clarity"
  return errors
}
function validateMetalType(type: string) {
  return ["gold","platinum","silver"].includes(type?.toLowerCase?.())
}
function detectDuplicates(data: any[], keyFields: string[]) {
  const seen = new Set()
  const dups: number[] = []
  data.forEach((row, i) => {
    const key = keyFields.map(f => row[f]).join("|")
    if (seen.has(key)) dups.push(i)
    else seen.add(key)
  })
  return dups
}

// Types for imported data
interface ImportedData {
  customers: any[]
  inventory: any[]
  errors: {
    customers: { [key: string]: string }[]
    inventory: { [key: string]: string }[]
  }
  stats: {
    customers: { success: number; failed: number }
    inventory: { success: number; failed: number }
  }
}

function passwordStrength(password: string) {
  let score = 0
  if (!password) return 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}

function WelcomeSetup({ formData, setFormData, onContinue }: { formData: any, setFormData: (f: any) => void, onContinue: () => void }) {
  // State for validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [logo, setLogo] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const autoSaveInterval = useRef<NodeJS.Timeout | null>(null)

  // Auto-suggest username from email
  useEffect(() => {
    if (formData.email && !formData.username) {
      const username = formData.email.split("@")[0]
      setFormData((f: any) => ({ ...f, username }))
    }
  }, [formData.email, formData.username, setFormData])

  // Logo upload
  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogo(file)
      setLogoPreview(URL.createObjectURL(file))
      setFormData((f: any) => ({ ...f, logo: file.name }))
    }
  }

  // Real-time validation
  useEffect(() => {
    const newErrors: { [key: string]: string } = {}
    // Company Info
    if (!formData.companyName) newErrors.companyName = "Company Name is required"
    if (!formData.mainPhone) newErrors.mainPhone = "Main Phone Number is required"
    if (!formData.mainPhoneExtension) newErrors.mainPhoneExtension = "Extension is required"
    // Primary Contact
    if (!formData.firstName) newErrors.firstName = "First Name is required"
    if (!formData.lastName) newErrors.lastName = "Last Name is required"
    if (!formData.email) newErrors.email = "Email is required"
    else if (!validateEmail(formData.email)) newErrors.email = "Invalid email format"
    // Initial Admin
    if (!formData.username) newErrors.username = "Username is required"
    if (!formData.password) newErrors.password = "Password is required"
    else if (passwordStrength(formData.password) < 3) newErrors.password = "Password is too weak"
    if (!formData.confirmPassword) newErrors.confirmPassword = "Confirm your password"
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match"
    if (!formData.securityQuestion) newErrors.securityQuestion = "Select a security question"
    if (!formData.securityAnswer) newErrors.securityAnswer = "Security answer required"
    // ToS/Privacy
    if (!formData.tos) newErrors.tos = "You must accept the Terms of Service"
    if (!formData.privacy) newErrors.privacy = "You must accept the Privacy Policy"
    setErrors(newErrors)
  }, [formData])

  // Auto-save every 30s
  useEffect(() => {
    autoSaveInterval.current = setInterval(() => {
      setSaving(true)
      setTimeout(() => {
        setSaving(false)
        setLastSaved(new Date())
      }, 500)
    }, 30000)
    return () => {
      if (autoSaveInterval.current) clearInterval(autoSaveInterval.current)
    }
  }, [formData])

  // Helper for tooltips
  const TooltipIcon = ({ tip }: { tip: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="ml-1 align-middle cursor-pointer text-muted-foreground"><Info className="inline h-4 w-4" /></span>
        </TooltipTrigger>
        <TooltipContent>{tip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  // Password strength
  const pwStrength = useMemo(() => passwordStrength(formData.password || ""), [formData.password])
  const pwStrengthLabel = ["Very Weak", "Weak", "Fair", "Good", "Strong", "Excellent"][pwStrength]
  const pwStrengthColor = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-blue-400", "bg-green-500", "bg-emerald-600"][pwStrength]

  // Progress (16% when valid)
  const isComplete = Object.keys(errors).length === 0
  const progress = isComplete ? 16 : 0

  // Dropdown options
  const businessTypes = ["Retailer", "Manufacturer", "Wholesaler", "Designer", "Repair Shop", "Other"]
  const salesVolumes = ["$0-10K", "$10K-50K", "$50K-100K", "$100K-500K", "$500K+"]
  const employees = ["1-5", "6-10", "11-25", "26-50", "50+"]
  const dateFormats = ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]
  const currencies = ["USD", "CAD", "EUR", "GBP", "AUD", "INR", "JPY", "CNY"]
  const languages = ["English", "French", "Spanish", "German", "Italian", "Chinese", "Japanese"]
  const timeZones = ["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "Europe/London", "Europe/Paris", "Asia/Tokyo", "Australia/Sydney"]
  const securityQuestions = [
    "What is your mother's maiden name?",
    "What was your first pet's name?",
    "What is your favorite book?",
    "What city were you born in?",
    "What is your favorite gemstone?"
  ]
  const primaryProducts = ["Fine Jewelry", "Fashion Jewelry", "Diamonds", "Gemstones", "Watches", "Custom Design", "Repairs", "Other"]
  const primaryGoals = ["Inventory Management", "Customer Tracking", "Sales Analytics", "Production Management", "E-commerce Integration"]

  // Checkbox helpers
  const handleCheckboxArray = (field: string, value: string) => {
    setFormData((f: any) => {
      const arr = f[field] || []
      if (arr.includes(value)) return { ...f, [field]: arr.filter((v: string) => v !== value) }
      return { ...f, [field]: [...arr, value] }
    })
  }

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isComplete) {
      onContinue()
    }
  }

  return (
    <form className="space-y-8 max-w-2xl mx-auto py-6 px-2 sm:px-4" autoComplete="off" onSubmit={handleSubmit}>
      {/* Progress Bar */}
      <div className="mb-4">
        <Progress value={progress} className="h-2" />
        <div className="text-xs mt-1 text-muted-foreground">{progress}% Complete</div>
      </div>
      {/* Company Logo */}
      <div className="flex items-center gap-4 mb-2">
        <div className="w-20 h-20 bg-muted rounded flex items-center justify-center overflow-hidden">
          {logoPreview ? <img src={logoPreview} alt="Logo" className="object-contain w-full h-full" /> : <span className="text-xs text-muted-foreground">Logo</span>}
        </div>
        <div>
          <input type="file" accept="image/*" className="hidden" id="logo-upload" onChange={handleLogo} />
          <label htmlFor="logo-upload" className="text-xs text-emerald-600 underline cursor-pointer">Upload Logo (optional)</label>
        </div>
      </div>
      {/* COMPANY INFORMATION */}
      <Card>
        <CardHeader><CardTitle>Company Information</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-medium">Company Name <span className="text-red-500">*</span></label>
            <Input value={formData.companyName || ""} onChange={e => setFormData((f: any) => ({ ...f, companyName: e.target.value }))} />
            {errors.companyName && <div className="text-xs text-red-500">{errors.companyName}</div>}
          </div>
          <div>
            <label className="font-medium">Business Type</label>
            <select className="w-full rounded border px-2 py-1" value={formData.businessType || ""} onChange={e => setFormData((f: any) => ({ ...f, businessType: e.target.value }))}>
              <option value="">Select</option>
              {businessTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="font-medium">Years in Business</label>
            <Input type="number" min={0} value={formData.yearsInBusiness || ""} onChange={e => setFormData((f: any) => ({ ...f, yearsInBusiness: e.target.value }))} />
          </div>
          <div>
            <label className="font-medium">Website URL</label>
            <Input value={formData.website || ""} onChange={e => setFormData((f: any) => ({ ...f, website: e.target.value }))} />
          </div>
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mt-2 mb-4">
            <div className="flex flex-col gap-2">
              <label className="font-medium">Street</label>
              <Input value={formData.street || ""} onChange={e => setFormData((f: any) => ({ ...f, street: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium">City</label>
              <Input value={formData.city || ""} onChange={e => setFormData((f: any) => ({ ...f, city: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium">State/Province</label>
              <Input value={formData.state || ""} onChange={e => setFormData((f: any) => ({ ...f, state: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium">Zip Code</label>
              <Input value={formData.zip || ""} onChange={e => setFormData((f: any) => ({ ...f, zip: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium">Country</label>
              <Input value={formData.country || ""} onChange={e => setFormData((f: any) => ({ ...f, country: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="font-medium">Main Phone Number <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              <Input
                value={formData.mainPhone || ""}
                onChange={e => setFormData((f: any) => ({ ...f, mainPhone: e.target.value }))}
                className={errors.mainPhone ? "border-red-500" : ""}
                placeholder="(555) 555-5555"
              />
              <Input
                value={formData.mainPhoneExtension || ""}
                onChange={e => setFormData((f: any) => ({ ...f, mainPhoneExtension: e.target.value }))}
                className={errors.mainPhoneExtension ? "border-red-500 w-24" : "w-24"}
                placeholder="Ext."
                maxLength={10}
              />
            </div>
            <div className="flex justify-between">
              {errors.mainPhone && <div className="text-xs text-red-500">{errors.mainPhone}</div>}
              {errors.mainPhoneExtension && <div className="text-xs text-red-500 ml-2">{errors.mainPhoneExtension}</div>}
            </div>
          </div>
        </CardContent>
      </Card>
      {/* PRIMARY CONTACT DETAILS */}
      <Card>
        <CardHeader><CardTitle>Primary Contact Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-medium">First Name <span className="text-red-500">*</span></label>
            <Input value={formData.firstName || ""} onChange={e => setFormData((f: any) => ({ ...f, firstName: e.target.value }))} />
            {errors.firstName && <div className="text-xs text-red-500">{errors.firstName}</div>}
          </div>
          <div>
            <label className="font-medium">Last Name <span className="text-red-500">*</span></label>
            <Input value={formData.lastName || ""} onChange={e => setFormData((f: any) => ({ ...f, lastName: e.target.value }))} />
            {errors.lastName && <div className="text-xs text-red-500">{errors.lastName}</div>}
          </div>
          <div>
            <label className="font-medium">Title/Position</label>
            <Input value={formData.title || ""} onChange={e => setFormData((f: any) => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className="font-medium">Email Address <span className="text-red-500">*</span></label>
            <Input type="email" value={formData.email || ""} onChange={e => setFormData((f: any) => ({ ...f, email: e.target.value }))} />
            {errors.email && <div className="text-xs text-red-500">{errors.email}</div>}
          </div>
          <div>
            <label className="font-medium">Direct Phone Number</label>
            <Input value={formData.directPhone || ""} onChange={e => setFormData((f: any) => ({ ...f, directPhone: e.target.value }))} />
          </div>
          <div>
            <label className="font-medium">Mobile Phone</label>
            <Input value={formData.mobilePhone || ""} onChange={e => setFormData((f: any) => ({ ...f, mobilePhone: e.target.value }))} />
          </div>
        </CardContent>
      </Card>
      {/* BUSINESS PROFILE */}
      <Card>
        <CardHeader><CardTitle>Business Profile</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="font-medium">Primary Products</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {primaryProducts.map(p => (
                <label key={p} className="flex items-center gap-1 text-sm">
                  <input type="checkbox" checked={formData.primaryProducts?.includes(p)} onChange={() => handleCheckboxArray("primaryProducts", p)} /> {p}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="font-medium">Average Monthly Sales Volume</label>
            <select className="w-full rounded border px-2 py-1" value={formData.salesVolume || ""} onChange={e => setFormData((f: any) => ({ ...f, salesVolume: e.target.value }))}>
              <option value="">Select</option>
              {salesVolumes.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="font-medium">Number of Employees</label>
            <select className="w-full rounded border px-2 py-1" value={formData.employees || ""} onChange={e => setFormData((f: any) => ({ ...f, employees: e.target.value }))}>
              <option value="">Select</option>
              {employees.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label className="font-medium">Number of Locations/Stores</label>
            <Input type="number" min={1} value={formData.locations || ""} onChange={e => setFormData((f: any) => ({ ...f, locations: e.target.value }))} />
          </div>
          <div>
            <label className="font-medium">Current CRM System
              <TooltipIcon tip="If you use a CRM, let us know for migration help." />
            </label>
            <Input value={formData.currentCrm || ""} onChange={e => setFormData((f: any) => ({ ...f, currentCrm: e.target.value }))} />
          </div>
        </CardContent>
      </Card>
      {/* ACCOUNT PREFERENCES */}
      <Card>
        <CardHeader><CardTitle>Account Preferences</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-medium">Preferred Time Zone</label>
            <select className="w-full rounded border px-2 py-1" value={formData.timeZone || ""} onChange={e => setFormData((f: any) => ({ ...f, timeZone: e.target.value }))}>
              <option value="">Select</option>
              {timeZones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
          <div>
            <label className="font-medium">Preferred Date Format</label>
            <select className="w-full rounded border px-2 py-1" value={formData.dateFormat || ""} onChange={e => setFormData((f: any) => ({ ...f, dateFormat: e.target.value }))}>
              <option value="">Select</option>
              {dateFormats.map(df => <option key={df} value={df}>{df}</option>)}
            </select>
          </div>
          <div>
            <label className="font-medium">Currency</label>
            <select className="w-full rounded border px-2 py-1" value={formData.currency || ""} onChange={e => setFormData((f: any) => ({ ...f, currency: e.target.value }))}>
              <option value="">Select</option>
              {currencies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="font-medium">Language Preference</label>
            <select className="w-full rounded border px-2 py-1" value={formData.language || ""} onChange={e => setFormData((f: any) => ({ ...f, language: e.target.value }))}>
              <option value="">Select</option>
              {languages.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </CardContent>
      </Card>
      {/* INITIAL ADMIN USER */}
      <Card>
        <CardHeader><CardTitle>Initial Admin User</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-medium">Username</label>
            <Input value={formData.username || ""} onChange={e => setFormData((f: any) => ({ ...f, username: e.target.value }))} />
            {errors.username && <div className="text-xs text-red-500">{errors.username}</div>}
          </div>
          <div>
            <label className="font-medium">Temporary Password</label>
            <Input type="password" value={formData.password || ""} onChange={e => setFormData((f: any) => ({ ...f, password: e.target.value }))} />
            <div className="flex items-center gap-2 mt-1">
              <div className={`h-2 w-24 rounded ${pwStrengthColor}`}></div>
              <span className="text-xs text-muted-foreground">{pwStrengthLabel}</span>
            </div>
            {errors.password && <div className="text-xs text-red-500">{errors.password}</div>}
          </div>
          <div>
            <label className="font-medium">Confirm Password</label>
            <Input type="password" value={formData.confirmPassword || ""} onChange={e => setFormData((f: any) => ({ ...f, confirmPassword: e.target.value }))} />
            {errors.confirmPassword && <div className="text-xs text-red-500">{errors.confirmPassword}</div>}
          </div>
          <div>
            <label className="font-medium">Security Question</label>
            <select className="w-full rounded border px-2 py-1" value={formData.securityQuestion || ""} onChange={e => setFormData((f: any) => ({ ...f, securityQuestion: e.target.value }))}>
              <option value="">Select</option>
              {securityQuestions.map(q => <option key={q} value={q}>{q}</option>)}
            </select>
            {errors.securityQuestion && <div className="text-xs text-red-500">{errors.securityQuestion}</div>}
          </div>
          <div className="md:col-span-2">
            <label className="font-medium">Security Answer</label>
            <Input value={formData.securityAnswer || ""} onChange={e => setFormData((f: any) => ({ ...f, securityAnswer: e.target.value }))} />
            {errors.securityAnswer && <div className="text-xs text-red-500">{errors.securityAnswer}</div>}
          </div>
        </CardContent>
      </Card>
      {/* GOALS & EXPECTATIONS */}
      <Card>
        <CardHeader><CardTitle>Goals & Expectations</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="font-medium">Primary Goals</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {primaryGoals.map(g => (
                <label key={g} className="flex items-center gap-1 text-sm">
                  <input type="checkbox" checked={formData.primaryGoals?.includes(g)} onChange={() => handleCheckboxArray("primaryGoals", g)} /> {g}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="font-medium">Expected Go-Live Date</label>
            <Input type="date" value={formData.goLiveDate || ""} onChange={e => setFormData((f: any) => ({ ...f, goLiveDate: e.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <label className="font-medium">Special Requirements</label>
            <textarea className="w-full rounded border px-2 py-1 min-h-[60px]" value={formData.specialRequirements || ""} onChange={e => setFormData((f: any) => ({ ...f, specialRequirements: e.target.value }))} />
          </div>
        </CardContent>
      </Card>
      {/* Terms of Service & Privacy */}
      <div className="flex flex-col gap-2 mt-4">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={!!formData.tos} onChange={e => setFormData((f: any) => ({ ...f, tos: e.target.checked }))} />
          I agree to the <a href="/terms" className="underline text-emerald-600" target="_blank">Terms of Service</a> <span className="text-red-500">*</span>
        </label>
        {errors.tos && <div className="text-xs text-red-500">{errors.tos}</div>}
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={!!formData.privacy} onChange={e => setFormData((f: any) => ({ ...f, privacy: e.target.checked }))} />
          I agree to the <a href="/privacy" className="underline text-emerald-600" target="_blank">Privacy Policy</a> <span className="text-red-500">*</span>
        </label>
        {errors.privacy && <div className="text-xs text-red-500">{errors.privacy}</div>}
      </div>
      {/* Save Buttons */}
      <div className="flex gap-4 mt-6">
        <Button type="button" variant="secondary" onClick={() => { setSaving(true); setTimeout(() => setSaving(false), 500) }} disabled={saving}>
          {saving ? "Saving..." : "Save Draft"}
        </Button>
        <Button type="submit" disabled={!isComplete}>
          Save & Continue
        </Button>
      </div>
      {lastSaved && (
        <div className="text-xs text-muted-foreground mt-2">Last saved: {lastSaved.toLocaleTimeString()}</div>
      )}
    </form>
  )
}

function CustomerDataImport({ onImport }: { onImport: (data: any) => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [columns, setColumns] = useState<string[]>([])
  const [mapping, setMapping] = useState<{ [key: string]: string }>({})
  const [previewData, setPreviewData] = useState<any[]>([])
  const [validationErrors, setValidationErrors] = useState<{ [row: number]: { [col: string]: string } }>({})
  const [duplicates, setDuplicates] = useState<number[]>([])
  const [mergeOptions, setMergeOptions] = useState<{ [row: number]: string }>({})
  const [tags, setTags] = useState<string[]>([])
  const [importSummary, setImportSummary] = useState<{ success: number; failed: number }>({ success: 0, failed: 0 })
  const [step, setStep] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [importStats, setImportStats] = useState({ success: 0, failed: 0 })
  const [fileError, setFileError] = useState("")
  const [fileSuccess, setFileSuccess] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = async (file: File) => {
    setIsProcessing(true)
    setFileError("")
    setFileSuccess("")

    try {
      const ext = file.name.split('.').pop()?.toLowerCase()
      let data: any[] = []

      if (ext === 'csv') {
        const result = await new Promise<Papa.ParseResult<any>>((resolve, reject) => {
          Papa.parse(file, {
            header: true,
            complete: (results) => resolve(results),
            error: (error: Error) => reject(error)
          })
        })
        data = result.data
      } else if (['xlsx', 'xls'].includes(ext!)) {
        const buffer = await file.arrayBuffer()
        const workbook = XLSX.read(buffer)
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        data = XLSX.utils.sheet_to_json(worksheet)
      }

      // Extract columns from first row
      const columns = Object.keys(data[0] || {})
      setColumns(columns)
      setPreviewData(data.slice(0, 5)) // Show first 5 rows

      // Validate data
      const errors: { [row: number]: { [col: string]: string } } = {}
      data.forEach((row, i) => {
        if (!row["Full Name"]) errors[i] = { ...(errors[i]||{}), "Full Name": "Name required" }
        if (!row["Email Address"] || !validateEmail(row["Email Address"])) 
          errors[i] = { ...(errors[i]||{}), "Email Address": "Invalid email format" }
        if (!row["Phone Number"] || !validatePhone(row["Phone Number"])) 
          errors[i] = { ...(errors[i]||{}), "Phone Number": "Invalid phone number" }
      })

      // Detect duplicates
      const dups = detectDuplicates(data, ["Full Name", "Email Address"])
      
      setValidationErrors(errors)
      setDuplicates(dups)
      setStep(1)

      // Calculate import stats
      const success = data.length - Object.keys(errors).length
      const failed = Object.keys(errors).length
      setImportStats({ success, failed })
      setFileSuccess(`File processed successfully. ${success} valid records, ${failed} errors.`)

    } catch (error: unknown) {
      setFileError(`Error processing file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFile = async (f: File) => {
    setFile(f)
    await processFile(f)
  }

  const handleMap = (col: string, field: string) => {
    setMapping((prev) => ({ ...prev, [col]: field }))
  }

  const handleAddTag = (tag: string) => {
    setTags((prev) => [...prev, tag])
  }

  const handleImport = async () => {
    if (!file) return

    setIsProcessing(true)
    try {
      // Here you would typically send the data to your API
      // For now, we'll simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onImport({
        success: importStats.success,
        failed: importStats.failed,
        data: previewData
      })
      
      setStep(2)
    } catch (error: unknown) {
      setFileError(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      {step === 0 && (
        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 bg-muted cursor-pointer hover:border-emerald-400 transition" onClick={() => fileInputRef.current?.click()}>
          <UploadCloud className="h-10 w-10 mb-2 text-emerald-500" />
          <span className="mb-2">Drag & drop or click to upload CSV/Excel file</span>
          <Input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={e => e.target.files && handleFile(e.target.files[0])} />
        </div>
      )}
      {step === 1 && (
        <div>
          <h3 className="font-semibold mb-2">Map Columns to System Fields</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            {columns.map((col) => (
              <div key={col} className="flex flex-col items-center">
                <div className="font-medium mb-1">{col}</div>
                <select className="border rounded px-2 py-1" value={mapping[col] || ""} onChange={e => handleMap(col, e.target.value)}>
                  <option value="">-- Map to --</option>
                  {SYSTEM_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            ))}
          </div>
          <h3 className="font-semibold mb-2 mt-6">Data Preview</h3>
          <div className="overflow-x-auto border rounded">
            <table className="min-w-full text-xs">
              <thead>
                <tr>
                  {columns.map(col => <th key={col} className="px-2 py-1 border-b bg-muted font-semibold">{col}</th>)}
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, i) => (
                  <tr key={i} className={duplicates.includes(i) ? "bg-yellow-100" : ""}>
                    {columns.map(col => (
                      <td key={col} className="px-2 py-1 border-b">
                        <span className={validationErrors[i]?.[col] ? "text-red-600 font-bold" : ""}>{row[col]}</span>
                        {validationErrors[i]?.[col] && <div className="text-xs text-red-500">{validationErrors[i][col]}</div>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {duplicates.length > 0 && (
            <div className="mt-4 p-2 bg-yellow-50 border border-yellow-300 rounded">
              <span className="font-medium text-yellow-700">Duplicates detected:</span> Rows {duplicates.map(i => i + 1).join(", ")}. <span className="underline cursor-pointer text-blue-600" onClick={() => setMergeOptions({ ...mergeOptions, [duplicates[0]]: "merge" })}>Merge?</span>
            </div>
          )}
          <div className="mt-4">
            <label className="block mb-1 font-medium">Bulk Tags</label>
            <div className="flex gap-2 flex-wrap">
              {tags.map(tag => <span key={tag} className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs">{tag}</span>)}
              <Input placeholder="Add tag..." className="w-32 inline-block" onKeyDown={e => { if (e.key === "Enter" && e.currentTarget.value) { handleAddTag(e.currentTarget.value); e.currentTarget.value = "" } }} />
            </div>
          </div>
          <Button className="mt-6" onClick={handleImport}>Import Data</Button>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Import Summary</h3>
          <div className="flex gap-4 items-center">
            <span className="text-green-600 font-bold">{importSummary.success} Imported</span>
            <span className="text-red-600 font-bold">{importSummary.failed} Failed</span>
          </div>
          <Button variant="outline" onClick={() => setStep(0)}>Import Another File</Button>
        </div>
      )}
    </div>
  )
}

function InventoryImportWizard({ onImport }: { onImport: (data: any) => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [columns, setColumns] = useState<string[]>([])
  const [mapping, setMapping] = useState<{ [key: string]: string }>({})
  const [previewData, setPreviewData] = useState<any[]>([])
  const [validationErrors, setValidationErrors] = useState<{ [row: number]: { [col: string]: string } }>({})
  const [duplicates, setDuplicates] = useState<number[]>([])
  const [importSummary, setImportSummary] = useState<{ success: number; failed: number }>({ success: 0, failed: 0 })
  const [step, setStep] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [importStats, setImportStats] = useState({ success: 0, failed: 0 })
  const [fileError, setFileError] = useState("")
  const [fileSuccess, setFileSuccess] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = async (file: File) => {
    setIsProcessing(true)
    setFileError("")
    setFileSuccess("")

    try {
      const ext = file.name.split('.').pop()?.toLowerCase()
      let data: any[] = []

      if (ext === 'csv') {
        const result = await new Promise<Papa.ParseResult<any>>((resolve, reject) => {
          Papa.parse(file, {
            header: true,
            complete: (results) => resolve(results),
            error: (error: Error) => reject(error)
          })
        })
        data = result.data
      } else if (['xlsx', 'xls'].includes(ext!)) {
        const buffer = await file.arrayBuffer()
        const workbook = XLSX.read(buffer)
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        data = XLSX.utils.sheet_to_json(worksheet)
      } else if (ext === 'xml') {
        // XML parsing would go here
        throw new Error('XML import not implemented yet')
      }

      // Extract columns from first row
      const columns = Object.keys(data[0] || {})
      setColumns(columns)
      setPreviewData(data.slice(0, 5)) // Show first 5 rows

      // Validate data
      const errors: { [row: number]: { [col: string]: string } } = {}
      data.forEach((row, i) => {
        if (!row["SKU"]) errors[i] = { ...(errors[i]||{}), "SKU": "SKU required" }
        if (!row["Price"] || isNaN(Number(row["Price"]))) 
          errors[i] = { ...(errors[i]||{}), "Price": "Invalid price" }
        if (!row["Stock"] || isNaN(Number(row["Stock"]))) 
          errors[i] = { ...(errors[i]||{}), "Stock": "Invalid stock" }
        
        // Jewelry-specific validation
        Object.assign(errors[i]||={}, validateDiamondSpecs(row))
        
        if (row["Category"] && !["Rings","Diamonds","Necklaces","Bracelets"].includes(row["Category"])) 
          errors[i] = { ...(errors[i]||{}), "Category": "Unknown category" }
      })

      // Detect duplicates
      const dups = detectDuplicates(data, ["SKU", "GIA Number"])
      
      setValidationErrors(errors)
      setDuplicates(dups)
      setStep(1)

      // Calculate import stats
      const success = data.length - Object.keys(errors).length
      const failed = Object.keys(errors).length
      setImportStats({ success, failed })
      setFileSuccess(`File processed successfully. ${success} valid records, ${failed} errors.`)

    } catch (error: unknown) {
      setFileError(`Error processing file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFile = async (f: File) => {
    setFile(f)
    await processFile(f)
  }

  const handleMap = (col: string, field: string) => {
    setMapping((prev) => ({ ...prev, [col]: field }))
  }

  const handleImport = async () => {
    if (!file) return

    setIsProcessing(true)
    try {
      // Here you would typically send the data to your API
      // For now, we'll simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onImport({
        success: importStats.success,
        failed: importStats.failed,
        data: previewData
      })
      
      setStep(2)
    } catch (error: unknown) {
      setFileError(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      {step === 0 && (
        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 bg-muted cursor-pointer hover:border-emerald-400 transition" onClick={() => fileInputRef.current?.click()}>
          <UploadCloud className="h-10 w-10 mb-2 text-emerald-500" />
          <span className="mb-2">Drag & drop or click to upload CSV, Excel, or XML file</span>
          <Input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls,.xml" className="hidden" onChange={e => e.target.files && handleFile(e.target.files[0])} />
        </div>
      )}
      {step === 1 && (
        <div>
          <h3 className="font-semibold mb-2">Map Columns to Inventory Fields</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            {columns.map((col) => (
              <div key={col} className="flex flex-col items-center">
                <div className="font-medium mb-1">{col}</div>
                <select className="border rounded px-2 py-1" value={mapping[col] || ""} onChange={e => handleMap(col, e.target.value)}>
                  <option value="">-- Map to --</option>
                  {INVENTORY_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            ))}
          </div>
          <h3 className="font-semibold mb-2 mt-6">Data Preview</h3>
          <div className="overflow-x-auto border rounded">
            <table className="min-w-full text-xs">
              <thead>
                <tr>
                  {columns.map(col => <th key={col} className="px-2 py-1 border-b bg-muted font-semibold">{col}</th>)}
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, i) => (
                  <tr key={i}>
                    {columns.map(col => (
                      <td key={col} className="px-2 py-1 border-b">
                        <span className={validationErrors[i]?.[col] ? "text-red-600 font-bold" : ""}>{row[col]}</span>
                        {validationErrors[i]?.[col] && <div className="text-xs text-red-500">{validationErrors[i][col]}</div>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button className="mt-6" onClick={handleImport}>Import Inventory</Button>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Import Summary</h3>
          <div className="flex gap-4 items-center">
            <span className="text-green-600 font-bold">{importSummary.success} Imported</span>
            <span className="text-red-600 font-bold">{importSummary.failed} Failed</span>
          </div>
          <Button variant="outline" onClick={() => setStep(0)}>Import Another File</Button>
        </div>
      )}
    </div>
  )
}

function SystemConfiguration({ formData, setFormData }: { formData: any, setFormData: (f: any) => void }) {
  // Company profile
  const [logo, setLogo] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  // User roles
  const [roles, setRoles] = useState(formData.roles || [
    { name: "Admin", permissions: ["All"] },
    { name: "Sales", permissions: ["View Orders", "Edit Customers"] },
  ])
  // Inventory locations
  const [locations, setLocations] = useState(formData.locations || ["Safe 1", "Safe 2"])
  // Tax/pricing
  const [taxRate, setTaxRate] = useState(formData.taxRate || "8.25")
  const [pricingTier, setPricingTier] = useState(formData.pricingTier || "Standard")
  // Integrations
  const [integrations, setIntegrations] = useState(formData.integrations || { shopify: false, woocommerce: false, stripe: false })
  // Notifications
  const [notifications, setNotifications] = useState(formData.notifications || { email: true, sms: false })
  // Custom fields
  const [customFields, setCustomFields] = useState(formData.customFields || ["PO Number"])

  // Logo upload
  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogo(file)
      setLogoPreview(URL.createObjectURL(file))
      setFormData((f: any) => ({ ...f, logo: file.name }))
    }
  }

  // Add/remove roles
  const addRole = () => setRoles((r: any[]) => [...r, { name: "", permissions: [] }])
  const updateRole = (i: number, key: string, value: any) => setRoles((r: any[]) => r.map((role: any, idx: number) => idx === i ? { ...role, [key]: value } : role))
  const removeRole = (i: number) => setRoles((r: any[]) => r.filter((_: any, idx: number) => idx !== i))

  // Add/remove locations
  const addLocation = () => setLocations((l: any[]) => [...l, ""])
  const updateLocation = (i: number, value: string) => setLocations((l: any[]) => l.map((loc: any, idx: number) => idx === i ? value : loc))
  const removeLocation = (i: number) => setLocations((l: any[]) => l.filter((_: any, idx: number) => idx !== i))

  // Add/remove custom fields
  const addCustomField = () => setCustomFields((f: any[]) => [...f, ""])
  const updateCustomField = (i: number, value: string) => setCustomFields((f: any[]) => f.map((field: any, idx: number) => idx === i ? value : field))
  const removeCustomField = (i: number) => setCustomFields((f: any[]) => f.filter((_: any, idx: number) => idx !== i))

  // Save all config to parent formData
  useEffect(() => {
    setFormData((f: any) => ({
      ...f,
      roles,
      locations,
      taxRate,
      pricingTier,
      integrations,
      notifications,
      customFields,
    }))
  }, [roles, locations, taxRate, pricingTier, integrations, notifications, customFields, setFormData])

  return (
    <div className="space-y-8">
      {/* Company Profile */}
      <div>
        <h3 className="font-semibold mb-2">Company Profile</h3>
        <div className="flex items-center gap-4 mb-2">
          <div className="w-20 h-20 bg-muted rounded flex items-center justify-center overflow-hidden">
            {logoPreview ? <img src={logoPreview} alt="Logo" className="object-contain w-full h-full" /> : <span className="text-xs text-muted-foreground">Logo</span>}
          </div>
          <div>
            <input type="file" accept="image/*" className="hidden" id="logo-upload" onChange={handleLogo} />
            <label htmlFor="logo-upload" className="text-xs text-emerald-600 underline cursor-pointer">Upload Logo</label>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input placeholder="Company Name" value={formData.accountName || ""} onChange={e => setFormData((f: any) => ({ ...f, accountName: e.target.value }))} />
          <Input placeholder="Contact Email" value={formData.email || ""} onChange={e => setFormData((f: any) => ({ ...f, email: e.target.value }))} />
          <Input placeholder="Phone" value={formData.phone || ""} onChange={e => setFormData((f: any) => ({ ...f, phone: e.target.value }))} />
          <Input placeholder="Address" value={formData.address || ""} onChange={e => setFormData((f: any) => ({ ...f, address: e.target.value }))} />
        </div>
      </div>
      {/* User Roles */}
      <div>
        <h3 className="font-semibold mb-2">User Roles & Permissions</h3>
        {roles.map((role: any, i: number) => (
          <div key={i} className="flex gap-2 items-center mb-2">
            <Input className="w-32" placeholder="Role Name" value={role.name} onChange={e => updateRole(i, "name", e.target.value)} />
            <Input className="w-64" placeholder="Permissions (comma separated)" value={role.permissions.join(", ")} onChange={e => updateRole(i, "permissions", e.target.value.split(",").map((p: string) => p.trim()))} />
            <Button size="sm" variant="destructive" onClick={() => removeRole(i)}>Remove</Button>
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={addRole}>Add Role</Button>
      </div>
      {/* Inventory Locations */}
      <div>
        <h3 className="font-semibold mb-2">Inventory Locations</h3>
        {Array.isArray(locations) ? locations.map((loc: any, i: number) => (
          <div key={i} className="flex gap-2 items-center mb-2">
            <Input className="w-64" placeholder="Location Name" value={loc} onChange={e => updateLocation(i, e.target.value)} />
            <Button size="sm" variant="destructive" onClick={() => removeLocation(i)}>Remove</Button>
          </div>
        )) : null}
        <Button size="sm" variant="outline" onClick={addLocation}>Add Location</Button>
      </div>
      {/* Tax & Pricing */}
      <div>
        <h3 className="font-semibold mb-2">Tax & Pricing Rules</h3>
        <div className="flex gap-4 mb-2">
          <Input className="w-32" placeholder="Tax Rate (%)" value={taxRate} onChange={e => setTaxRate(e.target.value)} />
          <Input className="w-48" placeholder="Pricing Tier (e.g. Standard, Wholesale)" value={pricingTier} onChange={e => setPricingTier(e.target.value)} />
        </div>
      </div>
      {/* Integrations */}
      <div>
        <h3 className="font-semibold mb-2">Integration Preferences</h3>
        <div className="flex gap-4 mb-2">
          <label className="flex items-center gap-2"><input type="checkbox" checked={integrations.shopify} onChange={e => setIntegrations((f: any) => ({ ...f, shopify: e.target.checked }))} />Shopify</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={integrations.woocommerce} onChange={e => setIntegrations((f: any) => ({ ...f, woocommerce: e.target.checked }))} />WooCommerce</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={integrations.stripe} onChange={e => setIntegrations((f: any) => ({ ...f, stripe: e.target.checked }))} />Stripe</label>
        </div>
      </div>
      {/* Notifications */}
      <div>
        <h3 className="font-semibold mb-2">Notification & Communication Preferences</h3>
        <div className="flex gap-4 mb-2">
          <label className="flex items-center gap-2"><input type="checkbox" checked={notifications.email} onChange={e => setNotifications((f: any) => ({ ...f, email: e.target.checked }))} />Email</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={notifications.sms} onChange={e => setNotifications((f: any) => ({ ...f, sms: e.target.checked }))} />SMS</label>
        </div>
      </div>
      {/* Custom Fields */}
      <div>
        <h3 className="font-semibold mb-2">Custom Fields</h3>
        {customFields.map((field: any, i: number) => (
          <div key={i} className="flex gap-2 items-center mb-2">
            <Input className="w-64" placeholder="Field Name" value={field} onChange={e => updateCustomField(i, e.target.value)} />
            <Button size="sm" variant="destructive" onClick={() => removeCustomField(i)}>Remove</Button>
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={addCustomField}>Add Custom Field</Button>
      </div>
    </div>
  )
}

function OnboardingDashboard({ step, formData, importStats }: { step: number, formData: any, importStats: any }) {
  // Mock step status
  const stepStatus = [
    { label: "Welcome & Account Setup", status: formData.accountName && formData.email ? "completed" : step === 1 ? "in-progress" : "pending" },
    { label: "Data Import Hub", status: importStats.success > 0 ? "completed" : step === 2 ? "in-progress" : "pending" },
    { label: "System Configuration", status: formData.configDone ? "completed" : step === 3 ? "in-progress" : "pending" },
    { label: "Feature Tour & Training", status: formData.tourDone ? "completed" : step === 4 ? "in-progress" : "pending" },
    { label: "Go-Live Checklist", status: formData.goLiveChecked ? "completed" : step === 5 ? "in-progress" : "pending" },
  ]
  // Calculate completion
  const completed = stepStatus.filter(s => s.status === "completed").length
  const percent = Math.round((completed / stepStatus.length) * 100)
  // Mock timeline
  const timeline = `${7 - completed} days remaining (est.)`
  // Mock next action
  const nextAction = stepStatus.find(s => s.status !== "completed")?.label || "All steps complete!"
  // Mock help
  const help = [
    { label: "Onboarding Guide", link: "#" },
    { label: "Contact Support", link: "mailto:support@jewelia.com" },
    { label: "Live Chat", link: "#" },
  ]
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Onboarding Progress</h2>
        <div className="flex items-center gap-4">
          <Progress value={percent} className="h-3 w-48" />
          <span className="font-semibold text-lg">{percent}% Complete</span>
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Step Status</h3>
        <ul className="space-y-1">
          {stepStatus.map((s, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className={s.status === "completed" ? "text-green-600" : s.status === "in-progress" ? "text-amber-600" : "text-gray-400"}>
                {s.status === "completed" ? "✔" : s.status === "in-progress" ? "●" : "○"}
              </span>
              <span>{s.label}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Data Import Statistics</h3>
        <div className="flex gap-6">
          <div className="bg-muted rounded p-4 flex flex-col items-center">
            <span className="text-emerald-600 font-bold text-lg">{importStats.success}</span>
            <span className="text-xs text-muted-foreground">Imported</span>
          </div>
          <div className="bg-muted rounded p-4 flex flex-col items-center">
            <span className="text-red-600 font-bold text-lg">{importStats.failed}</span>
            <span className="text-xs text-muted-foreground">Failed</span>
          </div>
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Next Recommended Action</h3>
        <div className="bg-emerald-50 border-l-4 border-emerald-400 p-4 rounded">
          <span className="font-medium">{nextAction}</span>
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Help & Support</h3>
        <ul className="space-y-1">
          {help.map((h, i) => (
            <li key={i}><a href={h.link} className="text-emerald-600 underline">{h.label}</a></li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Estimated Timeline</h3>
        <div className="bg-muted rounded p-4 font-medium">{timeline}</div>
      </div>
    </div>
  )
}

function HelpWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    { role: "assistant", content: "Welcome to Jewelia CRM! How can I help you today?" }
  ])
  const [input, setInput] = useState("")

  const handleSend = () => {
    if (!input.trim()) return
    setMessages([...messages, { role: "user", content: input }])
    setInput("")
    // Mock response
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "assistant", content: "I'm here to help! What would you like to know?" }])
    }, 1000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="fixed bottom-4 right-4 rounded-full">
          <MessageCircle className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Help & Support</DialogTitle>
        </DialogHeader>
        <div className="h-[400px] flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 p-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${
                  msg.role === "user" ? "bg-emerald-100" : "bg-muted"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type your message..."
                onKeyDown={e => e.key === "Enter" && handleSend()}
              />
              <Button onClick={handleSend}>Send</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Update TutorialOverlay to only show after mount and ensure pointer-events/z-index
function TutorialOverlay({ step, isVisible, onClose }: { step: number, isVisible: boolean, onClose: () => void }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const content = TUTORIAL_CONTENT[step as keyof typeof TUTORIAL_CONTENT]
  if (!mounted || !isVisible || !content) return null
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] pointer-events-auto">
      <div className="bg-white rounded-lg p-6 max-w-lg mx-4 pointer-events-auto">
        <h3 className="text-xl font-bold mb-2">{content.title}</h3>
        <p className="mb-4">{content.content}</p>
        <div className="aspect-video mb-4">
          <video src={content.video} controls className="w-full rounded" />
        </div>
        <div className="flex justify-end">
          <Button onClick={() => { console.log('Got it clicked'); onClose(); }} className="pointer-events-auto z-[10000]">Got it!</Button>
        </div>
      </div>
    </div>
  )
}

function SampleTemplates() {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Sample Templates</h3>
      <div className="grid gap-4">
        {Object.entries(SAMPLE_TEMPLATES).map(([key, template]) => (
          <div key={key} className="flex items-center justify-between p-4 border rounded">
            <div>
              <div className="font-medium">{template.name}</div>
              <div className="text-sm text-muted-foreground">
                Fields: {template.fields.join(", ")}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => window.open(template.url)}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

function KeyboardShortcuts() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Keyboard className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {Object.entries(SHORTCUTS).map(([key, action]) => (
            <div key={key} className="flex justify-between items-center">
              <kbd className="px-2 py-1 bg-muted rounded text-sm">{key}</kbd>
              <span>{action}</span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

const CRM_SAMPLE_COLUMNS = [
  "Full Name", "Email Address", "Phone Number", "Address", "Company", "Notes"
]
const INVENTORY_SAMPLE_COLUMNS = [
  "SKU", "Description", "Category", "Price", "Stock", "Location", "Image", "Supplier", "GIA Number", "Carat", "Color", "Clarity", "Cut"
]

function generateCSV(columns: string[]) {
  return columns.join(",") + "\n"
}

function downloadFile(filename: string, content: string, type: string = "text/csv") {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Add all advanced templates for Data Import Hub
const DIAMOND_COLUMNS = ["ID", "Shape", "Carat", "Color", "Quality", "Cut", "Certificate", "Status", "Vendor", "Location", "Price"]
const PRODUCT_COLUMNS = ["Image (multiple images)", "Product", "Category", "Price", "Stock", "Status", "SKU"]
const FINISHED_INVENTORY_COLUMNS = ["SKU", "Name", "Category", "Metal", "Weight", "Stones", "Quantity", "Cost", "Price", "Status"]
const RAW_MATERIALS_COLUMNS = ["SKU", "Name", "Type", "Alloy", "Weight", "Thickness", "Quantity", "Cost", "Price", "Status"]
const LOOSE_STONES_COLUMNS = ["SKU", "Name", "Type", "Shape", "Carat", "Color", "Clarity", "Cut", "Quantity", "Cost", "Price", "Status"]
const LABOR_CODES_COLUMNS = ["Code", "Name", "Description", "Time", "Estimate", "Cost", "Price"]
const ITEM_TEMPLATES_COLUMNS = ["Code", "Name", "Category", "Materials", "Labor Codes", "Total Cost", "Base Price"]

// Add all advanced templates for Data Import Hub, now with sample data rows
const ADVANCED_TEMPLATES = [
  {
    label: "Products in Production Pipeline",
    columns: ["Product ID", "Name", "Description", "Category", "Stage", "Assigned Employee", "Start Date", "Estimated Completion", "Status", "Notes"],
    sample: ["PROD-001", "Custom Diamond Ring", "18k gold, 1ct diamond", "Ring", "Setting", "Jane Doe", "2024-06-01", "2024-06-10", "In Progress", "Rush order"],
  },
  {
    label: "Employee Tasks",
    columns: ["Task ID", "Employee ID", "Employee Name", "Task Description", "Related Product/Order", "Start Date", "Due Date", "Status", "Notes"],
    sample: ["TASK-001", "EMP-001", "Jane Doe", "Set diamond in ring", "PROD-001", "2024-06-01", "2024-06-03", "In Progress", ""],
  },
  {
    label: "Production Status",
    columns: ["Product ID", "Name", "Current Stage", "Status", "Last Updated", "Responsible Employee", "Notes"],
    sample: ["PROD-001", "Custom Diamond Ring", "Polishing", "In Progress", "2024-06-05", "John Smith", ""],
  },
  {
    label: "Inventory Status",
    columns: ["SKU", "Name", "Category", "Quantity", "Location", "Status", "Last Counted", "Notes"],
    sample: ["SKU-1001", "Gold Chain", "Necklace", "12", "Safe 1", "Available", "2024-06-01", ""],
  },
  {
    label: "Past Sales",
    columns: ["Sale ID", "Date", "Customer", "Product/SKU", "Quantity", "Price", "Total", "Salesperson", "Payment Method", "Status"],
    sample: ["SALE-001", "2024-05-20", "Emma Thompson", "SKU-1001", "1", "500", "500", "Jane Doe", "Credit Card", "Completed"],
  },
  {
    label: "Equipment & Maintenance",
    columns: ["Equipment ID", "Name", "Type", "Location", "Last Maintenance", "Next Maintenance", "Status", "Notes"],
    sample: ["EQ-001", "Laser Welder", "Welder", "Workshop", "2024-05-01", "2024-08-01", "Operational", ""],
  },
  {
    label: "Current Orders",
    columns: ["Order ID", "Customer", "Date", "Items", "Status", "Expected Delivery", "Salesperson", "Notes"],
    sample: ["ORD-001", "Sophia Lee", "2024-06-01", "SKU-1001:1;SKU-1002:2", "Processing", "2024-06-10", "John Smith", ""],
  },
  {
    label: "Inventory Tags / Barcodes",
    columns: ["SKU", "Tag ID", "Barcode", "Location", "Status", "Notes"],
    sample: ["SKU-1001", "TAG-001", "123456789012", "Safe 1", "Active", ""],
  },
  {
    label: "Employees",
    columns: ["Employee ID", "Name", "Role", "Department", "Email", "Phone", "Production Stage", "Tip Limit", "Schedule", "Status"],
    sample: ["EMP-001", "Jane Doe", "Jeweler", "Production", "jane@jewelia.com", "555-123-4567", "Setting", "100", "Mon-Fri 9-5", "Active"],
  },
  {
    label: "Employee Schedules",
    columns: ["Employee ID", "Name", "Date", "Shift Start", "Shift End", "Role", "Notes"],
    sample: ["EMP-001", "Jane Doe", "2024-06-06", "09:00", "17:00", "Jeweler", ""],
  },
  {
    label: "CAD Files",
    columns: ["Project ID", "Product Name", "CAD File Name", "File Link/Path", "Designer", "Date Uploaded", "Status", "Notes"],
    sample: ["PROJ-001", "Custom Diamond Ring", "ring_v1.cad", "/cad/ring_v1.cad", "Jane Doe", "2024-06-01", "Approved", ""],
  },
  {
    label: "Quality Control",
    columns: ["QC ID", "Product/SKU", "Date", "Inspector", "Result", "Issues Found", "Actions Taken", "Status", "Notes"],
    sample: ["QC-001", "SKU-1001", "2024-06-05", "John Smith", "Pass", "None", "", "Approved", ""],
  },
  {
    label: "Consignor Management",
    columns: ["Consignor ID", "Name", "Contact", "Agreement Date", "Terms", "Status", "Notes"],
    sample: ["CON-001", "Luxury Consignments LLC", "contact@luxconsign.com", "2024-01-01", "50/50 split", "Active", ""],
  },
  {
    label: "Consigned Items",
    columns: ["Item ID", "Consignor ID", "SKU", "Name", "Category", "Value", "Status", "Date Consigned", "Notes"],
    sample: ["ITEM-001", "CON-001", "SKU-2001", "Vintage Brooch", "Brooch", "2000", "Available", "2024-05-01", ""],
  },
  {
    label: "Repairs",
    columns: ["Repair ID", "Customer", "Item", "Issue", "Status", "Technician", "Received", "Due", "Cost", "Notes"],
    sample: ["REP-001", "Emma Thompson", "Diamond Ring", "Loose stone", "In Progress", "Jane Doe", "2024-06-01", "2024-06-10", "150", ""],
  },
  {
    label: "E-commerce Integration Field Mapping",
    columns: ["Platform", "External Field", "Jewelia Field", "Data Type", "Example Value", "Notes"],
    sample: ["Shopify", "product_title", "Name", "string", "Gold Ring", ""],
  },
  {
    label: "Accounts Receivable",
    columns: ["Invoice ID", "Customer", "Date Issued", "Due Date", "Amount", "Balance", "Status", "Related Order", "Notes"],
    sample: ["INV-1001", "Emma Thompson", "2024-06-01", "2024-06-15", "1200", "200", "Partially Paid", "ORD-001", "Deposit received"],
  },
  {
    label: "Accounts Payable",
    columns: ["Bill ID", "Vendor", "Date Issued", "Due Date", "Amount", "Balance", "Status", "Related Purchase", "Notes"],
    sample: ["BILL-1001", "Gold Supplier", "2024-06-01", "2024-06-20", "800", "800", "Unpaid", "PUR-001", ""],
  }
]

function generateCSVWithSample(columns: string[], sample: string[]) {
  return columns.join(",") + "\n" + sample.join(",") + "\n"
}

// Add a reusable CSV upload box component for each data set
function CsvUploadBox({ label, datasetKey, setFormData, onUpload }: { label: string, datasetKey: string, setFormData: (f: any) => void, onUpload: (file: File) => Promise<void> }) {
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const SUPPORTED_EXTENSIONS = ['.csv', '.xlsx', '.xls']
  const isSupportedFile = (file: File | undefined | null) => !!file && SUPPORTED_EXTENSIONS.some(ext => file.name && file.name.toLowerCase().endsWith(ext))

  const handleFile = async (file: File) => {
    setUploading(true)
    setSuccess(null)
    setError(null)
    try {
      await onUpload(file)
      setSuccess(`File '${file.name}' uploaded successfully!`)
      setFormData((f: any) => ({
        ...f,
        uploadedFiles: { ...(f.uploadedFiles || {}), [datasetKey]: true }
      }))
    } catch (e: any) {
      setError(e?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (isSupportedFile(file)) {
      handleFile(file)
    } else if (file) {
      setError('Only CSV or Excel files are supported.')
    }
  }

  return (
    <div
      className={`flex flex-col items-center border-2 border-dashed rounded-lg p-4 bg-muted cursor-pointer transition mb-2 ${dragActive ? 'border-emerald-600 bg-emerald-50' : 'hover:border-emerald-400'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      tabIndex={0}
      role="button"
      aria-label={`Upload ${label} CSV or Excel`}
    >
      <span className="font-medium mb-1">Upload {label} (CSV or Excel)</span>
      <span className="text-xs text-muted-foreground mb-2">Drag & drop or click to browse</span>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        className="hidden"
        onChange={e => isSupportedFile(e.target.files?.[0]) ? handleFile(e.target.files![0]) : setError('Only CSV or Excel files are supported.')}
      />
      <Button
        size="sm"
        variant="outline"
        className="mb-2"
        onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
        disabled={uploading}
      >
        {uploading ? 'Uploading...' : 'Browse'}
      </Button>
      {success && <div className="text-xs text-emerald-700">{success}</div>}
      {error && <div className="text-xs text-red-600">{error}</div>}
    </div>
  )
}

// Backend upload handler for each data set
async function uploadCsvToBackend(dataset: string, file: File) {
  console.log('[CSV UPLOAD] Dataset:', dataset)
  console.log('[CSV UPLOAD] File name:', file.name)
  // Try to parse and log headers if CSV
  if (file.name.endsWith('.csv')) {
    const text = await file.text();
    const [headerLine] = text.split('\n');
    const headers = headerLine.split(',').map(h => h.trim());
    console.log('[CSV UPLOAD] Parsed headers:', headers);
    // Re-create file for upload
    file = new File([text], file.name, { type: file.type });
  }
  const formData = new FormData();
  formData.append('file', file);
  console.log('[CSV UPLOAD] Sending to API:', `/api/import/${dataset}`);
  const res = await fetch(`/api/import/${dataset}`, {
    method: 'POST',
    body: formData,
  });
  let apiResponse;
  try {
    apiResponse = await res.clone().json();
  } catch {
    apiResponse = await res.text();
  }
  console.log('[CSV UPLOAD] API response:', apiResponse);
  if (!res.ok) {
    let errorMsg = 'Upload failed';
    try {
      const error = apiResponse;
      errorMsg = error?.error || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  return apiResponse;
}

function SampleTemplatesSection({ setFormData, formData }: { setFormData: (f: any) => void, formData: any }) {
  const templates = [
    { label: "Accounts Payable", key: "accounts_payable", columns: ["Bill ID", "Vendor", "Date Issued", "Due Date", "Amount", "Balance", "Status", "Related Purchase", "Notes"], sample: ["BILL-1001", "Gold Supplier", "2024-06-01", "2024-06-20", "800", "800", "Unpaid", "PUR-001", ""] },
    { label: "Accounts Receivable", key: "accounts_receivable", columns: ["Invoice ID", "Customer", "Date Issued", "Due Date", "Amount", "Balance", "Status", "Related Order", "Notes"], sample: ["INV-1001", "Emma Thompson", "2024-06-01", "2024-06-15", "1200", "200", "Partially Paid", "ORD-001", "Deposit received"] },
    { label: "CAD Files", key: "cad_files", columns: ["Project ID", "Product Name", "CAD File Name", "File Link/Path", "Designer", "Date Uploaded", "Status", "Notes"], sample: ["PROJ-001", "Custom Diamond Ring", "ring_v1.cad", "/cad/ring_v1.cad", "Jane Doe", "2024-06-01", "Approved", ""] },
    { label: "Consigned Items", key: "consigned_items", columns: ["Item ID", "Consignor ID", "SKU", "Name", "Category", "Value", "Status", "Date Consigned", "Notes"], sample: ["ITEM-001", "CON-001", "SKU-2001", "Vintage Brooch", "Brooch", "2000", "Available", "2024-05-01", ""] },
    { label: "Consignor Management", key: "consignor_management", columns: ["Consignor ID", "Name", "Contact", "Agreement Date", "Terms", "Status", "Notes"], sample: ["CON-001", "Luxury Consignments LLC", "contact@luxconsign.com", "2024-01-01", "50/50 split", "Active", ""] },
    { label: "CRM Data", key: "crm_data", columns: CRM_SAMPLE_COLUMNS, sample: ["Emma Thompson","emma@example.com","555-123-4567","123 Main St, NY","Thompson Jewelers","VIP customer"] },
    { label: "Current Orders", key: "current_orders", columns: ["Order ID", "Customer", "Date", "Items", "Status", "Expected Delivery", "Salesperson", "Notes"], sample: ["ORD-001", "Sophia Lee", "2024-06-01", "SKU-1001:1;SKU-1002:2", "Processing", "2024-06-10", "John Smith", ""] },
    { label: "Diamonds", key: "diamonds", columns: DIAMOND_COLUMNS, sample: ["DIA-001","Round","1.0","G","VS1","Excellent","GIA12345","Available","Diamond Vendor","Safe 1","5000"] },
    { label: "E-commerce Integration Field Mapping", key: "ecommerce_integration_field_mapping", columns: ["Platform", "External Field", "Jewelia Field", "Data Type", "Example Value", "Notes"], sample: ["Shopify", "product_title", "Name", "string", "Gold Ring", ""] },
    { label: "Employee Schedules", key: "employee_schedules", columns: ["Employee ID", "Name", "Date", "Shift Start", "Shift End", "Role", "Notes"], sample: ["EMP-001", "Jane Doe", "2024-06-06", "09:00", "17:00", "Jeweler", ""] },
    { label: "Employee Tasks", key: "employee_tasks", columns: ["Task ID", "Employee ID", "Employee Name", "Task Description", "Related Product/Order", "Start Date", "Due Date", "Status", "Notes"], sample: ["TASK-001", "EMP-001", "Jane Doe", "Set diamond in ring", "PROD-001", "2024-06-01", "2024-06-03", "In Progress", ""] },
    { label: "Employees", key: "employees", columns: ["Employee ID", "Name", "Role", "Department", "Email", "Phone", "Production Stage", "Tip Limit", "Schedule", "Status"], sample: ["EMP-001", "Jane Doe", "Jeweler", "Production", "jane@jewelia.com", "555-123-4567", "Setting", "100", "Mon-Fri 9-5", "Active"] },
    { label: "Equipment & Maintenance", key: "equipment_maintenance", columns: ["Equipment ID", "Name", "Type", "Location", "Last Maintenance", "Next Maintenance", "Status", "Notes"], sample: ["EQ-001", "Laser Welder", "Welder", "Workshop", "2024-05-01", "2024-08-01", "Operational", ""] },
    { label: "Finished Inventory", key: "finished_inventory", columns: FINISHED_INVENTORY_COLUMNS, sample: ["SKU-3001","Platinum Band","Band","Platinum","5.0","Diamond:1.0ct","2","800","1200","Available"] },
    { label: "Inventory Data", key: "inventory_data", columns: INVENTORY_SAMPLE_COLUMNS, sample: ["SKU-1001","Gold Chain","Necklace","500","12","Safe 1","/images/chain.jpg","Gold Supplier","GIA12345","1.0","G","VS1","Round"] },
    { label: "Inventory Status", key: "inventory_status", columns: ["SKU", "Name", "Category", "Quantity", "Location", "Status", "Last Counted", "Notes"], sample: ["SKU-1001", "Gold Chain", "Necklace", "12", "Safe 1", "Available", "2024-06-01", ""] },
    { label: "Inventory Tags / Barcodes", key: "inventory_tags_barcodes", columns: ["SKU", "Tag ID", "Barcode", "Location", "Status", "Notes"], sample: ["SKU-1001", "TAG-001", "123456789012", "Safe 1", "Active", ""] },
    { label: "Item Templates", key: "item_templates", columns: ITEM_TEMPLATES_COLUMNS, sample: ["IT-001","Custom Pendant","Pendant","Gold, Diamond","LAB-001","600","1200"] },
    { label: "Labor Codes", key: "labor_codes", columns: LABOR_CODES_COLUMNS, sample: ["LAB-001","Stone Setting","Set diamond in ring","1","1","50","100"] },
    { label: "Loose Stones", key: "loose_stones", columns: LOOSE_STONES_COLUMNS, sample: ["LS-001","Loose Diamond","Diamond","Round","0.5","F","VS2","Excellent","10","500","800","Available"] },
    { label: "Past Sales", key: "past_sales", columns: ["Sale ID", "Date", "Customer", "Product/SKU", "Quantity", "Price", "Total", "Salesperson", "Payment Method", "Status"], sample: ["SALE-001", "2024-05-20", "Emma Thompson", "SKU-1001", "1", "500", "500", "Jane Doe", "Credit Card", "Completed"] },
    { label: "Production Status", key: "production_status", columns: ["Product ID", "Name", "Current Stage", "Status", "Last Updated", "Responsible Employee", "Notes"], sample: ["PROD-001", "Custom Diamond Ring", "Polishing", "In Progress", "2024-06-05", "John Smith", ""] },
    { label: "Products in Production Pipeline", key: "products_in_production_pipeline", columns: ["Product ID", "Name", "Description", "Category", "Stage", "Assigned Employee", "Start Date", "Estimated Completion", "Status", "Notes"], sample: ["PROD-001", "Custom Diamond Ring", "18k gold, 1ct diamond", "Ring", "Setting", "Jane Doe", "2024-06-01", "2024-06-10", "In Progress", "Rush order"] },
    { label: "Products", key: "products", columns: PRODUCT_COLUMNS, sample: ["/images/ring1.jpg; /images/ring2.jpg","Diamond Ring","Ring","2000","5","Available","SKU-2001"] },
    { label: "Quality Control", key: "quality_control", columns: ["QC ID", "Product/SKU", "Date", "Inspector", "Result", "Issues Found", "Actions Taken", "Status", "Notes"], sample: ["QC-001", "SKU-1001", "2024-06-05", "John Smith", "Pass", "None", "", "Approved", ""] },
    { label: "Raw Materials", key: "raw_materials", columns: RAW_MATERIALS_COLUMNS, sample: ["RM-001","Gold Sheet","Gold","18k","10.0","1.2","3","400","600","Available"] },
    { label: "Repairs", key: "repairs", columns: ["Repair ID", "Customer", "Item", "Issue", "Status", "Technician", "Received", "Due", "Cost", "Notes"], sample: ["REP-001", "Emma Thompson", "Diamond Ring", "Loose stone", "In Progress", "Jane Doe", "2024-06-01", "2024-06-10", "150", ""] },
  ]
  return (
    <div className="mb-8">
      <h3 className="font-semibold text-lg mb-2">Sample Import Templates</h3>
      <p className="text-muted-foreground mb-4">Download sample files with the correct column structure and a sample row for each import type. Use these as a guide to format your data for Jewelia.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map(t => (
          <div key={t.label} className="flex flex-col border rounded p-4 bg-muted">
            <div className="font-medium mb-2">{t.label} Template</div>
            <div className="text-xs text-muted-foreground mb-2">Columns: {t.columns.join(", ")}</div>
            <div className="flex gap-2 mb-2">
              <button className="flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white rounded" onClick={() => downloadFile(`${t.label.toLowerCase().replace(/ /g, '_')}.csv`, generateCSVWithSample(t.columns, t.sample))}>
                <Download className="h-4 w-4" /> CSV
              </button>
              <button className="flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white rounded" onClick={() => downloadFile(`${t.label.toLowerCase().replace(/ /g, '_')}.xlsx`, generateCSVWithSample(t.columns, t.sample), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}> 
                <Download className="h-4 w-4" /> Excel
              </button>
            </div>
            {/* CSV Upload Box for this data set */}
            <CsvUploadBox label={t.label} datasetKey={t.key} setFormData={setFormData} onUpload={file => uploadCsvToBackend(t.key, file)} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function OnboardingWizardPage() {
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [formData, setFormData] = useState<any>({
    companyName: "",
    businessType: "",
    yearsInBusiness: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    mainPhone: "",
    mainPhoneExtension: "",
    website: "",
    firstName: "",
    lastName: "",
    title: "",
    email: "",
    directPhone: "",
    mobilePhone: "",
    primaryProducts: [],
    salesVolume: "",
    employees: "",
    locations: "",
    currentCrm: "",
    timeZone: "",
    dateFormat: "",
    currency: "",
    language: "",
    username: "",
    password: "",
    confirmPassword: "",
    securityQuestion: "",
    securityAnswer: "",
    primaryGoals: [],
    goLiveDate: "",
    specialRequirements: "",
    tos: false,
    privacy: false,
  })
  const [fileError, setFileError] = useState("")
  const [fileSuccess, setFileSuccess] = useState("")
  const [filePreview, setFilePreview] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [resumeAvailable, setResumeAvailable] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const autoSaveInterval = useRef<NodeJS.Timeout | null>(null)
  const [importedData, setImportedData] = useState<ImportedData>({
    customers: [],
    inventory: [],
    errors: { customers: [], inventory: [] },
    stats: { customers: { success: 0, failed: 0 }, inventory: { success: 0, failed: 0 } }
  })
  const [tutorialDismissed, setTutorialDismissed] = useState<{ [step: number]: boolean }>({})

  useEffect(() => {
    setProgress(((step + 1) / steps.length) * 100)
  }, [step])

  useEffect(() => {
    // Check for saved progress
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (saved) setResumeAvailable(true)
  }, [])

  const saveProgress = () => {
    setSaving(true)
    setTimeout(() => {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ step, formData }))
      setSaving(false)
      setResumeAvailable(true)
    }, 500)
  }

  const resumeProgress = () => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (saved) {
      const { step: savedStep, formData: savedData } = JSON.parse(saved)
      setStep(savedStep)
      setFormData(savedData)
    }
  }

  const clearProgress = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY)
    setResumeAvailable(false)
  }

  // Step validation logic
  const REQUIRED_UPLOADS = ["crm_data", "inventory_data"] // add more as needed
  const validateStep = () => {
    switch (step) {
      case 0:
        return formData.companyName && formData.firstName && formData.lastName && formData.email && formData.mainPhone && formData.username && formData.password && formData.confirmPassword && formData.securityQuestion && formData.securityAnswer && formData.tos && formData.privacy && formData.password === formData.confirmPassword
      case 1:
        return REQUIRED_UPLOADS.every(key => formData.uploadedFiles && formData.uploadedFiles[key])
      case 2:
        return formData.configDone
      case 3:
        return formData.tourDone
      case 4:
        return formData.goLiveChecked
      default:
        return false
    }
  }

  // File upload handlers (mocked)
  const handleFileDrop = (e: React.DragEvent, type: string) => {
    e.preventDefault()
    setFileError("")
    setFileSuccess("")
    const file = e.dataTransfer.files[0]
    if (!file) return
    if (!file.name.endsWith(".csv")) {
      setFileError("Only CSV files are supported.")
      return
    }
    // Simulate preview
    setTimeout(() => {
      setFilePreview({ name: file.name, size: file.size, type })
      setFormData((prev: any) => ({ ...prev, [type]: file.name }))
      setFileSuccess(`File '${file.name}' uploaded successfully!`)
    }, 800)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    setFileError("")
    setFileSuccess("")
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.endsWith(".csv")) {
      setFileError("Only CSV files are supported.")
      return
    }
    setTimeout(() => {
      setFilePreview({ name: file.name, size: file.size, type })
      setFormData((prev: any) => ({ ...prev, [type]: file.name }))
      setFileSuccess(`File '${file.name}' uploaded successfully!`)
    }, 800)
  }

  // Auto-save functionality
  useEffect(() => {
    autoSaveInterval.current = setInterval(() => {
      saveProgress()
      setLastSaved(new Date())
    }, 30000) // Auto-save every 30 seconds

    return () => {
      if (autoSaveInterval.current) {
        clearInterval(autoSaveInterval.current)
      }
    }
  }, [step, formData])

  // Keyboard shortcuts
  useHotkeys("alt+n", () => {
    if (step < steps.length - 1 && validateStep()) {
      setStep(s => s + 1)
    }
  }, [step, validateStep])
  useHotkeys("alt+b", () => {
    if (step > 0) {
      setStep(s => s - 1)
    }
  }, [step])
  useHotkeys("alt+s", saveProgress, [saveProgress])
  useHotkeys("alt+h", () => {
    // Toggle help widget
  }, [])
  useHotkeys("alt+d", () => {
    // Download templates
  }, [])
  useHotkeys("alt+c", () => {
    // Toggle chat
  }, [])

  const handleCustomerImport = (data: any) => {
    setImportedData(prev => ({
      ...prev,
      customers: [...prev.customers, ...data.data],
      stats: {
        ...prev.stats,
        customers: {
          success: prev.stats.customers.success + data.success,
          failed: prev.stats.customers.failed + data.failed
        }
      }
    }))
  }

  const handleInventoryImport = (data: any) => {
    setImportedData(prev => ({
      ...prev,
      inventory: [...prev.inventory, ...data.data],
      stats: {
        ...prev.stats,
        inventory: {
          success: prev.stats.inventory.success + data.success,
          failed: prev.stats.inventory.failed + data.failed
        }
      }
    }))
  }

  // Step content
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <WelcomeSetup formData={formData} setFormData={setFormData} onContinue={() => setStep(s => s + 1)} />
        )
      case 1:
        return (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold">Data Import Hub</h2>
            <p className="text-sm sm:text-base text-muted-foreground">Import your CRM and inventory data. Drag and drop CSV files or click to upload.</p>
            <SampleTemplatesSection setFormData={setFormData} formData={formData} />
            {fileError && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle className="text-sm sm:text-base">Error</AlertTitle>
                <AlertDescription className="text-xs sm:text-sm">{fileError}</AlertDescription>
              </Alert>
            )}
            {fileSuccess && (
              <Alert variant="default">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle className="text-sm sm:text-base">Success</AlertTitle>
                <AlertDescription className="text-xs sm:text-sm">{fileSuccess}</AlertDescription>
              </Alert>
            )}
            {filePreview && (
              <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-muted rounded">
                <div className="font-medium mb-1 text-sm sm:text-base">Preview: {filePreview.name}</div>
                <div className="text-xs text-muted-foreground">Size: {filePreview.size} bytes</div>
                <div className="text-xs text-muted-foreground">Type: {filePreview.type}</div>
                <div className="text-xs text-muted-foreground">(Preview of parsed data would appear here.)</div>
              </div>
            )}
          </div>
        )
      case 2:
        return (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold">System Configuration</h2>
            <p className="text-sm sm:text-base text-muted-foreground">Configure your system preferences and settings.</p>
            <SystemConfiguration formData={formData} setFormData={setFormData} />
            <div className="flex flex-col gap-3 sm:gap-4">
              <label className="flex items-center gap-2 text-sm sm:text-base">
                <input type="checkbox" checked={!!formData.configDone} onChange={e => setFormData((f: any) => ({ ...f, configDone: e.target.checked }))} className="min-h-[44px] min-w-[44px]" />
                I have completed my system configuration
              </label>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold">Feature Tour & Training</h2>
            <p className="text-sm sm:text-base text-muted-foreground">Take a guided tour and access training resources.</p>
            <div className="flex flex-col gap-3 sm:gap-4">
              <label className="flex items-center gap-2 text-sm sm:text-base">
                <input type="checkbox" checked={!!formData.tourDone} onChange={e => setFormData((f: any) => ({ ...f, tourDone: e.target.checked }))} className="min-h-[44px] min-w-[44px]" />
                I have completed the feature tour and training
              </label>
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold">Go-Live Checklist</h2>
            <p className="text-sm sm:text-base text-muted-foreground">Final steps before you go live.</p>
            <div className="flex flex-col gap-3 sm:gap-4">
              <label className="flex items-center gap-2 text-sm sm:text-base">
                <input type="checkbox" checked={!!formData.goLiveChecked} onChange={e => setFormData((f: any) => ({ ...f, goLiveChecked: e.target.checked }))} className="min-h-[44px] min-w-[44px]" />
                I have completed all go-live steps
              </label>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  // Load dismissed state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('onboardingTutorialDismissed')
    if (stored) setTutorialDismissed(JSON.parse(stored))
  }, [])

  // Save dismissed state to localStorage
  useEffect(() => {
    localStorage.setItem('onboardingTutorialDismissed', JSON.stringify(tutorialDismissed))
  }, [tutorialDismissed])

  const handleDismissTutorial = () => {
    setTutorialDismissed(prev => ({ ...prev, [step]: true }))
  }

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-6 md:py-10 px-3 sm:px-4 md:px-6 lg:px-8">
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl md:text-2xl onboarding-heading">Client Onboarding Wizard</CardTitle>
              <CardDescription className="text-sm sm:text-base onboarding-subtext">Get started with Jewelia CRM in a few guided steps.</CardDescription>
            </div>
            <div className="flex gap-2">
              <KeyboardShortcuts />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px]">
                      <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Need help? Click to open the help widget</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs mt-2">
              {steps.map((s, i) => (
                <span key={s} className={i === step ? "font-bold text-emerald-600" : "text-muted-foreground"}>
                  {i + 1}
                </span>
              ))}
            </div>
          </div>
          {renderStep()}
          <div className="flex flex-col sm:flex-row sm:justify-between mt-6 sm:mt-8 gap-3 sm:gap-4">
            <Button variant="outline" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} className="min-h-[44px] min-w-[44px] text-xs sm:text-sm">
              Back
            </Button>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button variant="secondary" onClick={saveProgress} disabled={saving} className="min-h-[44px] min-w-[44px] text-xs sm:text-sm">
                {saving ? "Saving..." : "Save & Exit"}
              </Button>
              {resumeAvailable && (
                <Button variant="ghost" onClick={resumeProgress} className="min-h-[44px] min-w-[44px] text-xs sm:text-sm">
                  Resume
                </Button>
              )}
              {resumeAvailable && (
                <Button variant="ghost" onClick={clearProgress} className="min-h-[44px] min-w-[44px] text-xs sm:text-sm">
                  Clear Progress
                </Button>
              )}
              <Button
                onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))}
                disabled={!validateStep() || step === steps.length - 1}
                className="min-h-[44px] min-w-[44px] text-xs sm:text-sm"
              >
                {step === steps.length - 1 ? "Finish" : "Next"}
              </Button>
            </div>
          </div>
          {lastSaved && (
            <div className="text-xs text-muted-foreground mt-3 sm:mt-4">
              Last saved: {lastSaved.toLocaleTimeString()}
            </div>
          )}
        </CardContent>
      </Card>
      <TutorialOverlay step={step} isVisible={!tutorialDismissed[step]} onClose={handleDismissTutorial} />
      <HelpWidget />
    </div>
  )
} 