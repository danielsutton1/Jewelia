"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { QRCodeSVG } from "qrcode.react"
import { Download, Printer } from "lucide-react"

interface QRCodeDialogProps {
  equipment: any
  open: boolean
  onClose: () => void
}

export function QRCodeDialog({ equipment, open, onClose }: QRCodeDialogProps) {
  if (!equipment) return null

  const qrValue = JSON.stringify({
    id: equipment.id,
    name: equipment.name,
    type: equipment.type,
    serialNumber: equipment.serialNumber,
    url: `https://jewelia-crm.com/equipment/${equipment.id}`,
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>QR Code for {equipment.name}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-6">
          <QRCodeSVG value={qrValue} size={200} level="H" includeMargin={true} />
          <p className="mt-4 text-sm text-center text-muted-foreground">
            Scan this QR code to access equipment details, maintenance history, and booking options.
          </p>
          <div className="mt-2 text-center">
            <p className="text-sm font-medium">{equipment.name}</p>
            <p className="text-xs text-muted-foreground">{equipment.id}</p>
          </div>
        </div>

        <DialogFooter>
          <div className="flex w-full gap-2">
            <Button variant="outline" className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button variant="outline" className="flex-1">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
