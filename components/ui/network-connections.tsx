"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  UserPlus, 
  MessageSquare, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Building2,
  Clock,
  CheckCircle,
  X,
  Users,
  Network
} from "lucide-react";

interface ContactData {
  id: string;
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
  status: 'pending' | 'connected' | 'rejected';
  scannedAt: Date;
  avatar?: string;
}

interface NetworkConnectionsProps {
  contacts: ContactData[];
  onContactAction: (contactId: string, action: 'accept' | 'reject' | 'message') => void;
}

export function NetworkConnections({ contacts, onContactAction }: NetworkConnectionsProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'connected'>('all');

  const filteredContacts = contacts.filter(contact => {
    if (filter === 'all') return true;
    return contact.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>;
      case 'connected':
        return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Connected
        </Badge>;
      case 'rejected':
        return <Badge variant="destructive">
          <X className="h-3 w-3 mr-1" />
          Rejected
        </Badge>;
      default:
        return null;
    }
  };

  const getActionButtons = (contact: ContactData) => {
    if (contact.status === 'pending') {
      return (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => onContactAction(contact.id, 'accept')}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onContactAction(contact.id, 'reject')}
          >
            <X className="h-4 w-4 mr-1" />
            Decline
          </Button>
        </div>
      );
    }

    if (contact.status === 'connected') {
      return (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onContactAction(contact.id, 'message')}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Message
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-emerald-600" />
            <CardTitle>Network Connections</CardTitle>
          </div>
          <Badge variant="outline" className="text-sm">
            {contacts.length} total
          </Badge>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex gap-2 mt-4">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All ({contacts.length})
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('pending')}
          >
            Pending ({contacts.filter(c => c.status === 'pending').length})
          </Button>
          <Button
            variant={filter === 'connected' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('connected')}
          >
            Connected ({contacts.filter(c => c.status === 'connected').length})
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredContacts.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No {filter === 'all' ? '' : filter} connections
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {filter === 'all' 
                ? "Start scanning QR codes to build your network"
                : filter === 'pending'
                ? "No pending connection requests"
                : "No connected contacts yet"
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={contact.avatar} alt={contact.name} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700">
                    {contact.name[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {contact.name}
                    </h3>
                    {getStatusBadge(contact.status)}
                  </div>
                  
                  {contact.title && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                      {contact.title}
                    </p>
                  )}
                  
                  {contact.company && (
                    <div className="flex items-center gap-1 mt-1">
                      <Building2 className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {contact.company}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {contact.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{contact.email}</span>
                      </div>
                    )}
                    {contact.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{contact.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{contact.scannedAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  {getActionButtons(contact)}
                  
                  {/* Quick Actions */}
                  <div className="flex gap-1">
                    {contact.email && (
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Mail className="h-4 w-4" />
                      </Button>
                    )}
                    {contact.phone && (
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Phone className="h-4 w-4" />
                      </Button>
                    )}
                    {contact.website && (
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Globe className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 