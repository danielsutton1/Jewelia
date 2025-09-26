import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export interface DiamondSpecifications {
  clarity: string;
  color: string;
  cut: string;
  caratWeight: number;
  fluorescence?: string;
  polish?: string;
  symmetry?: string;
  measurements?: { length: number; width: number; depth: number };
  depthPercentage?: number;
  tablePercentage?: number;
  gradingLab?: string;
  reportNumber?: string;
}

export function DiamondSpecificationsCard({ specs }: { specs: DiamondSpecifications }) {
  if (!specs) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Diamond Specifications</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="text-sm space-y-1">
          <li><b>Clarity:</b> {specs.clarity}</li>
          <li><b>Color:</b> {specs.color}</li>
          <li><b>Cut:</b> {specs.cut}</li>
          <li><b>Carat Weight:</b> {specs.caratWeight} ct</li>
          {specs.fluorescence && <li><b>Fluorescence:</b> {specs.fluorescence}</li>}
          {specs.polish && <li><b>Polish:</b> {specs.polish}</li>}
          {specs.symmetry && <li><b>Symmetry:</b> {specs.symmetry}</li>}
          {specs.measurements && (
            <li>
              <b>Measurements:</b> {specs.measurements.length} x {specs.measurements.width} x {specs.measurements.depth} mm
            </li>
          )}
          {specs.depthPercentage && <li><b>Depth %:</b> {specs.depthPercentage}</li>}
          {specs.tablePercentage && <li><b>Table %:</b> {specs.tablePercentage}</li>}
          {specs.gradingLab && <li><b>Grading Lab:</b> {specs.gradingLab}</li>}
          {specs.reportNumber && <li><b>Report #:</b> {specs.reportNumber}</li>}
        </ul>
      </CardContent>
    </Card>
  );
} 
 
 