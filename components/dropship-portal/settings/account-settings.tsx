import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function AccountSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Company Name</label>
            <Input placeholder="Enter company name" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input placeholder="Enter email" />
          </div>
          <Button>Save Settings</Button>
        </div>
      </CardContent>
    </Card>
  );
} 