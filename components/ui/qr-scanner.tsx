"use client";

import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { 
  QrCode, 
  Camera, 
  X, 
  UserPlus, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Building2,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

interface ContactData {
  name: string;
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
  website?: string;
  linkedin?: string;
  location?: string;
  bio?: string;
  profileUrl?: string;
}

interface QRScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContactFound: (contact: ContactData) => void;
}

export function QRScanner({ open, onOpenChange, onContactFound }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<ContactData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Parse vCard data
  const parseVCard = (vCardText: string): ContactData => {
    const contact: ContactData = { name: "Unknown Contact" };
    
    const lines = vCardText.split(/\r?\n/);
    for (const line of lines) {
      if (line.startsWith('FN:')) {
        contact.name = line.substring(3);
      } else if (line.startsWith('TITLE:')) {
        contact.title = line.substring(6);
      } else if (line.startsWith('ORG:')) {
        contact.company = line.substring(4);
      } else if (line.startsWith('EMAIL:')) {
        contact.email = line.substring(6);
      } else if (line.startsWith('TEL:')) {
        contact.phone = line.substring(4);
      } else if (line.startsWith('URL:')) {
        const url = line.substring(4);
        if (url.includes('linkedin.com')) {
          contact.linkedin = url;
        } else {
          contact.website = url;
        }
      } else if (line.startsWith('ADR:;;')) {
        const parts = line.substring(5).split(';');
        contact.location = parts[2] || parts[1] || parts[0];
      } else if (line.startsWith('NOTE:')) {
        contact.bio = line.substring(5);
      }
    }

    // Extract profile URL if present
    const profileMatch = vCardText.match(/Profile: (https?:\/\/[^\s]+)/);
    if (profileMatch) {
      contact.profileUrl = profileMatch[1];
    }

    return contact;
  };

  // Start camera stream
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error("Unable to access camera. Please check permissions.");
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  // Scan QR code from video stream
  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data for QR detection
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    // Simple QR detection simulation (in real app, use a QR library like jsQR)
    // For demo purposes, we'll simulate finding a QR code after a delay
    setTimeout(() => {
      // Simulate QR code detection
      const mockVCard = `BEGIN:VCARD
VERSION:3.0
FN:Jane Smith
ORG:Jewelry Designs Inc.
TITLE:Senior Designer
EMAIL:jane@jewelrydesigns.com
TEL:+1 555-987-6543
URL:https://jewelrydesigns.com
URL:https://linkedin.com/in/janesmith
ADR:;;Los Angeles, CA;;;
NOTE:Specializing in custom engagement rings and luxury jewelry design
END:VCARD

Profile: https://jewelia.com/profile/jane-smith`;

      const contact = parseVCard(mockVCard);
      setScannedData(contact);
      stopCamera();
      setIsProcessing(false);
    }, 2000);
  };

  // Handle connection request
  const handleConnect = async () => {
    if (!scannedData) return;
    
    setIsProcessing(true);
    
    // Simulate sending connection request
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success(`Connection request sent to ${scannedData.name}`);
    onContactFound(scannedData);
    onOpenChange(false);
    setIsProcessing(false);
  };

  // Reset scanner
  const resetScanner = () => {
    setScannedData(null);
    setIsProcessing(false);
    if (open) {
      startCamera();
    }
  };

  // Handle dialog open/close
  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
      setScannedData(null);
    }

    return () => {
      stopCamera();
    };
  }, [open]);

  // Start scanning when camera is ready
  useEffect(() => {
    if (isScanning && videoRef.current) {
      const video = videoRef.current;
      const handleCanPlay = () => {
        scanQRCode();
      };
      video.addEventListener('canplay', handleCanPlay);
      return () => video.removeEventListener('canplay', handleCanPlay);
    }
  }, [isScanning]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-emerald-600" />
            Scan QR Code
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!scannedData ? (
            <>
              {/* Camera View */}
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 object-cover"
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
                
                {/* Scanning Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-48 h-48 border-2 border-emerald-500 rounded-lg">
                      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-emerald-500"></div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-emerald-500"></div>
                      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-emerald-500"></div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-emerald-500"></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 bg-emerald-500/20 rounded-lg animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Scanning Status */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-black/70 text-white text-center py-2 px-4 rounded-lg">
                    <div className="flex items-center justify-center gap-2">
                      <Camera className="h-4 w-4 animate-pulse" />
                      <span className="text-sm">Position QR code in frame</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="px-6 pb-4">
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Point your camera at a Jewelia QR code
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    The QR code should contain contact information
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Contact Preview */}
              <div className="px-6">
                <Card className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16 border-2 border-emerald-200">
                        <AvatarFallback className="bg-emerald-100 text-emerald-700 text-lg">
                          {scannedData.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {scannedData.name}
                        </h3>
                        {scannedData.title && (
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {scannedData.title}
                          </p>
                        )}
                        {scannedData.company && (
                          <div className="flex items-center gap-1 mt-1">
                            <Building2 className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {scannedData.company}
                            </span>
                          </div>
                        )}
                      </div>
                      <Badge className="bg-emerald-500 text-white">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Found
                      </Badge>
                    </div>

                    {/* Contact Details */}
                    <div className="mt-4 space-y-2">
                      {scannedData.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-emerald-500" />
                          <span className="text-gray-600 dark:text-gray-300">{scannedData.email}</span>
                        </div>
                      )}
                      {scannedData.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-emerald-500" />
                          <span className="text-gray-600 dark:text-gray-300">{scannedData.phone}</span>
                        </div>
                      )}
                      {scannedData.website && (
                        <div className="flex items-center gap-2 text-sm">
                          <Globe className="h-4 w-4 text-emerald-500" />
                          <span className="text-gray-600 dark:text-gray-300 truncate">{scannedData.website}</span>
                        </div>
                      )}
                      {scannedData.location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-emerald-500" />
                          <span className="text-gray-600 dark:text-gray-300">{scannedData.location}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="px-6 pb-6 space-y-3">
                <Button 
                  onClick={handleConnect}
                  disabled={isProcessing}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending Request...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Send Connection Request
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={resetScanner}
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Scan Another Code
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 