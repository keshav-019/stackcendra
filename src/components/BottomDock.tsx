
import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, GitBranch, Monitor, Settings } from 'lucide-react';

export const BottomDock = () => {
  const quickStats = [
    { label: 'Active Issues', value: '3', color: 'text-red-400', trend: '+1' },
    { label: 'Team Online', value: '4/5', color: 'text-green-400', trend: '0' },
    { label: 'Deployments', value: '2', color: 'text-blue-400', trend: '+2' },
    { label: 'CPU Usage', value: '67%', color: 'text-yellow-400', trend: '-5%' },
  ];

  const aiSuggestions = [
    'Deploy payment fix to staging',
    'Review circuit breaker implementation',
    'Scale user-service containers'
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[4.5rem] bg-black/40 backdrop-blur-md border-t border-white/10 p-3 z-40">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-5 gap-4 items-center">
          {/* Quick Stats */}
          <div className="col-span-2 flex space-x-4">
            {quickStats.map((stat, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="text-center">
                  <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-gray-400">{stat.label}</p>
                </div>
                {stat.trend !== '0' && (
                  <Badge variant="outline" className="text-xs">
                    {stat.trend}
                  </Badge>
                )}
              </div>
            ))}
          </div>

          {/* AI Quick Actions */}
          <div className="col-span-2">
            <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
              <span className="text-sm text-gray-400 whitespace-nowrap">AI Suggests:</span>
              {aiSuggestions.map((suggestion, index) => (
                <Button key={index} size="sm" variant="outline" className="text-xs whitespace-nowrap flex-shrink-0">
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="flex items-center justify-end space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-gray-400">All Systems Operational</span>
            </div>
            <Link href="/settings">
              <Button size="sm" variant="ghost" className="text-gray-400">
                <Settings size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
