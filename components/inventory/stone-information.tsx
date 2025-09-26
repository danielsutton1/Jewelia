"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"
import { Plus, Trash2, ChevronDown, ChevronUp, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Stone types
const stoneTypes = [
  { value: "diamond", label: "Diamond" },
  { value: "ruby", label: "Ruby" },
  { value: "sapphire", label: "Sapphire" },
  { value: "emerald", label: "Emerald" },
  { value: "amethyst", label: "Amethyst" },
  { value: "aquamarine", label: "Aquamarine" },
  { value: "citrine", label: "Citrine" },
  { value: "garnet", label: "Garnet" },
  { value: "opal", label: "Opal" },
  { value: "pearl", label: "Pearl" },
  { value: "peridot", label: "Peridot" },
  { value: "tanzanite", label: "Tanzanite" },
  { value: "topaz", label: "Topaz" },
  { value: "tourmaline", label: "Tourmaline" },
  { value: "turquoise", label: "Turquoise" },
  { value: "zircon", label: "Zircon" },
  { value: "alexandrite", label: "Alexandrite" },
  { value: "morganite", label: "Morganite" },
  { value: "spinel", label: "Spinel" },
  { value: "other", label: "Other" },
]

// Stone shapes with icons
const stoneShapes = [
  {
    value: "round",
    label: "Round",
    icon: "○",
  },
  {
    value: "princess",
    label: "Princess",
    icon: "□",
  },
  {
    value: "cushion",
    label: "Cushion",
    icon: "⬭",
  },
  {
    value: "emerald",
    label: "Emerald",
    icon: "▭",
  },
  {
    value: "oval",
    label: "Oval",
    icon: "⬬",
  },
  {
    value: "radiant",
    label: "Radiant",
    icon: "⬙",
  },
  {
    value: "asscher",
    label: "Asscher",
    icon: "⬓",
  },
  {
    value: "marquise",
    label: "Marquise",
    icon: "⬖",
  },
  {
    value: "pear",
    label: "Pear",
    icon: "⬗",
  },
  {
    value: "heart",
    label: "Heart",
    icon: "♥",
  },
  {
    value: "trillion",
    label: "Trillion",
    icon: "△",
  },
  {
    value: "baguette",
    label: "Baguette",
    icon: "▭",
  },
]

// Diamond color grades
const diamondColors = [
  { value: "D", label: "D (Colorless)", description: "Absolutely colorless. The highest color grade." },
  {
    value: "E",
    label: "E (Colorless)",
    description: "Colorless. Only minute traces of color detected by expert gemologists.",
  },
  { value: "F", label: "F (Colorless)", description: "Colorless. Slight color detected by expert gemologists." },
  {
    value: "G",
    label: "G (Near Colorless)",
    description:
      "Near colorless. Color difficult to detect unless compared side by side with diamonds of better grades.",
  },
  { value: "H", label: "H (Near Colorless)", description: "Near colorless. Color slightly detectable." },
  {
    value: "I",
    label: "I (Near Colorless)",
    description: "Near colorless. Color noticeable when compared to diamonds of better grades.",
  },
  {
    value: "J",
    label: "J (Near Colorless)",
    description: "Near colorless. Color noticeable when compared to diamonds of better grades.",
  },
  { value: "K", label: "K (Faint Yellow)", description: "Faint color noticeable." },
  { value: "L", label: "L (Faint Yellow)", description: "Faint color easily noticeable." },
  { value: "M", label: "M (Faint Yellow)", description: "Faint color easily noticeable." },
  { value: "N-Z", label: "N-Z (Very Light to Light Yellow)", description: "Noticeable color." },
]

// Diamond clarity grades
const diamondClarities = [
  { value: "FL", label: "FL (Flawless)", description: "No inclusions or blemishes visible under 10x magnification." },
  {
    value: "IF",
    label: "IF (Internally Flawless)",
    description: "No inclusions visible under 10x magnification, only small blemishes on the surface.",
  },
  {
    value: "VVS1",
    label: "VVS1 (Very Very Slightly Included 1)",
    description: "Inclusions so slight they are difficult for a skilled grader to see under 10x magnification.",
  },
  {
    value: "VVS2",
    label: "VVS2 (Very Very Slightly Included 2)",
    description: "Inclusions difficult for a skilled grader to see under 10x magnification.",
  },
  {
    value: "VS1",
    label: "VS1 (Very Slightly Included 1)",
    description: "Inclusions visible only with difficulty under 10x magnification.",
  },
  {
    value: "VS2",
    label: "VS2 (Very Slightly Included 2)",
    description: "Inclusions visible with slight difficulty under 10x magnification.",
  },
  { value: "SI1", label: "SI1 (Slightly Included 1)", description: "Inclusions visible under 10x magnification." },
  {
    value: "SI2",
    label: "SI2 (Slightly Included 2)",
    description: "Inclusions easily visible under 10x magnification.",
  },
  {
    value: "I1",
    label: "I1 (Included 1)",
    description: "Inclusions obvious under 10x magnification and may affect transparency and brilliance.",
  },
  {
    value: "I2",
    label: "I2 (Included 2)",
    description: "Inclusions very obvious under 10x magnification and likely to affect transparency and brilliance.",
  },
  {
    value: "I3",
    label: "I3 (Included 3)",
    description:
      "Inclusions very obvious under 10x magnification and have a negative effect on transparency and brilliance.",
  },
]

// Diamond cut grades
const diamondCuts = [
  {
    value: "excellent",
    label: "Excellent",
    description: "Maximum fire and brilliance. Reflects nearly all light that enters the diamond.",
  },
  {
    value: "very-good",
    label: "Very Good",
    description: "Reflects nearly as much light as the excellent cut, but for a lower price.",
  },
  {
    value: "good",
    label: "Good",
    description: "Reflects most light that enters. Much less expensive than higher cut grades.",
  },
  { value: "fair", label: "Fair", description: "Still a quality diamond, but may not be as brilliant as a good cut." },
  {
    value: "poor",
    label: "Poor",
    description: "Diamonds that reflect only a small proportion of the light that enters.",
  },
]

// Diamond polish & symmetry
const gradingScales = [
  { value: "excellent", label: "Excellent" },
  { value: "very-good", label: "Very Good" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
]

// Diamond fluorescence
const fluorescenceLevels = [
  { value: "none", label: "None" },
  { value: "faint", label: "Faint" },
  { value: "medium", label: "Medium" },
  { value: "strong", label: "Strong" },
  { value: "very-strong", label: "Very Strong" },
]

// Certification authorities
const certificationAuthorities = [
  { value: "gia", label: "GIA (Gemological Institute of America)" },
  { value: "ags", label: "AGS (American Gem Society)" },
  { value: "igi", label: "IGI (International Gemological Institute)" },
  { value: "hrd", label: "HRD (Hoge Raad voor Diamant)" },
  { value: "egl", label: "EGL (European Gemological Laboratory)" },
  { value: "gcal", label: "GCAL (Gem Certification & Assurance Lab)" },
  { value: "gsi", label: "GSI (Gemological Science International)" },
  { value: "none", label: "Uncertified" },
]

// Color intensity/saturation
const colorIntensities = [
  { value: "faint", label: "Faint" },
  { value: "very-light", label: "Very Light" },
  { value: "light", label: "Light" },
  { value: "medium", label: "Medium" },
  { value: "medium-dark", label: "Medium Dark" },
  { value: "dark", label: "Dark" },
  { value: "very-dark", label: "Very Dark" },
]

// Treatment types
const treatmentTypes = [
  { value: "none", label: "None (Natural)" },
  { value: "heat", label: "Heat Treatment" },
  { value: "irradiation", label: "Irradiation" },
  { value: "fracture-filling", label: "Fracture Filling" },
  { value: "laser-drilling", label: "Laser Drilling" },
  { value: "hpht", label: "HPHT (High Pressure High Temperature)" },
  { value: "coating", label: "Surface Coating" },
  { value: "dyeing", label: "Dyeing" },
  { value: "bleaching", label: "Bleaching" },
  { value: "oiling", label: "Oiling" },
  { value: "waxing", label: "Waxing" },
  { value: "impregnation", label: "Impregnation" },
  { value: "other", label: "Other" },
]

// Stone origins
const stoneOrigins = [
  { value: "afghanistan", label: "Afghanistan" },
  { value: "australia", label: "Australia" },
  { value: "brazil", label: "Brazil" },
  { value: "burma", label: "Burma (Myanmar)" },
  { value: "cambodia", label: "Cambodia" },
  { value: "canada", label: "Canada" },
  { value: "colombia", label: "Colombia" },
  { value: "congo", label: "Congo" },
  { value: "india", label: "India" },
  { value: "madagascar", label: "Madagascar" },
  { value: "malawi", label: "Malawi" },
  { value: "mozambique", label: "Mozambique" },
  { value: "namibia", label: "Namibia" },
  { value: "russia", label: "Russia" },
  { value: "sri-lanka", label: "Sri Lanka" },
  { value: "tanzania", label: "Tanzania" },
  { value: "thailand", label: "Thailand" },
  { value: "usa", label: "USA" },
  { value: "zambia", label: "Zambia" },
  { value: "zimbabwe", label: "Zimbabwe" },
  { value: "lab-created", label: "Lab Created" },
  { value: "unknown", label: "Unknown" },
]

// Phenomena
const phenomenaTypes = [
  { value: "none", label: "None" },
  { value: "asterism", label: "Asterism (Star Effect)" },
  { value: "chatoyancy", label: "Chatoyancy (Cat&apos;s Eye Effect)" },
  { value: "adularescence", label: "Adularescence (Moonstone Effect)" },
  { value: "aventurescence", label: "Aventurescence (Metallic Sparkle)" },
  { value: "color-change", label: "Color Change" },
  { value: "iridescence", label: "Iridescence" },
  { value: "labradorescence", label: "Labradorescence" },
  { value: "opalescence", label: "Opalescence" },
  { value: "orient", label: "Orient (Pearl)" },
  { value: "play-of-color", label: "Play of Color (Opal)" },
  { value: "schiller", label: "Schiller Effect" },
]

// Form schema
const primaryStoneSchema = z.object({
  stoneType: z.string().min(1, { message: "Stone type is required" }),
  stoneShape: z.string().min(1, { message: "Stone shape is required" }),
  caratWeight: z.coerce.number().min(0.001, { message: "Weight must be greater than 0" }).optional(),
  length: z.coerce.number().min(0.1, { message: "Length must be greater than 0" }).optional(),
  width: z.coerce.number().min(0.1, { message: "Width must be greater than 0" }).optional(),
  depth: z.coerce.number().min(0.1, { message: "Depth must be greater than 0" }).optional(),

  // Diamond-specific fields
  colorGrade: z.string().optional(),
  clarityGrade: z.string().optional(),
  cutGrade: z.string().optional(),
  polish: z.string().optional(),
  symmetry: z.string().optional(),
  fluorescence: z.string().optional(),
  certification: z.string().optional(),
  certificationNumber: z.string().optional(),

  // Colored stone fields
  colorIntensity: z.string().optional(),
  treatment: z.string().optional(),
  treatmentDetails: z.string().optional(),
  origin: z.string().optional(),
  phenomena: z.string().optional(),

  // Additional fields
  notes: z.string().optional(),
})

const accentStoneSchema = z.object({
  stoneType: z.string().min(1, { message: "Stone type is required" }),
  stoneShape: z.string().min(1, { message: "Stone shape is required" }),
  caratWeight: z.coerce.number().min(0.001, { message: "Weight must be greater than 0" }).optional(),
  quantity: z.coerce.number().int().min(1, { message: "Quantity must be at least 1" }).default(1),
  notes: z.string().optional(),
})

const stoneInformationSchema = z.object({
  primaryStone: primaryStoneSchema,
  accentStones: z.array(accentStoneSchema).optional(),
})

type StoneInformationValues = z.infer<typeof stoneInformationSchema>

interface StoneInformationProps {
  onSave?: (data: StoneInformationValues) => void
  initialData?: StoneInformationValues
  readOnly?: boolean
}

export default function StoneInformation({ onSave, initialData, readOnly = false }: StoneInformationProps) {
  const [activeTab, setActiveTab] = useState("primary")
  const [showDiamondFields, setShowDiamondFields] = useState(false)
  const [showColoredStoneFields, setShowColoredStoneFields] = useState(false)
  const [expandedAccentStones, setExpandedAccentStones] = useState<number[]>([0])

  // Initialize form
  const form = useForm<StoneInformationValues>({
    resolver: zodResolver(stoneInformationSchema) as any,
    defaultValues: initialData || {
      primaryStone: {
        stoneType: "",
        stoneShape: "",
      },
      accentStones: [],
    },
  })

  // Setup field array for accent stones
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "accentStones",
  })

  // Watch for stone type changes to show/hide specific fields
  const primaryStoneType = form.watch("primaryStone.stoneType")

  // Update field visibility based on stone type
  useEffect(() => {
    if (primaryStoneType === "diamond") {
      setShowDiamondFields(true)
      setShowColoredStoneFields(false)
    } else if (primaryStoneType && primaryStoneType !== "diamond") {
      setShowDiamondFields(false)
      setShowColoredStoneFields(true)
    } else {
      setShowDiamondFields(false)
      setShowColoredStoneFields(false)
    }
  }, [primaryStoneType])

  // Toggle accent stone expansion
  const toggleAccentStone = (index: number) => {
    if (expandedAccentStones.includes(index)) {
      setExpandedAccentStones(expandedAccentStones.filter((i) => i !== index))
    } else {
      setExpandedAccentStones([...expandedAccentStones, index])
    }
  }

  // Add a new accent stone
  const addAccentStone = () => {
    append({
      stoneType: "",
      stoneShape: "",
      quantity: 1,
    })
    // Expand the newly added accent stone
    setExpandedAccentStones([...expandedAccentStones, fields.length])
  }

  // Handle form submission
  const onSubmit = (data: StoneInformationValues) => {
    if (onSave) {
      onSave(data)
    }
    console.log("Stone information saved:", data)
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="primary" className="text-sm">
            Primary Stone
          </TabsTrigger>
          <TabsTrigger value="accent" className="text-sm">
            Accent Stones
            {fields.length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-primary/10">
                {fields.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <TabsContent value="primary" className="mt-4 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl">Primary Stone Details</CardTitle>
                  <CardDescription>
                    Enter detailed information about the main stone in this jewelry item
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Basic Stone Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="primaryStone.stoneType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stone Type*</FormLabel>
                          <Select disabled={readOnly} onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select stone type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {stoneTypes.map((stone) => (
                                <SelectItem key={stone.value} value={stone.value}>
                                  {stone.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="primaryStone.caratWeight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight (carats)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(e.target.valueAsNumber)}
                              value={field.value || ""}
                              disabled={readOnly}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Stone Shape Selector */}
                  <FormField
                    control={form.control}
                    name="primaryStone.stoneShape"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stone Shape*</FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-6 gap-2">
                            {stoneShapes.map((shape) => (
                              <div
                                key={shape.value}
                                className={cn(
                                  "flex flex-col items-center justify-center p-2 border rounded-md cursor-pointer transition-all",
                                  field.value === shape.value
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-border hover:border-primary/50",
                                  readOnly && "opacity-50 cursor-not-allowed",
                                )}
                                onClick={() => {
                                  if (!readOnly) field.onChange(shape.value)
                                }}
                              >
                                <div className="text-2xl mb-1">{shape.icon}</div>
                                <div className="text-xs text-center">{shape.label}</div>
                              </div>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Stone Measurements */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Measurements (mm)</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="primaryStone.length"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Length</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                value={field.value || ""}
                                disabled={readOnly}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="primaryStone.width"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Width</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                value={field.value || ""}
                                disabled={readOnly}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="primaryStone.depth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Depth</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                value={field.value || ""}
                                disabled={readOnly}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Diamond-specific fields */}
                  {showDiamondFields && (
                    <div className="space-y-6 pt-4 border-t">
                      <h3 className="text-lg font-medium">Diamond Specifications</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="primaryStone.colorGrade"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center justify-between">
                                <FormLabel>Color Grade</FormLabel>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-sm">
                                      <p>Diamond color grades range from D (colorless) to Z (light yellow or brown).</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                              <Select disabled={readOnly} onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select color grade" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {diamondColors.map((color) => (
                                    <SelectItem key={color.value} value={color.value}>
                                      {color.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                {field.value && diamondColors.find((c) => c.value === field.value)?.description}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="primaryStone.clarityGrade"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center justify-between">
                                <FormLabel>Clarity Grade</FormLabel>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-sm">
                                      <p>Diamond clarity grades range from FL (Flawless) to I3 (Included).</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                              <Select disabled={readOnly} onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select clarity grade" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {diamondClarities.map((clarity) => (
                                    <SelectItem key={clarity.value} value={clarity.value}>
                                      {clarity.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                {field.value && diamondClarities.find((c) => c.value === field.value)?.description}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="primaryStone.cutGrade"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cut Grade</FormLabel>
                              <Select disabled={readOnly} onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select cut grade" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {diamondCuts.map((cut) => (
                                    <SelectItem key={cut.value} value={cut.value}>
                                      {cut.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                {field.value && diamondCuts.find((c) => c.value === field.value)?.description}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="primaryStone.polish"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Polish</FormLabel>
                              <Select disabled={readOnly} onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select polish grade" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {gradingScales.map((grade) => (
                                    <SelectItem key={grade.value} value={grade.value}>
                                      {grade.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="primaryStone.symmetry"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Symmetry</FormLabel>
                              <Select disabled={readOnly} onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select symmetry grade" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {gradingScales.map((grade) => (
                                    <SelectItem key={grade.value} value={grade.value}>
                                      {grade.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="primaryStone.fluorescence"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fluorescence</FormLabel>
                              <Select disabled={readOnly} onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select fluorescence level" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {fluorescenceLevels.map((level) => (
                                    <SelectItem key={level.value} value={level.value}>
                                      {level.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="primaryStone.certification"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Certification</FormLabel>
                                <Select disabled={readOnly} onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select certification authority" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {certificationAuthorities.map((authority) => (
                                      <SelectItem key={authority.value} value={authority.value}>
                                        {authority.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {form.watch("primaryStone.certification") &&
                            form.watch("primaryStone.certification") !== "none" && (
                              <FormField
                                control={form.control}
                                name="primaryStone.certificationNumber"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Certificate Number</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Enter certificate number" {...field} disabled={readOnly} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Colored stone fields */}
                  {showColoredStoneFields && (
                    <div className="space-y-6 pt-4 border-t">
                      <h3 className="text-lg font-medium">Colored Stone Specifications</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="primaryStone.colorIntensity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Color Intensity/Saturation</FormLabel>
                              <Select disabled={readOnly} onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select color intensity" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {colorIntensities.map((intensity) => (
                                    <SelectItem key={intensity.value} value={intensity.value}>
                                      {intensity.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="primaryStone.phenomena"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center justify-between">
                                <FormLabel>Phenomena</FormLabel>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-sm">
                                      <p>
                                        Special optical effects like asterism (star effect), chatoyancy (cat&apos;s eye),
                                        color change, etc.
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                              <Select disabled={readOnly} onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select phenomena" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {phenomenaTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="primaryStone.treatment"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Treatment Status</FormLabel>
                                <Select disabled={readOnly} onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select treatment type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {treatmentTypes.map((type) => (
                                      <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {form.watch("primaryStone.treatment") && form.watch("primaryStone.treatment") !== "none" && (
                            <FormField
                              control={form.control}
                              name="primaryStone.treatmentDetails"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Treatment Details</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Enter treatment details"
                                      className="resize-none"
                                      {...field}
                                      disabled={readOnly}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        </div>

                        <FormField
                          control={form.control}
                          name="primaryStone.origin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Origin</FormLabel>
                              <Select disabled={readOnly} onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select origin" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {stoneOrigins.map((origin) => (
                                    <SelectItem key={origin.value} value={origin.value}>
                                      {origin.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div className="pt-4 border-t">
                    <FormField
                      control={form.control}
                      name="primaryStone.notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter any additional details about this stone"
                              className="resize-none min-h-[100px]"
                              {...field}
                              disabled={readOnly}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="accent" className="mt-4 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-xl">Accent Stones</CardTitle>
                      <CardDescription>Add details for any accent or side stones in this jewelry item</CardDescription>
                    </div>
                    {!readOnly && (
                      <Button type="button" onClick={addAccentStone} size="sm" className="h-8">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Accent Stone
                      </Button>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {fields.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="mb-2">No accent stones added yet</div>
                      {!readOnly && (
                        <Button type="button" onClick={addAccentStone} variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-1" />
                          Add Accent Stone
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {fields.map((field, index) => (
                        <div key={field.id} className="border rounded-md overflow-hidden">
                          <div
                            className="flex justify-between items-center p-3 bg-muted cursor-pointer"
                            onClick={() => toggleAccentStone(index)}
                          >
                            <div className="font-medium">
                              Accent Stone {index + 1}
                              {form.watch(`accentStones.${index}.stoneType`) && (
                                <span className="ml-2 text-muted-foreground">
                                  (
                                  {
                                    stoneTypes.find((s) => s.value === form.watch(`accentStones.${index}.stoneType`))
                                      ?.label
                                  }
                                  )
                                </span>
                              )}
                              {form.watch(`accentStones.${index}.quantity`) > 1 && (
                                <Badge variant="outline" className="ml-2">
                                  Qty: {form.watch(`accentStones.${index}.quantity`)}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center">
                              {!readOnly && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    remove(index)
                                    setExpandedAccentStones(expandedAccentStones.filter((i) => i !== index))
                                  }}
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                              {expandedAccentStones.includes(index) ? (
                                <ChevronUp className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                          </div>

                          {expandedAccentStones.includes(index) && (
                            <div className="p-4 space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                  control={form.control}
                                  name={`accentStones.${index}.stoneType`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Stone Type*</FormLabel>
                                      <Select
                                        disabled={readOnly}
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select stone type" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {stoneTypes.map((stone) => (
                                            <SelectItem key={stone.value} value={stone.value}>
                                              {stone.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name={`accentStones.${index}.stoneShape`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Stone Shape*</FormLabel>
                                      <Select
                                        disabled={readOnly}
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select shape" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {stoneShapes.map((shape) => (
                                            <SelectItem key={shape.value} value={shape.value}>
                                              <div className="flex items-center">
                                                <span className="mr-2">{shape.icon}</span>
                                                {shape.label}
                                              </div>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name={`accentStones.${index}.quantity`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Quantity</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          min="1"
                                          step="1"
                                          {...field}
                                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                          value={field.value || ""}
                                          disabled={readOnly}
                                        />
                                      </FormControl>
                                      <FormDescription>Number of stones of this type</FormDescription>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name={`accentStones.${index}.caratWeight`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Weight (carats)</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          placeholder="0.00"
                                          {...field}
                                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                          value={field.value || ""}
                                          disabled={readOnly}
                                        />
                                      </FormControl>
                                      <FormDescription>
                                        {form.watch(`accentStones.${index}.quantity`) > 1
                                          ? "Total weight for all stones"
                                          : "Weight of the stone"}
                                      </FormDescription>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name={`accentStones.${index}.notes`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Notes</FormLabel>
                                      <FormControl>
                                        <Textarea
                                          placeholder="Enter any additional details"
                                          className="resize-none"
                                          {...field}
                                          disabled={readOnly}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {!readOnly && fields.length > 0 && (
                <div className="flex justify-end">
                  <Button type="button" onClick={addAccentStone} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Another Accent Stone
                  </Button>
                </div>
              )}
            </TabsContent>

            {!readOnly && (
              <div className="mt-6 flex justify-end">
                <Button type="submit">Save Stone Information</Button>
              </div>
            )}
          </form>
        </Form>
      </Tabs>
    </div>
  )
}
