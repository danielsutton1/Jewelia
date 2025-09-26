type MetalType = 'gold' | 'silver' | 'platinum' | 'palladium'
type MetalPurity = '24k' | '22k' | '18k' | '14k' | '10k' | '925' | '999' | '950' | '900'

const PURITY_MULTIPLIERS: Record<MetalPurity, number> = {
  '24k': 1.0,
  '22k': 0.916,
  '18k': 0.75,
  '14k': 0.585,
  '10k': 0.417,
  '925': 0.925,
  '999': 0.999,
  '950': 0.95,
  '900': 0.9,
}

// Mock metal prices (in production, these would come from an API)
const METAL_PRICES: Record<MetalType, number> = {
  gold: 2000, // $2000 per troy ounce
  silver: 25, // $25 per troy ounce
  platinum: 1000, // $1000 per troy ounce
  palladium: 800, // $800 per troy ounce
}

export function calculateMetalValue(
  metalType: MetalType,
  metalPurity: MetalPurity,
  weight: number,
  weightUnit: 'grams' | 'troy-oz' | 'oz'
): number {
  // Convert weight to troy ounces if needed
  let weightInTroyOz = weight
  if (weightUnit === 'grams') {
    weightInTroyOz = weight / 31.1035 // Convert grams to troy ounces
  } else if (weightUnit === 'oz') {
    weightInTroyOz = weight * 0.911458 // Convert avoirdupois ounces to troy ounces
  }

  // Calculate base metal value
  const baseValue = weightInTroyOz * METAL_PRICES[metalType]

  // Apply purity multiplier
  const pureValue = baseValue * PURITY_MULTIPLIERS[metalPurity]

  return pureValue
}

// Example usage:
// const value = calculateMetalValue('gold', '18k', 10, 'grams')
// console.log(`Value: $${value.toFixed(2)}`) 