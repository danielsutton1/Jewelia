"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { QRCodeCanvas } from "qrcode.react";
import { 
  Download, 
  Share2, 
  Copy, 
  CheckCircle, 
  QrCode, 
  Smartphone,
  Mail,
  Linkedin,
  Globe,
  MapPin,
  Building2
} from "lucide-react";
import { toast } from "sonner";
import { copyToClipboard } from "@/components/ui/utils";

interface ProfileData {
  name: string;
  title: string;
  company: string;
  location: string;
  email: string;
  phone?: string;
  website?: string;
  linkedin?: string;
  avatar?: string;
  specialties?: string[];
  bio?: string;
}

interface QRShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: ProfileData;
}

export function QRShareModal({ open, onOpenChange, profile }: QRShareModalProps) {
  const [copied, setCopied] = useState(false);

  // Generate vCard format
  const generateVCard = () => {
    const vCard = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${profile.name}`,
      `ORG:${profile.company}`,
      `TITLE:${profile.title}`,
      `EMAIL:${profile.email}`,
      profile.phone ? `TEL:${profile.phone}` : "",
      profile.website ? `URL:${profile.website}` : "",
      profile.linkedin ? `URL:${profile.linkedin}` : "",
      `ADR:;;${profile.location};;;`,
      profile.bio ? `NOTE:${profile.bio}` : "",
      "END:VCARD"
    ].filter(line => line !== "").join("\r\n");
    
    return vCard;
  };

  // Generate Jewelia profile URL
  const generateProfileUrl = () => {
    const slug = profile.name.replace(/\s+/g, "-").toLowerCase();
    return `https://jewelia.com/profile/${slug}`;
  };

  // Generate QR data (vCard + profile URL)
  const generateQRData = () => {
    const vCard = generateVCard();
    const profileUrl = generateProfileUrl();
    return `${vCard}\n\nProfile: ${profileUrl}`;
  };

  // Download QR code as PNG
  const downloadQR = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `${profile.name.replace(/\s+/g, '-')}-qr-code.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  // Copy vCard to clipboard
  const copyVCard = async () => {
    const success = await copyToClipboard(generateVCard(), (msg) => toast.success(msg));
    setCopied(success);
    if (success) setTimeout(() => setCopied(false), 2000);
  };

  // Share via native share API
  const shareProfile = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name} - ${profile.title}`,
          text: `Connect with ${profile.name} on Jewelia`,
          url: generateProfileUrl(),
        });
      } catch (error) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback to copying URL
      await copyToClipboard(generateProfileUrl(), (msg) => toast.success(msg));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-emerald-600" />
            Share Profile
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Profile Preview */}
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950/20 dark:to-blue-950/20 rounded-lg border">
            <Avatar className="h-16 w-16 border-2 border-emerald-200">
              <AvatarImage src={profile.avatar} alt={profile.name} />
              <AvatarFallback className="bg-emerald-100 text-emerald-700">
                {profile.name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {profile.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                {profile.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Building2 className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {profile.company}
                </span>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-emerald-100">
                <QRCodeCanvas 
                  value={generateQRData()} 
                  size={200}
                  level="M"
                  includeMargin={true}
                />
              </div>
              <div className="absolute -top-2 -right-2">
                <Badge className="bg-emerald-500 text-white text-xs">
                  <Smartphone className="h-3 w-3 mr-1" />
                  Scan
                </Badge>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Scan with your phone to add contact
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Contains vCard + profile link
              </p>
            </div>
          </div>

          {/* Contact Info Preview */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Contact Information</h4>
            <div className="space-y-2 text-sm">
              {profile.email && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Mail className="h-4 w-4 text-emerald-500" />
                  <span>{profile.email}</span>
                </div>
              )}
              {profile.phone && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Smartphone className="h-4 w-4 text-emerald-500" />
                  <span>{profile.phone}</span>
                </div>
              )}
              {profile.website && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Globe className="h-4 w-4 text-emerald-500" />
                  <span className="truncate">{profile.website}</span>
                </div>
              )}
              {profile.linkedin && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Linkedin className="h-4 w-4 text-emerald-500" />
                  <span className="truncate">LinkedIn Profile</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <MapPin className="h-4 w-4 text-emerald-500" />
                <span>{profile.location}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <Button 
              onClick={shareProfile}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Profile
            </Button>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={downloadQR}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Download QR
              </Button>
              <Button 
                variant="outline" 
                onClick={copyVCard}
                className="flex-1"
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4 mr-2 text-emerald-600" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copied ? "Copied!" : "Copy vCard"}
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              📱 Use any QR scanner app or your phone's camera
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              💼 Perfect for networking events and business cards
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 