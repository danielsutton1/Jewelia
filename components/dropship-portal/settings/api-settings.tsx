import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ApiSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">API Key</label>
            <Input placeholder="Enter API key" type="password" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Webhook URL</label>
            <Input placeholder="Enter webhook URL" />
          </div>
          <Button>Save API Settings</Button>
        </div>
      </CardContent>
    </Card>
  );
} 