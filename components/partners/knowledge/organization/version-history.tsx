import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { translations } from "../translations"

interface VersionHistoryProps {
  articleId: number
  language: string
}

export function VersionHistory({ articleId, language }: VersionHistoryProps) {
  const t = (translations as any)[language] || translations.en

  // Mock version history data
  const versions = [
    {
      version: "2.1",
      date: "2023-04-18",
      author: "Emma Wilson",
      changes: "Updated tool recommendations and added troubleshooting section",
    },
    {
      version: "2.0",
      date: "2023-02-10",
      author: "David Chen",
      changes: "Major revision with new step-by-step instructions and images",
    },
    {
      version: "1.5",
      date: "2022-11-05",
      author: "Emma Wilson",
      changes: "Added quality control section and updated common issues",
    },
    {
      version: "1.0",
      date: "2022-08-22",
      author: "Michael Brown",
      changes: "Initial document creation",
    },
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Version History</h3>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Version</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Changes</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {versions.map((version, index) => (
            <TableRow key={version.version}>
              <TableCell>
                {index === 0 ? <Badge variant="default">{version.version} (Current)</Badge> : version.version}
              </TableCell>
              <TableCell>{version.date}</TableCell>
              <TableCell>{version.author}</TableCell>
              <TableCell>{version.changes}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
