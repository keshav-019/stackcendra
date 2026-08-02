
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export const NotificationCenter = () => {
  const [notifications] = useState([
    {
      id: 1,
      type: 'critical',
      title: 'Payment Service Down',
      message: 'Multiple connection timeouts detected',
      timestamp: '2 minutes ago',
      read: false,
      source: 'docker'
    },
    {
      id: 2,
      type: 'info',
      title: 'Code Review Ready',
      message: 'Circuit breaker implementation needs review',
      timestamp: '15 minutes ago',
      read: false,
      source: 'git'
    },
    {
      id: 3,
      type: 'success',
      title: 'Deployment Complete',
      message: 'User service v2.1.0 deployed successfully',
      timestamp: '1 hour ago',
      read: true,
      source: 'docker'
    },
    {
      id: 4,
      type: 'warning',
      title: 'High Memory Usage',
      message: 'Database container using 91% memory',
      timestamp: '2 hours ago',
      read: true,
      source: 'monitoring'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          🔔
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 w-5 h-5 text-xs bg-red-500 text-white p-0 flex items-center justify-center">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 bg-black/90 border-white/10 p-4" align="end">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-white">Notifications</h4>
            <Button size="sm" variant="ghost" className="text-xs">
              Mark all read
            </Button>
          </div>

          <ScrollArea className="h-64 -mr-3">
            <div className="space-y-2 pr-3">
              {notifications.map((notification) => (
                <Card key={notification.id} className={`p-3 cursor-pointer transition-colors ${
                  !notification.read ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/10'
                }`}>
                  <div className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      notification.type === 'critical' ? 'bg-red-400' :
                      notification.type === 'warning' ? 'bg-yellow-400' :
                      notification.type === 'success' ? 'bg-green-400' :
                      'bg-blue-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-white truncate">
                          {notification.title}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {notification.source}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
};
