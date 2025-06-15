
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Play, Monitor, GitBranch, Settings, Users } from 'lucide-react';

export const DebuggingSession = () => {
  const [activeBreakpoints, setActiveBreakpoints] = useState(3);
  const [debugProgress, setDebugProgress] = useState(67);

  const errorLogs = [
    {
      timestamp: '2024-01-15 14:32:17',
      level: 'ERROR',
      service: 'payment-service',
      message: 'Connection timeout after 5000ms',
      stackTrace: 'at ConnectionPool.acquire (/app/src/db/pool.js:45:12)',
      occurrences: 47
    },
    {
      timestamp: '2024-01-15 14:31:54',
      level: 'WARN',
      service: 'user-service',
      message: 'High memory usage detected: 89%',
      stackTrace: 'at MemoryMonitor.checkUsage (/app/src/monitor.js:23:8)',
      occurrences: 12
    },
    {
      timestamp: '2024-01-15 14:31:32',
      level: 'ERROR',
      service: 'payment-service',
      message: 'Database connection pool exhausted',
      stackTrace: 'at Pool.connect (/app/node_modules/pg/lib/pool.js:104:15)',
      occurrences: 23
    }
  ];

  const teamMembers = [
    { name: 'Sarah Chen', role: 'DevOps Lead', status: 'debugging', avatar: 'SC' },
    { name: 'Mike Rodriguez', role: 'Backend Dev', status: 'reviewing', avatar: 'MR' },
    { name: 'Alex Kumar', role: 'AI Engineer', status: 'analyzing', avatar: 'AK' }
  ];

  const debugSteps = [
    { step: 1, title: 'Error Detection', status: 'completed', description: 'AI detected anomalous error patterns' },
    { step: 2, title: 'Root Cause Analysis', status: 'completed', description: 'Database connection pool identified as bottleneck' },
    { step: 3, title: 'Impact Assessment', status: 'in-progress', description: 'Analyzing affected user sessions' },
    { step: 4, title: 'Solution Generation', status: 'pending', description: 'AI generating optimized fixes' },
    { step: 5, title: 'Deployment Planning', status: 'pending', description: 'Creating rollout strategy' }
  ];

  return (
    <div className="h-full grid grid-cols-3 gap-4">
      {/* Left Column - Error Analysis */}
      <div className="space-y-4">
        <Card className="bg-black/20 border-red-500/20 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Monitor className="text-red-400" size={20} />
              Critical Issues
            </h3>
            <Badge className="bg-red-500/20 text-red-300">High Priority</Badge>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Active Errors</span>
              <span className="text-2xl font-bold text-red-400">82</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Affected Users</span>
              <span className="text-2xl font-bold text-orange-400">1,247</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Uptime</span>
              <span className="text-2xl font-bold text-yellow-400">94.3%</span>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Resolution Progress</span>
              <span className="text-sm text-white">{debugProgress}%</span>
            </div>
            <Progress value={debugProgress} className="h-2" />
          </div>
        </Card>

        <Card className="bg-black/20 border-white/10 p-4">
          <h4 className="text-md font-semibold text-white mb-3">Real-time Error Log</h4>
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {errorLogs.map((log, index) => (
                <div key={index} className={`p-3 rounded-lg border ${
                  log.level === 'ERROR' ? 'bg-red-500/10 border-red-500/20' : 'bg-yellow-500/10 border-yellow-500/20'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <Badge className={`text-xs ${
                      log.level === 'ERROR' ? 'bg-red-500/20 text-red-300' : 'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {log.level}
                    </Badge>
                    <span className="text-xs text-gray-400">{log.timestamp}</span>
                  </div>
                  <p className="text-sm text-white mb-1">{log.message}</p>
                  <p className="text-xs text-gray-400 font-mono">{log.service}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">{log.stackTrace}</span>
                    <Badge variant="outline" className="text-xs">
                      {log.occurrences}x
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* Center Column - AI Debugging Process */}
      <div className="space-y-4">
        <Card className="bg-gradient-ai/10 border-ai-primary/20 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              🤖 AI Debugging Process
            </h3>
            <Button size="sm" className="bg-gradient-ai">
              <Play size={16} className="mr-1" />
              Auto-Fix
            </Button>
          </div>

          <div className="space-y-3">
            {debugSteps.map((step) => (
              <div key={step.step} className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                  step.status === 'in-progress' ? 'bg-blue-500/20 text-blue-300 animate-pulse' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {step.step}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{step.title}</p>
                  <p className="text-xs text-gray-400">{step.description}</p>
                  {step.status === 'in-progress' && (
                    <div className="mt-2">
                      <Progress value={75} className="h-1" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-black/20 border-white/10 p-4">
          <h4 className="text-md font-semibold text-white mb-3">AI Recommendations</h4>
          <div className="space-y-3">
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-300">Database Optimization</span>
                <Badge className="bg-green-500/20 text-green-300">92% Success Rate</Badge>
              </div>
              <p className="text-xs text-gray-300">Increase connection pool size and add circuit breaker pattern</p>
              <Button size="sm" variant="outline" className="mt-2 text-green-300 border-green-500/20">
                Apply Fix
              </Button>
            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-300">Memory Management</span>
                <Badge className="bg-blue-500/20 text-blue-300">87% Success Rate</Badge>
              </div>
              <p className="text-xs text-gray-300">Implement garbage collection optimization for user-service</p>
              <Button size="sm" variant="outline" className="mt-2 text-blue-300 border-blue-500/20">
                Schedule Fix
              </Button>
            </div>

            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-300">Monitoring Enhancement</span>
                <Badge className="bg-purple-500/20 text-purple-300">Auto-Deploy</Badge>
              </div>
              <p className="text-xs text-gray-300">Add predictive alerts to prevent similar issues</p>
              <Button size="sm" variant="outline" className="mt-2 text-purple-300 border-purple-500/20">
                Deploy Now
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Right Column - Team Collaboration */}
      <div className="space-y-4">
        <Card className="bg-black/20 border-white/10 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Users className="text-blue-400" size={20} />
              Debug Team
            </h3>
            <Button size="sm" variant="outline">Join Session</Button>
          </div>

          <div className="space-y-3">
            {teamMembers.map((member, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-gradient-ai text-white text-sm">
                    {member.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{member.name}</p>
                  <p className="text-xs text-gray-400">{member.role}</p>
                </div>
                <Badge className={`text-xs ${
                  member.status === 'debugging' ? 'bg-red-500/20 text-red-300' :
                  member.status === 'reviewing' ? 'bg-blue-500/20 text-blue-300' :
                  'bg-green-500/20 text-green-300'
                }`}>
                  {member.status}
                </Badge>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-white/10">
            <h4 className="text-sm font-medium text-white mb-2">Session Activity</h4>
            <div className="space-y-2 text-xs text-gray-400">
              <p>• Sarah identified connection pool bottleneck</p>
              <p>• Mike suggested circuit breaker implementation</p>
              <p>• AI generated optimized configuration</p>
              <p>• Alex approved performance improvements</p>
            </div>
          </div>
        </Card>

        <Card className="bg-black/20 border-white/10 p-4">
          <h4 className="text-md font-semibold text-white mb-3">Performance Metrics</h4>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">Response Time</span>
                <span className="text-xl font-bold text-red-400">2.4s</span>
              </div>
              <Progress value={80} className="h-2" />
              <p className="text-xs text-gray-400 mt-1">Target: <1s</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">Error Rate</span>
                <span className="text-xl font-bold text-orange-400">4.7%</span>
              </div>
              <Progress value={47} className="h-2" />
              <p className="text-xs text-gray-400 mt-1">Target: <1%</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">CPU Usage</span>
                <span className="text-xl font-bold text-yellow-400">78%</span>
              </div>
              <Progress value={78} className="h-2" />
              <p className="text-xs text-gray-400 mt-1">Target: <70%</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
