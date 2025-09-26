import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function NotificationPreferences() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Email notifications</span>
            <input type="checkbox" />
          </div>
          <div className="flex items-center justify-between">
            <span>SMS notifications</span>
            <input type="checkbox" />
          </div>
          <Button>Save Preferences</Button>
        </div>
      </CardContent>
    </Card>
  );
} 