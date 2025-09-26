import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StoneShapeIcon } from "./stone-shape-icon"

interface StoneInformationDisplayProps {
  stoneData: any
  showAccentStones?: boolean
}

export function StoneInformationDisplay({ stoneData, showAccentStones = true }: StoneInformationDisplayProps) {
  if (!stoneData) return null

  const { primaryStone, accentStones } = stoneData

  // Helper function to get label from value
  const getLabelFromValue = (array: any[], value: string) => {
    const item = array.find((item) => item.value === value)
    return item ? item.label : value
  }

  // Stone types
  const stoneTypes = [
    { value: "diamond", label: "Diamond" },
    { value: "ruby", label: "Ruby" },
    { value: "sapphire", label: "Sapphire" },
    { value: "emerald", label: "Emerald" },
    { value: "amethyst", label: "Amethyst" },
    // ... other stone types
  ]

  // Stone shapes
  const stoneShapes = [
    { value: "round", label: "Round" },
    { value: "princess", label: "Princess" },
    { value: "cushion", label: "Cushion" },
    { value: "emerald", label: "Emerald" },
    { value: "oval", label: "Oval" },
    // ... other shapes
  ]

  return (
    <div className="space-y-4">
      {primaryStone && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <StoneShapeIcon shape={primaryStone.stoneShape} className="mr-2" />
              {getLabelFromValue(stoneTypes, primaryStone.stoneType)}
              <Badge variant="outline" className="ml-2">
                Primary
              </Badge>
            </CardTitle>
            <CardDescription>
              {primaryStone.caratWeight && `${primaryStone.caratWeight} carats`}
              {primaryStone.stoneShape && ` • ${getLabelFromValue(stoneShapes, primaryStone.stoneShape)}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {primaryStone.length && primaryStone.width && (
                <div>
                  <span className="text-muted-foreground">Dimensions:</span> {primaryStone.length} ×{" "}
                  {primaryStone.width}
                  {primaryStone.depth ? ` × ${primaryStone.depth}` : ""} mm
                </div>
              )}

              {primaryStone.colorGrade && (
                <div>
                  <span className="text-muted-foreground">Color:</span> {primaryStone.colorGrade}
                </div>
              )}

              {primaryStone.clarityGrade && (
                <div>
                  <span className="text-muted-foreground">Clarity:</span> {primaryStone.clarityGrade}
                </div>
              )}

              {primaryStone.cutGrade && (
                <div>
                  <span className="text-muted-foreground">Cut:</span>{" "}
                  {primaryStone.cutGrade.charAt(0).toUpperCase() + primaryStone.cutGrade.slice(1)}
                </div>
              )}

              {primaryStone.certification && primaryStone.certification !== "none" && (
                <div>
                  <span className="text-muted-foreground">Certification:</span>{" "}
                  {primaryStone.certification.toUpperCase()}
                  {primaryStone.certificationNumber && ` #${primaryStone.certificationNumber}`}
                </div>
              )}

              {primaryStone.colorIntensity && (
                <div>
                  <span className="text-muted-foreground">Color Intensity:</span>{" "}
                  {primaryStone.colorIntensity.replace(/-/g, " ")}
                </div>
              )}

              {primaryStone.origin && primaryStone.origin !== "unknown" && (
                <div>
                  <span className="text-muted-foreground">Origin:</span>{" "}
                  {primaryStone.origin.charAt(0).toUpperCase() + primaryStone.origin.slice(1).replace(/-/g, " ")}
                </div>
              )}

              {primaryStone.phenomena && primaryStone.phenomena !== "none" && (
                <div>
                  <span className="text-muted-foreground">Phenomena:</span> {primaryStone.phenomena.replace(/-/g, " ")}
                </div>
              )}

              {primaryStone.treatment && primaryStone.treatment !== "none" && (
                <div>
                  <span className="text-muted-foreground">Treatment:</span> {primaryStone.treatment.replace(/-/g, " ")}
                  {primaryStone.treatmentDetails && ` (${primaryStone.treatmentDetails})`}
                </div>
              )}
            </div>

            {primaryStone.notes && (
              <div className="mt-4 pt-4 border-t text-sm">
                <span className="text-muted-foreground">Notes:</span> {primaryStone.notes}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {showAccentStones && accentStones && accentStones.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Accent Stones ({accentStones.length})</h3>
          <div className="space-y-2">
            {accentStones.map((stone: any, index: number) => (
              <Card key={index} className="overflow-hidden">
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <StoneShapeIcon shape={stone.stoneShape} size="sm" className="mr-2" />
                    <div>
                      <span className="font-medium">{getLabelFromValue(stoneTypes, stone.stoneType)}</span>
                      {stone.quantity > 1 && (
                        <Badge variant="outline" className="ml-2">
                          Qty: {stone.quantity}
                        </Badge>
                      )}
                      {stone.caratWeight && (
                        <span className="text-sm text-muted-foreground ml-2">{stone.caratWeight} ct</span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {getLabelFromValue(stoneShapes, stone.stoneShape)}
                  </div>
                </div>
                {stone.notes && <div className="px-3 pb-3 text-sm text-muted-foreground">{stone.notes}</div>}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
