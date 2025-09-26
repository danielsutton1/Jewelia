"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertCircle,
  DollarSign,
  PlusCircle,
  Trash2,
  BarChart4,
  Percent,
  Tag,
  ShoppingCart,
  TrendingUp,
} from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"

// Metal price constants (per gram)
const METAL_PRICES = {
  "gold-10k": 25.5,
  "gold-14k": 35.75,
  "gold-18k": 45.9,
  "gold-24k": 61.2,
  "silver-925": 0.85,
  "silver-958": 0.95,
  "silver-999": 1.05,
  "platinum-950": 31.25,
  "platinum-900": 29.5,
  "palladium-950": 27.8,
}

// Chart colors
const COLORS = [
  "#0088FE", // Blue
  "#00C49F", // Green
  "#FFBB28", // Yellow
  "#FF8042", // Orange
  "#8884D8", // Purple
]

// Form schema for validation
const pricingFormSchema = z.object({
  // Cost components
  metalType: z.string(),
  metalWeight: z.coerce.number().min(0, "Weight must be positive"),
  metalPurity: z.string(),
  laborCost: z.coerce.number().min(0, "Labor cost must be positive"),
  additionalMaterials: z.array(
    z.object({
      name: z.string().min(1, "Name is required"),
      cost: z.coerce.number().min(0, "Cost must be positive"),
    }),
  ),
  overheadPercentage: z.coerce.number().min(0, "Percentage must be positive").max(100, "Percentage cannot exceed 100"),

  // Pricing strategy
  markupPercentage: z.coerce.number().min(0, "Markup must be positive"),
  salePrice: z.coerce.number().optional(),
  minimumPrice: z.coerce.number().min(0, "Minimum price must be positive"),

  // Volume pricing tiers
  volumePricingTiers: z.array(
    z.object({
      quantity: z.coerce.number().min(2, "Quantity must be at least 2"),
      discountPercentage: z.coerce.number().min(0, "Discount must be positive").max(100, "Discount cannot exceed 100"),
    }),
  ),
})

type PricingFormValues = z.infer<typeof pricingFormSchema>

// Stone cost item type
type StoneCostItem = {
  id: string
  name: string
  quantity: number
  caratWeight: number
  costPerCarat: number
  totalCost: number
}

// Additional material type
type AdditionalMaterial = {
  id: string
  name: string
  cost: number
}

// Volume pricing tier type
type VolumePricingTier = {
  id: string
  quantity: number
  discountPercentage: number
  price: number
}

// Chart configuration
const chartConfig = {
  Metal: {
    label: "Metal",
    color: COLORS[0],
  },
  Stones: {
    label: "Stones",
    color: COLORS[1],
  },
  Labor: {
    label: "Labor",
    color: COLORS[2],
  },
  Materials: {
    label: "Materials",
    color: COLORS[3],
  },
  Overhead: {
    label: "Overhead",
    color: COLORS[4],
  },
}

export function PricingBreakdown() {
  // State for stone costs
  const [stoneCosts, setStoneCosts] = useState<StoneCostItem[]>([])
  const [newStoneName, setNewStoneName] = useState('')
  const [newStoneQuantity, setNewStoneQuantity] = useState(1)
  const [newStoneCaratWeight, setNewStoneCaratWeight] = useState(0)
  const [newStoneCostPerCarat, setNewStoneCostPerCarat] = useState(0)
  
  // State for additional materials
  const [additionalMaterials, setAdditionalMaterials] = useState<AdditionalMaterial[]>([])
  const [newMaterialName, setNewMaterialName] = useState('')
  const [newMaterialCost, setNewMaterialCost] = useState(0)
  
  // State for volume pricing tiers
  const [volumePricingTiers, setVolumePricingTiers] = useState<VolumePricingTier[]>([])
  const [newTierQuantity, setNewTierQuantity] = useState(2)
  const [newTierDiscount, setNewTierDiscount] = useState(5)
  
  // Calculated values
  const [totalStoneCost, setTotalStoneCost] = useState(0)
  const [totalAdditionalMaterialsCost, setTotalAdditionalMaterialsCost] = useState(0)
  const [metalCost, setMetalCost] = useState(0)
  const [overheadCost, setOverheadCost] = useState(0)
  const [totalCost, setTotalCost] = useState(0)
  const [wholesalePrice, setWholesalePrice] = useState(0)
  const [msrpPrice, setMsrpPrice] = useState(0)
  const [profitMargin, setProfitMargin] = useState(0)
  const [profitAmount, setProfitAmount] = useState(0)
  
  // Form setup
  const form = useForm<PricingFormValues>({
    resolver: zodResolver(pricingFormSchema),
    defaultValues: {
      metalType: 'gold',
      metalWeight: 5,
      metalPurity: 'gold-14k',
      laborCost: 150,
      additionalMaterials: [],
      overheadPercentage: 15,
      markupPercentage: 50,
      salePrice: undefined,
      minimumPrice: 0,
      volumePricingTiers: []
    }
  })
  
  const watchedValues = form.watch()
  
  // Add stone cost item
  const addStoneCost = () => {
    if (!newStoneName || newStoneQuantity <= 0 || newStoneCaratWeight <= 0 || newStoneCostPerCarat <= 0) {
      return
    }
    
    const totalCost = newStoneQuantity * newStoneCaratWeight * newStoneCostPerCarat
    
    setStoneCosts([
      ...stoneCosts,
      {
        id: Date.now().toString(),
        name: newStoneName,
        quantity: newStoneQuantity,
        caratWeight: newStoneCaratWeight,
        costPerCarat: newStoneCostPerCarat,
        totalCost
      }
    ])
    
    // Reset form fields
    setNewStoneName('')
    setNewStoneQuantity(1)
    setNewStoneCaratWeight(0)
    setNewStoneCostPerCarat(0)
  }
  
  // Remove stone cost item
  const removeStoneCost = (id: string) => {
    setStoneCosts(stoneCosts.filter(item => item.id !== id))
  }
  
  // Add additional material
  const addAdditionalMaterial = () => {
    if (!newMaterialName || newMaterialCost <= 0) {
      return
    }
    
    setAdditionalMaterials([
      ...additionalMaterials,
      {
        id: Date.now().toString(),
        name: newMaterialName,
        cost: newMaterialCost
      }
    ])
    
    // Reset form fields
    setNewMaterialName('')
    setNewMaterialCost(0)
  }
  
  // Remove additional material
  const removeAdditionalMaterial = (id: string) => {
    setAdditionalMaterials(additionalMaterials.filter(item => item.id !== id))
  }
  
  // Add volume pricing tier
  const addVolumePricingTier = () => {
    if (newTierQuantity < 2 || newTierDiscount <= 0 || newTierDiscount > 100) {
      return
    }
    
    // Calculate the price for this tier based on wholesale price and discount
    const price = wholesalePrice * (1 - newTierDiscount / 100)
    
    setVolumePricingTiers([
      ...volumePricingTiers,
      {
        id: Date.now().toString(),
        quantity: newTierQuantity,
        discountPercentage: newTierDiscount,
        price
      }
    ])
    
    // Reset form fields
    setNewTierQuantity(2)
    setNewTierDiscount(5)
  }
  
  // Remove volume pricing tier
  const removeVolumePricingTier = (id: string) => {
    setVolumePricingTiers(volumePricingTiers.filter(item => item.id !== id))
  }
  
  // Calculate metal cost based on weight and purity
  useEffect(() => {
    const { metalWeight, metalPurity } = watchedValues
    const pricePerGram = METAL_PRICES[metalPurity as keyof typeof METAL_PRICES] || 0
    const calculatedMetalCost = metalWeight * pricePerGram
    setMetalCost(calculatedMetalCost)
  }, [watchedValues.metalWeight, watchedValues.metalPurity])
  
  // Calculate total stone cost
  useEffect(() => {
    const calculatedTotalStoneCost = stoneCosts.reduce((sum, item) => sum + item.totalCost, 0)
    setTotalStoneCost(calculatedTotalStoneCost)
  }, [stoneCosts, watchedValues])
  
  // Calculate total additional materials cost
  useEffect(() => {
    const calculatedTotalAdditionalMaterialsCost = additionalMaterials.reduce((sum, item) => sum + item.cost, 0)
    setTotalAdditionalMaterialsCost(calculatedTotalAdditionalMaterialsCost)
  }, [additionalMaterials, watchedValues])
  
  // Calculate overhead cost
  useEffect(() => {
    const { overheadPercentage, laborCost } = watchedValues
    const baseCost = metalCost + totalStoneCost + totalAdditionalMaterialsCost + laborCost
    const calculatedOverheadCost = baseCost * (overheadPercentage / 100)
    setOverheadCost(calculatedOverheadCost)
  }, [watchedValues, metalCost, totalStoneCost, totalAdditionalMaterialsCost])
  
  // Calculate total cost
  useEffect(() => {
    const { laborCost } = watchedValues
    const calculatedTotalCost = metalCost + totalStoneCost + laborCost + totalAdditionalMaterialsCost + overheadCost
    setTotalCost(calculatedTotalCost)
  }, [watchedValues, metalCost, totalStoneCost, totalAdditionalMaterialsCost, overheadCost])
  
  // Calculate wholesale price
  useEffect(() => {
    const { markupPercentage } = watchedValues
    const calculatedWholesalePrice = totalCost * (1 + markupPercentage / 100)
    setWholesalePrice(calculatedWholesalePrice)
  }, [watchedValues, totalCost])
  
  // Calculate MSRP (suggested retail price) - typically 2-2.5x wholesale
  useEffect(() => {
    const calculatedMsrpPrice = wholesalePrice * 2.2
    setMsrpPrice(calculatedMsrpPrice)
  }, [wholesalePrice, watchedValues])
  
  // Calculate profit margin
  useEffect(() => {
    const priceToUse = watchedValues.salePrice || wholesalePrice
    
    if (priceToUse > 0 && totalCost > 0) {
      const calculatedProfitMargin = ((priceToUse - totalCost) / priceToUse) * 100
      setProfitMargin(calculatedProfitMargin)
      setProfitAmount(priceToUse - totalCost)
    } else {
      setProfitMargin(0)
      setProfitAmount(0)
    }
  }, [watchedValues, wholesalePrice, totalCost])
  
  // Update volume pricing tiers when wholesale price changes
  useEffect(() => {
    setVolumePricingTiers(prevTiers => 
      prevTiers.map(tier => ({
        ...tier,
        price: wholesalePrice * (1 - tier.discountPercentage / 100)
      }))
    )
  }, [wholesalePrice])
  
  // Prepare data for cost breakdown chart
  const costBreakdownData = [
    { name: 'Metal', value: metalCost },
    { name: 'Stones', value: totalStoneCost },
    { name: 'Labor', value: watchedValues.laborCost },
    { name: 'Materials', value: totalAdditionalMaterialsCost },
    { name: 'Overhead', value: overheadCost }
  ]
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
  }
  
  const [pricing, setPricing] = useState({
    basePrice: 0,
    additionalCosts: 0,
    finalPrice: 0
  });

  const calculateBasePrice = () => {
    const { metalType, metalWeight, metalPurity, laborCost } = watchedValues;
    const metalPrice = METAL_PRICES[metalPurity as keyof typeof METAL_PRICES] || 0;
    return (metalPrice * metalWeight) + laborCost;
  };

  const calculateAdditionalCosts = () => {
    const { overheadPercentage } = watchedValues;
    const basePrice = calculateBasePrice();
    const overhead = (basePrice * overheadPercentage) / 100;
    return overhead + totalStoneCost + totalAdditionalMaterialsCost;
  };

  const calculatePricing = () => {
    // Calculate base price
    const basePrice = calculateBasePrice();
    
    // Calculate additional costs
    const additionalCosts = calculateAdditionalCosts();
    
    // Calculate final price
    const finalPrice = basePrice + additionalCosts;
    
    // Update state
    setPricing({
      basePrice,
      additionalCosts,
      finalPrice
    });
  };

  // Recalculate whenever watched values change
  useEffect(() => {
    calculatePricing();
  }, [watchedValues, totalStoneCost, totalAdditionalMaterialsCost]);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Pricing Breakdown</CardTitle>
        <CardDescription>
          Calculate costs, set pricing strategy, and analyze profit margins
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="cost-components" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cost-components">Cost Components</TabsTrigger>
            <TabsTrigger value="pricing-strategy">Pricing Strategy</TabsTrigger>
            <TabsTrigger value="profit-analysis">Profit Analysis</TabsTrigger>
          </TabsList>
          
          {/* Cost Components Tab */}
          <TabsContent value="cost-components">
            <Form {...form}>
              <div className="space-y-6">
                {/* Metal Cost Section */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <DollarSign className="mr-2 h-5 w-5 text-primary" />
                    Metal Cost
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="metalType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Metal Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select metal type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="gold">Gold</SelectItem>
                              <SelectItem value="silver">Silver</SelectItem>
                              <SelectItem value="platinum">Platinum</SelectItem>
                              <SelectItem value="palladium">Palladium</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="metalWeight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight (grams)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="metalPurity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Purity</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select purity" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="gold-10k">Gold 10K</SelectItem>
                              <SelectItem value="gold-14k">Gold 14K</SelectItem>
                              <SelectItem value="gold-18k">Gold 18K</SelectItem>
                              <SelectItem value="gold-24k">Gold 24K</SelectItem>
                              <SelectItem value="silver-925">Silver 925 (Sterling)</SelectItem>
                              <SelectItem value="silver-958">Silver 958 (Britannia)</SelectItem>
                              <SelectItem value="silver-999">Silver 999 (Fine)</SelectItem>
                              <SelectItem value="platinum-950">Platinum 950</SelectItem>
                              <SelectItem value="platinum-900">Platinum 900</SelectItem>
                              <SelectItem value="palladium-950">Palladium 950</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Current price: {formatCurrency(METAL_PRICES[watchedValues.metalPurity as keyof typeof METAL_PRICES] || 0)}/gram
                    </span>
                    <Badge variant="outline" className="ml-auto">
                      Metal Cost: {formatCurrency(metalCost)}
                    </Badge>
                  </div>
                </div>
                
                {/* Stone Costs Section */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <DollarSign className="mr-2 h-5 w-5 text-primary" />
                    Stone Costs
                  </h3>
                  
                  {/* Stone costs table */}
                  {stoneCosts.length > 0 && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Stone</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Carat Weight</TableHead>
                          <TableHead>Cost/Carat</TableHead>
                          <TableHead>Total Cost</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stoneCosts.map((stone) => (
                          <TableRow key={stone.id}>
                            <TableCell>{stone.name}</TableCell>
                            <TableCell>{stone.quantity}</TableCell>
                            <TableCell>{stone.caratWeight.toFixed(2)} ct</TableCell>
                            <TableCell>{formatCurrency(stone.costPerCarat)}</TableCell>
                            <TableCell>{formatCurrency(stone.totalCost)}</TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => removeStoneCost(stone.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                  
                  {/* Add stone form */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
                    <div>
                      <FormLabel>Stone Name</FormLabel>
                      <Input 
                        value={newStoneName} 
                        onChange={(e) => setNewStoneName(e.target.value)}
                        placeholder="Diamond, Sapphire, etc."
                      />
                    </div>
                    <div>
                      <FormLabel>Quantity</FormLabel>
                      <Input 
                        type="number" 
                        min="1"
                        value={newStoneQuantity} 
                        onChange={(e) => setNewStoneQuantity(Number.parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <FormLabel>Carat Weight</FormLabel>
                      <Input 
                        type="number" 
                        step="0.01"
                        value={newStoneCaratWeight} 
                        onChange={(e) => setNewStoneCaratWeight(Number.parseFloat(e.target.value))}
                      />
                    </div>
                    <div>
                      <FormLabel>Cost per Carat</FormLabel>
                      <Input 
                        type="number" 
                        step="0.01"
                        value={newStoneCostPerCarat} 
                        onChange={(e) => setNewStoneCostPerCarat(Number.parseFloat(e.target.value))}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button 
                        type="button" 
                        onClick={addStoneCost}
                        className="w-full"
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Stone
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex justify-end">
                    <Badge variant="outline">
                      Total Stone Cost: {formatCurrency(totalStoneCost)}
                    </Badge>
                  </div>
                </div>
                
                {/* Labor Cost Section */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <DollarSign className="mr-2 h-5 w-5 text-primary" />
                    Labor Cost
                  </h3>
                  <FormField
                    control={form.control}
                    name="laborCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Labor Cost</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormDescription>
                          Include design, fabrication, setting, and finishing costs
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Additional Materials Section */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <DollarSign className="mr-2 h-5 w-5 text-primary" />
                    Additional Materials
                  </h3>
                  
                  {/* Additional materials table */}
                  {additionalMaterials.length > 0 && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Material</TableHead>
                          <TableHead>Cost</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {additionalMaterials.map((material) => (
                          <TableRow key={material.id}>
                            <TableCell>{material.name}</TableCell>
                            <TableCell>{formatCurrency(material.cost)}</TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => removeAdditionalMaterial(material.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                  
                  {/* Add material form */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <FormLabel>Material Name</FormLabel>
                      <Input 
                        value={newMaterialName} 
                        onChange={(e) => setNewMaterialName(e.target.value)}
                        placeholder="Findings, chain, etc."
                      />
                    </div>
                    <div>
                      <FormLabel>Cost</FormLabel>
                      <Input 
                        type="number" 
                        step="0.01"
                        value={newMaterialCost} 
                        onChange={(e) => setNewMaterialCost(Number.parseFloat(e.target.value))}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button 
                        type="button" 
                        onClick={addAdditionalMaterial}
                        className="w-full"
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Material
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex justify-end">
                    <Badge variant="outline">
                      Total Materials Cost: {formatCurrency(totalAdditionalMaterialsCost)}
                    </Badge>
                  </div>
                </div>
                
                {/* Overhead Allocation Section */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <DollarSign className="mr-2 h-5 w-5 text-primary" />
                    Overhead Allocation
                  </h3>
                  <FormField
                    control={form.control}
                    name="overheadPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Overhead Percentage</FormLabel>
                        <div className="flex items-center space-x-4">
                          <FormControl className="flex-1">
                            <Slider
                              defaultValue={[field.value]}
                              max={100}
                              step={1}
                              onValueChange={(vals) => field.onChange(vals[0])}
                            />
                          </FormControl>
                          <div className="w-16">
                            <Input
                              type="number"
                              value={field.value}
                              onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                            />
                          </div>
                          <span>%</span>
                        </div>
                        <FormDescription>
                          Percentage of base costs to allocate for overhead expenses
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="mt-2 flex justify-end">
                    <Badge variant="outline">
                      Overhead Cost: {formatCurrency(overheadCost)}
                    </Badge>
                  </div>
                </div>
                
                {/* Total Cost Summary */}
                <div className="bg-primary/10 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Total Cost</h3>
                    <span className="text-xl font-bold">{formatCurrency(totalCost)}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-2">
                    <div className="text-center p-2 bg-background rounded">
                      <div className="text-sm text-muted-foreground">Metal</div>
                      <div>{formatCurrency(metalCost)}</div>
                    </div>
                    <div className="text-center p-2 bg-background rounded">
                      <div className="text-sm text-muted-foreground">Stones</div>
                      <div>{formatCurrency(totalStoneCost)}</div>
                    </div>
                    <div className="text-center p-2 bg-background rounded">
                      <div className="text-sm text-muted-foreground">Labor</div>
                      <div>{formatCurrency(watchedValues.laborCost)}</div>
                    </div>
                    <div className="text-center p-2 bg-background rounded">
                      <div className="text-sm text-muted-foreground">Materials</div>
                      <div>{formatCurrency(totalAdditionalMaterialsCost)}</div>
                    </div>
                    <div className="text-center p-2 bg-background rounded">
                      <div className="text-sm text-muted-foreground">Overhead</div>
                      <div>{formatCurrency(overheadCost)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </Form>
          </TabsContent>
          
          {/* Pricing Strategy Tab */}
          <TabsContent value="pricing-strategy">
            <div className="space-y-6">
              {/* Markup Section */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <Percent className="mr-2 h-5 w-5 text-primary" />
                  Markup Strategy
                </h3>
                <FormField
                  control={form.control}
                  name="markupPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Markup Percentage</FormLabel>
                      <div className="flex items-center space-x-4">
                        <FormControl className="flex-1">
                          <Slider
                            defaultValue={[field.value]}
                            max={200}
                            step={1}
                            onValueChange={(vals) => field.onChange(vals[0])}
                          />
                        </FormControl>
                        <div className="w-16">
                          <Input
                            type="number"
                            value={field.value}
                            onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                          />
                        </div>
                        <span>%</span>
                      </div>
                      <FormDescription>
                        Percentage to add to total cost for profit
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Volume Pricing Section */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <ShoppingCart className="mr-2 h-5 w-5 text-primary" />
                  Volume Pricing
                </h3>
                
                {/* Volume pricing tiers table */}
                {volumePricingTiers.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {volumePricingTiers.map((tier) => (
                        <TableRow key={tier.id}>
                          <TableCell>{tier.quantity}+</TableCell>
                          <TableCell>{tier.discountPercentage}%</TableCell>
                          <TableCell>{formatCurrency(tier.price)}</TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => removeVolumePricingTier(tier.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                
                {/* Add tier form */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <FormLabel>Quantity</FormLabel>
                    <Input 
                      type="number" 
                      min="2"
                      value={newTierQuantity} 
                      onChange={(e) => setNewTierQuantity(Number.parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <FormLabel>Discount Percentage</FormLabel>
                    <Input 
                      type="number" 
                      min="0"
                      max="100"
                      step="1"
                      value={newTierDiscount} 
                      onChange={(e) => setNewTierDiscount(Number.parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      type="button" 
                      onClick={addVolumePricingTier}
                      className="w-full"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Tier
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Price Summary */}
              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-background p-3 rounded-lg">
                    <div className="text-sm text-muted-foreground">Wholesale Price</div>
                    <div className="text-xl font-bold">{formatCurrency(wholesalePrice)}</div>
                    <div className="text-xs text-muted-foreground mt-1">Base price with markup</div>
                  </div>
                  
                  <div className="bg-background p-3 rounded-lg">
                    <div className="text-sm text-muted-foreground">MSRP</div>
                    <div className="text-xl font-bold">{formatCurrency(msrpPrice)}</div>
                    <div className="text-xs text-muted-foreground mt-1">Suggested retail price</div>
                  </div>
                  
                  <div className="bg-background p-3 rounded-lg">
                    <div className="text-sm text-muted-foreground">Profit Margin</div>
                    <div className="text-xl font-bold">{profitMargin.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground mt-1">Based on wholesale price</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Profit Analysis Tab */}
          <TabsContent value="profit-analysis">
            <div className="space-y-6">
              {/* Profit Summary */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                  Profit Analysis
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-background p-3 rounded-lg">
                    <div className="text-sm text-muted-foreground">Total Cost</div>
                    <div className="text-lg font-medium">{formatCurrency(totalCost)}</div>
                    <div className="text-xs text-muted-foreground mt-1">All costs included</div>
                  </div>
                  
                  <div className="bg-background p-3 rounded-lg">
                    <div className="text-sm text-muted-foreground">Wholesale Price</div>
                    <div className="text-lg font-medium">{formatCurrency(wholesalePrice)}</div>
                    <div className="text-xs text-muted-foreground mt-1">Base selling price</div>
                  </div>
                  
                  <div className="bg-background p-3 rounded-lg">
                    <div className="text-sm text-muted-foreground">Profit Amount</div>
                    <div className="text-lg font-medium">{formatCurrency(profitAmount)}</div>
                    <div className="text-xs text-muted-foreground mt-1">Per unit sold</div>
                  </div>
                </div>
                
                {/* Cost Breakdown Chart */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-4">Cost Breakdown</h4>
                  <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={costBreakdownData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {costBreakdownData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </div>
              
              {/* Breakeven Analysis */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Breakeven Analysis</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-background p-3 rounded-lg">
                      <div className="text-sm text-muted-foreground">Breakeven Price</div>
                      <div className="text-lg font-medium">{formatCurrency(totalCost)}</div>
                      <div className="text-xs text-muted-foreground mt-1">Price needed to cover all costs</div>
                    </div>
                    
                    <div className="bg-background p-3 rounded-lg">
                      <div className="text-sm text-muted-foreground">Minimum Viable Price</div>
                      <div className="text-lg font-medium">{formatCurrency(totalCost * 1.2)}</div>
                      <div className="text-xs text-muted-foreground mt-1">Price needed for 20% margin</div>
                    </div>
                    
                    <div className="bg-background p-3 rounded-lg">
                      <div className="text-sm text-muted-foreground">Target Price</div>
                      <div className="text-lg font-medium">{formatCurrency(totalCost * 1.5)}</div>
                      <div className="text-xs text-muted-foreground mt-1">Price needed for 33% margin</div>
                    </div>
                  </div>
                  
                  <div className="bg-background p-4 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Price Sensitivity Analysis</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Price Point</TableHead>
                          <TableHead>Profit</TableHead>
                          <TableHead>Margin</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>{formatCurrency(totalCost * 0.9)}</TableCell>
                          <TableCell className="text-destructive">{formatCurrency(totalCost * 0.9 - totalCost)}</TableCell>
                          <TableCell className="text-destructive">-11.11%</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>{formatCurrency(totalCost)}</TableCell>
                          <TableCell>{formatCurrency(0)}</TableCell>
                          <TableCell>0.00%</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>{formatCurrency(totalCost * 1.25)}</TableCell>
                          <TableCell>{formatCurrency(totalCost * 0.25)}</TableCell>
                          <TableCell>20.00%</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>{formatCurrency(totalCost * 1.5)}</TableCell>
                          <TableCell>{formatCurrency(totalCost * 0.5)}</TableCell>
                          <TableCell>33.33%</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>{formatCurrency(totalCost * 2)}</TableCell>
                          <TableCell>{formatCurrency(totalCost)}</TableCell>
                          <TableCell>50.00%</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
              
              {/* Competitive Analysis */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Market Positioning</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-background p-3 rounded-lg">
                      <div className="text-sm text-muted-foreground">Budget Market</div>
                      <div className="text-xs text-muted-foreground mt-1">20-30% margin</div>
                      <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-blue-500 rounded-full ${
                            profitMargin >= 20 && profitMargin <= 30 ? 'bg-green-500' : 'bg-muted-foreground/30'
                          }`} 
                          style={{ width: '100%' }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="bg-background p-3 rounded-lg">
                      <div className="text-sm text-muted-foreground">Mid-Market</div>
                      <div className="text-xs text-muted-foreground mt-1">30-50% margin</div>
                      <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-blue-500 rounded-full ${
                            profitMargin > 30 && profitMargin <= 50 ? 'bg-green-500' : 'bg-muted-foreground/30'
                          }`} 
                          style={{ width: '100%' }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="bg-background p-3 rounded-lg">
                      <div className="text-sm text-muted-foreground">Luxury Market</div>
                      <div className="text-xs text-muted-foreground mt-1">50%+ margin</div>
                      <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-blue-500 rounded-full ${
                            profitMargin > 50 ? 'bg-green-500' : 'bg-muted-foreground/30'
                          }`} 
                          style={{ width: '100%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-background p-4 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Pricing Recommendations</h4>
                    <ul className="space-y-2 text-sm">
                      {profitMargin < 20 && (
                        <li className="flex items-start">
                          <span className="text-yellow-500 mr-2">•</span>
                          Consider increasing the price to achieve at least a 20% profit margin.
                        </li>
                      )}
                      {profitMargin < 0 && (
                        <li className="flex items-start">
                          <span className="text-red-500 mr-2">•</span>
                          This item is currently priced below cost. Increase the price immediately or review costs.
                        </li>
                      )}
                      {totalStoneCost > totalCost * 0.6 && (
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          Stone costs represent a high percentage of total cost. Consider alternative stones or suppliers.
                        </li>
                      )}
                      {watchedValues.laborCost > totalCost * 0.5 && (
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          Labor costs are high relative to materials. Consider streamlining production.
                        </li>
                      )}
                      {profitMargin >= 20 && profitMargin <= 30 && (
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          This item is positioned in the budget market segment.
                        </li>
                      )}
                      {profitMargin > 30 && profitMargin <= 50 && (
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          This item is positioned in the mid-market segment.
                        </li>
                      )}
                      {profitMargin > 50 && (
                        <li className="flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          This item is positioned in the luxury market segment.
                        </li>
                      )}
                      {volumePricingTiers.length === 0 && (
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          Consider adding volume pricing tiers to encourage larger purchases.
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <div className="flex justify-end space-x-2 p-6 border-t">
        <Button variant="outline" onClick={() => form.reset()}>
          Reset
        </Button>
        <Button onClick={() => form.handleSubmit((data) => console.log(data))()}>
          Save Pricing
        </Button>
      </div>
    </Card>
  )
}
