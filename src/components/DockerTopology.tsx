import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Monitor, Play, Settings, AlertTriangle, MonitorSmartphone } from 'lucide-react';

interface Container {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'restarting';
  cpuUsage: number;
  memoryUsage: number;
  ports: string[];
  image: string;
}

export const DockerTopology = () => {
  const [selectedContainer, setSelectedContainer] = useState<string | null>(null);

  const containers: Container[] = [
    {
      id: 'a1b2c3d4e5',
      name: 'web-app',
      status: 'running',
      cpuUsage: 62,
      memoryUsage: 78,
      ports: ['80:8080', '443:8443'],
      image: 'nginx:latest'
    },
    {
      id: 'f6g7h8i9j0',
      name: 'database',
      status: 'running',
      cpuUsage: 25,
      memoryUsage: 92,
      ports: ['5432:5432'],
      image: 'postgres:13'
    },
    {
      id: 'k1l2m3n4o5',
      name: 'cache',
      status: 'stopped',
      cpuUsage: 0,
      memoryUsage: 0,
      ports: ['6379:6379'],
      image: 'redis:latest'
    },
    {
      id: 'p6q7r8s9t0',
      name: 'monitoring',
      status: 'running',
      cpuUsage: 38,
      memoryUsage: 65,
      ports: ['3000:3000'],
      image: 'grafana/grafana:latest'
    }
  ];

  const containerLogs = `
  [INFO] 2024-03-15T14:30:00Z Web app started successfully
  [ERROR] 2024-03-15T14:32:15Z Database connection timeout
  [WARNING] 2024-03-15T14:35:42Z High CPU usage detected
  [INFO] 2024-03-15T14:40:00Z Cache server connected
  `;

  const resourceMetrics = [
    { name: 'CPU Usage', value: '75%', color: 'bg-blue-500' },
    { name: 'Memory Usage', value: '88%', color: 'bg-purple-500' },
    { name: 'Disk I/O', value: '32%', color: 'bg-green-500' },
    { name: 'Network Traffic', value: '60%', color: 'bg-orange-500' }
  ];

  const errorAnalysis = [
    {
      id: 'err-101',
      message: 'Connection refused to database',
      timestamp: '5 minutes ago',
      severity: 'critical'
    },
    {
      id: 'err-102',
      message: 'High latency detected in cache server',
      timestamp: '12 minutes ago',
      severity: 'warning'
    }
  ];

  const aiContainerAnalysis = [
    {
      metric: 'Security Score',
      value: '89%',
      recommendation: 'Update to latest image versions',
      color: 'bg-green-500'
    },
    {
      metric: 'Optimization Potential',
      value: '65%',
      recommendation: 'Adjust resource limits for better performance',
      color: 'bg-blue-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Container Topology - Full Width */}
      <Card className="bg-gradient-docker/10 border-blue-500/20 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Settings className="text-blue-400" size={20} />
            Container Topology
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs text-gray-400 border-white/20 flex items-center gap-1">
              <MonitorSmartphone size={12} />
              Desktop only
            </Badge>
            <Button size="sm" className="bg-gradient-docker" title="Runs every detected docker-compose.yml on this machine — available in the desktop app only">
              <Play size={16} className="mr-1" />
              Deploy All
            </Button>
          </div>
        </div>
        <p className="text-xs text-gray-500 -mt-2 mb-4">
          Scans this project for <code className="text-gray-400">docker-compose.yml</code> files and starts every detected service locally. Requires the StackCendra desktop app.
        </p>

        {/* Interactive Container Map */}
        <div className="relative mb-6 bg-black/30 rounded-lg p-4 min-h-[300px]">
          <svg className="w-full h-full" viewBox="0 0 400 200">
            {/* Example connections - replace with actual topology logic */}
            <line x1="50" y1="50" x2="200" y2="150" stroke="#60a5fa" strokeWidth="2" />
            <line x1="200" y1="150" x2="350" y2="50" stroke="#60a5fa" strokeWidth="2" />

            {/* Example container nodes - replace with actual container positions */}
            <circle cx="50" cy="50" r="15" fill="#3b82f6" className="cursor-pointer" onClick={() => setSelectedContainer('web-app')} />
            <circle cx="200" cy="150" r="15" fill="#3b82f6" className="cursor-pointer" onClick={() => setSelectedContainer('database')} />
            <circle cx="350" cy="50" r="15" fill="#3b82f6" className="cursor-pointer" onClick={() => setSelectedContainer('cache')} />

            {/* Example labels */}
            <text x="40" y="45" fontSize="10" textAnchor="middle" fill="white">Web App</text>
            <text x="190" y="145" fontSize="10" textAnchor="middle" fill="white">Database</text>
            <text x="340" y="45" fontSize="10" textAnchor="middle" fill="white">Cache</text>
          </svg>
        </div>

        {/* Container List */}
        <div className="space-y-2">
          {containers.map((container) => (
            <div
              key={container.id}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                selectedContainer === container.name
                  ? 'border-white/30 bg-white/10'
                  : 'border-white/10 hover:border-white/20 hover:bg-white/5'
              }`}
              onClick={() => setSelectedContainer(container.name)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${container.status === 'running' ? 'bg-green-500' : container.status === 'stopped' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                  <div>
                    <p className="text-sm font-medium text-white">{container.name}</p>
                    <p className="text-xs text-gray-400">{container.image}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="text-xs">{container.status}</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Container Logs - Full Width */}
      <Card className="bg-black/20 border-white/10 p-4">
        <h4 className="text-md font-semibold text-white mb-3">Container Logs</h4>
        <ScrollArea className="h-64">
          <pre className="text-xs text-gray-400 whitespace-pre-wrap">
            {containerLogs}
          </pre>
        </ScrollArea>
      </Card>

      {/* Resource Usage - Full Width */}
      <Card className="bg-black/20 border-white/10 p-4">
        <h4 className="text-md font-semibold text-white mb-3">Resource Usage</h4>
        <div className="grid grid-cols-2 gap-4">
          {resourceMetrics.map((metric, index) => (
            <div key={index} className="p-3 rounded-lg border border-white/10">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-white">{metric.name}</p>
                <span className={`text-xs ${metric.color}`}>{metric.value}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className={`${metric.color} h-2 rounded-full`} style={{ width: metric.value }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Error Analysis - Full Width */}
      <Card className="bg-red-500/10 border-red-500/20 p-4">
        <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
          🔥 Error Analysis
        </h4>
        <div className="space-y-3">
          {errorAnalysis.map((error, index) => (
            <div key={index} className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <code className="text-xs text-red-300">{error.id}</code>
                <Badge className={`text-xs ${error.severity === 'critical' ? 'bg-red-500/20 text-red-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                  {error.severity}
                </Badge>
              </div>
              <p className="text-sm text-white">{error.message}</p>
              <p className="text-xs text-gray-400">{error.timestamp}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* AI Container Analysis - Full Width */}
      <Card className="bg-gradient-ai/10 border-ai-primary/20 p-4">
        <h4 className="text-md font-semibold text-white mb-3">🤖 AI Container Analysis</h4>
        <div className="space-y-3">
          {aiContainerAnalysis.map((analysis, index) => (
            <div key={index} className="p-3 bg-ai-primary/10 border border-ai-primary/20 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-ai-primary">{analysis.metric}</p>
                <span className={`text-xs ${analysis.color}`}>{analysis.value}</span>
              </div>
              <p className="text-sm text-white">{analysis.recommendation}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
