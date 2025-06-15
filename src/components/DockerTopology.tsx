
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Monitor, Settings, Play, GitBranch } from 'lucide-react';

export const DockerTopology = () => {
  const [selectedContainer, setSelectedContainer] = useState('payment-service');

  const containers = [
    {
      name: 'payment-service',
      status: 'error',
      cpu: 89,
      memory: 67,
      network: 'bridge',
      port: '8080:8080',
      uptime: '2h 15m',
      restarts: 3,
      image: 'payment-service:v1.2.3',
      healthCheck: 'failing',
      logs: [
        'ERROR: Connection timeout after 5000ms',
        'WARN: High memory usage detected',
        'ERROR: Database connection pool exhausted'
      ]
    },
    {
      name: 'user-service',
      status: 'running',
      cpu: 45,
      memory: 32,
      network: 'bridge',
      port: '8081:8081',
      uptime: '5h 42m',
      restarts: 0,
      image: 'user-service:v2.1.0',
      healthCheck: 'healthy',
      logs: [
        'INFO: Service started successfully',
        'INFO: Health check passed',
        'DEBUG: Processing user authentication'
      ]
    },
    {
      name: 'database',
      status: 'running',
      cpu: 78,
      memory: 91,
      network: 'db-network',
      port: '5432:5432',
      uptime: '12h 30m',
      restarts: 1,
      image: 'postgres:13.8',
      healthCheck: 'healthy',
      logs: [
        'LOG: Database system is ready',
        'LOG: Checkpoint complete',
        'WARN: Connection limit approaching'
      ]
    },
    {
      name: 'redis-cache',
      status: 'running',
      cpu: 23,
      memory: 15,
      network: 'bridge',
      port: '6379:6379',
      uptime: '8h 17m',
      restarts: 0,
      image: 'redis:7.0-alpine',
      healthCheck: 'healthy',
      logs: [
        'INFO: Ready to accept connections',
        'INFO: Cache hit ratio: 94%',
        'DEBUG: Memory usage optimized'
      ]
    },
    {
      name: 'nginx-proxy',
      status: 'running',
      cpu: 12,
      memory: 8,
      network: 'bridge',
      port: '80:80,443:443',
      uptime: '1d 3h',
      restarts: 0,
      image: 'nginx:1.21-alpine',
      healthCheck: 'healthy',
      logs: [
        'INFO: Configuration test successful',
        'INFO: SSL certificates loaded',
        'ACCESS: 127.0.0.1 GET /'
      ]
    }
  ];

  const networkTopology = {
    networks: [
      { name: 'bridge', containers: ['payment-service', 'user-service', 'redis-cache', 'nginx-proxy'] },
      { name: 'db-network', containers: ['database', 'payment-service', 'user-service'] }
    ],
    connections: [
      { from: 'nginx-proxy', to: 'payment-service', protocol: 'HTTP', port: 8080 },
      { from: 'nginx-proxy', to: 'user-service', protocol: 'HTTP', port: 8081 },
      { from: 'payment-service', to: 'database', protocol: 'TCP', port: 5432 },
      { from: 'user-service', to: 'database', protocol: 'TCP', port: 5432 },
      { from: 'payment-service', to: 'redis-cache', protocol: 'TCP', port: 6379 }
    ]
  };

  const aiAnalysis = {
    issues: [
      {
        severity: 'critical',
        container: 'payment-service',
        issue: 'Connection pool exhaustion',
        solution: 'Increase pool size and add circuit breaker',
        confidence: 94
      },
      {
        severity: 'warning',
        container: 'database',
        issue: 'High memory usage approaching limits',
        solution: 'Optimize queries and increase memory allocation',
        confidence: 87
      }
    ],
    recommendations: [
      'Scale payment-service to 3 replicas',
      'Implement horizontal pod autoscaling',
      'Add connection pooling for database'
    ]
  };

  return (
    <div className="h-full grid grid-cols-3 gap-4">
      {/* Container Topology Visualization */}
      <div className="col-span-2 space-y-4">
        <Card className="bg-gradient-docker/10 border-docker-blue/20 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Monitor className="text-docker-blue" size={20} />
              Container Topology
            </h3>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline">Scale All</Button>
              <Button size="sm" className="bg-gradient-docker">
                <Play size={16} className="mr-1" />
                Deploy
              </Button>
            </div>
          </div>

          {/* Interactive Container Map */}
          <div className="relative bg-black/20 rounded-lg p-6 min-h-80">
            <svg className="w-full h-full" viewBox="0 0 800 400">
              {/* Network connections */}
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                        refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#06b6d4" />
                </marker>
              </defs>

              {/* Connection lines */}
              <line x1="100" y1="100" x2="300" y2="100" stroke="#06b6d4" strokeWidth="2" 
                    markerEnd="url(#arrowhead)" className="animate-pulse" />
              <line x1="100" y1="100" x2="300" y2="180" stroke="#06b6d4" strokeWidth="2" 
                    markerEnd="url(#arrowhead)" />
              <line x1="350" y1="100" x2="550" y2="100" stroke="#06b6d4" strokeWidth="2" 
                    markerEnd="url(#arrowhead)" />
              <line x1="350" y1="180" x2="550" y2="100" stroke="#06b6d4" strokeWidth="2" 
                    markerEnd="url(#arrowhead)" />
              <line x1="350" y1="100" x2="550" y2="260" stroke="#06b6d4" strokeWidth="2" 
                    markerEnd="url(#arrowhead)" />

              {/* Container nodes */}
              <g onClick={() => setSelectedContainer('nginx-proxy')}>
                <rect x="50" y="80" width="100" height="40" rx="5" 
                      fill="#22c55e" fillOpacity="0.2" stroke="#22c55e" strokeWidth="2" 
                      className="cursor-pointer hover:fill-opacity-30" />
                <text x="100" y="95" textAnchor="middle" fill="#22c55e" fontSize="10" fontWeight="bold">
                  nginx-proxy
                </text>
                <text x="100" y="108" textAnchor="middle" fill="#22c55e" fontSize="8">
                  Running
                </text>
              </g>

              <g onClick={() => setSelectedContainer('payment-service')}>
                <rect x="250" y="80" width="100" height="40" rx="5" 
                      fill="#ef4444" fillOpacity="0.2" stroke="#ef4444" strokeWidth="2" 
                      className="cursor-pointer hover:fill-opacity-30 animate-container-pulse" />
                <text x="300" y="95" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="bold">
                  payment-service
                </text>
                <text x="300" y="108" textAnchor="middle" fill="#ef4444" fontSize="8">
                  Error
                </text>
              </g>

              <g onClick={() => setSelectedContainer('user-service')}>
                <rect x="250" y="160" width="100" height="40" rx="5" 
                      fill="#22c55e" fillOpacity="0.2" stroke="#22c55e" strokeWidth="2" 
                      className="cursor-pointer hover:fill-opacity-30" />
                <text x="300" y="175" textAnchor="middle" fill="#22c55e" fontSize="10" fontWeight="bold">
                  user-service
                </text>
                <text x="300" y="188" textAnchor="middle" fill="#22c55e" fontSize="8">
                  Running
                </text>
              </g>

              <g onClick={() => setSelectedContainer('database')}>
                <rect x="500" y="80" width="100" height="40" rx="5" 
                      fill="#f59e0b" fillOpacity="0.2" stroke="#f59e0b" strokeWidth="2" 
                      className="cursor-pointer hover:fill-opacity-30" />
                <text x="550" y="95" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold">
                  database
                </text>
                <text x="550" y="108" textAnchor="middle" fill="#f59e0b" fontSize="8">
                  Warning
                </text>
              </g>

              <g onClick={() => setSelectedContainer('redis-cache')}>
                <rect x="500" y="240" width="100" height="40" rx="5" 
                      fill="#22c55e" fillOpacity="0.2" stroke="#22c55e" strokeWidth="2" 
                      className="cursor-pointer hover:fill-opacity-30" />
                <text x="550" y="255" textAnchor="middle" fill="#22c55e" fontSize="10" fontWeight="bold">
                  redis-cache
                </text>
                <text x="550" y="268" textAnchor="middle" fill="#22c55e" fontSize="8">
                  Running
                </text>
              </g>
            </svg>
          </div>

          {/* Container Grid */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {containers.map((container, index) => (
              <Card
                key={index}
                className={`container-card cursor-pointer transition-all ${
                  selectedContainer === container.name ? 'ring-2 ring-docker-blue' : ''
                }`}
                onClick={() => setSelectedContainer(container.name)}
              >
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white truncate">
                      {container.name}
                    </span>
                    <Badge className={`text-xs ${
                      container.status === 'running' ? 'bg-green-500/20 text-green-300' :
                      container.status === 'error' ? 'bg-red-500/20 text-red-300' :
                      'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {container.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">CPU</span>
                      <span className="text-white">{container.cpu}%</span>
                    </div>
                    <Progress value={container.cpu} className="h-1" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Memory</span>
                      <span className="text-white">{container.memory}%</span>
                    </div>
                    <Progress value={container.memory} className="h-1" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>

      {/* Container Details & AI Analysis */}
      <div className="space-y-4">
        <Card className="bg-black/20 border-white/10 p-4">
          <h4 className="text-md font-semibold text-white mb-3">
            Container Details: {selectedContainer}
          </h4>
          
          {(() => {
            const container = containers.find(c => c.name === selectedContainer);
            if (!container) return null;
            
            return (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-400">Status</p>
                    <Badge className={`text-xs ${
                      container.status === 'running' ? 'bg-green-500/20 text-green-300' :
                      container.status === 'error' ? 'bg-red-500/20 text-red-300' :
                      'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {container.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Uptime</p>
                    <p className="text-sm text-white">{container.uptime}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Restarts</p>
                    <p className="text-sm text-white">{container.restarts}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Health</p>
                    <Badge className={`text-xs ${
                      container.healthCheck === 'healthy' ? 'bg-green-500/20 text-green-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {container.healthCheck}
                    </Badge>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-400 mb-1">Image</p>
                  <code className="text-xs bg-white/10 px-2 py-1 rounded text-blue-300">
                    {container.image}
                  </code>
                </div>

                <div>
                  <p className="text-xs text-gray-400 mb-1">Port Mapping</p>
                  <code className="text-xs bg-white/10 px-2 py-1 rounded text-green-300">
                    {container.port}
                  </code>
                </div>

                <div>
                  <p className="text-xs text-gray-400 mb-2">Resource Usage</p>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">CPU</span>
                        <span className="text-white">{container.cpu}%</span>
                      </div>
                      <Progress value={container.cpu} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Memory</span>
                        <span className="text-white">{container.memory}%</span>
                      </div>
                      <Progress value={container.memory} className="h-2" />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    Restart
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    Scale Up
                  </Button>
                </div>
              </div>
            );
          })()}
        </Card>

        <Card className="bg-gradient-ai/10 border-ai-primary/20 p-4">
          <h4 className="text-md font-semibold text-white mb-3">🤖 AI Container Analysis</h4>
          
          <Tabs defaultValue="issues" className="h-64">
            <TabsList className="grid w-full grid-cols-2 mb-3">
              <TabsTrigger value="issues">Issues</TabsTrigger>
              <TabsTrigger value="logs">Live Logs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="issues" className="h-48">
              <ScrollArea className="h-full">
                <div className="space-y-3">
                  {aiAnalysis.issues.map((issue, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${
                      issue.severity === 'critical' ? 'bg-red-500/10 border-red-500/20' :
                      'bg-yellow-500/10 border-yellow-500/20'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={`text-xs ${
                          issue.severity === 'critical' ? 'bg-red-500/20 text-red-300' :
                          'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {issue.severity}
                        </Badge>
                        <span className="text-xs text-gray-400">{issue.confidence}% confidence</span>
                      </div>
                      <p className="text-sm text-white mb-1">{issue.issue}</p>
                      <p className="text-xs text-gray-400 mb-2">{issue.solution}</p>
                      <Button size="sm" variant="outline" className="h-6 text-xs">
                        Apply Fix
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="logs" className="h-48">
              <ScrollArea className="h-full">
                <div className="space-y-1">
                  {(() => {
                    const container = containers.find(c => c.name === selectedContainer);
                    return container?.logs.map((log, index) => (
                      <div key={index} className="p-2 bg-black/40 rounded text-xs font-mono">
                        <span className="text-gray-400 mr-2">
                          {new Date().toLocaleTimeString()}
                        </span>
                        <span className={
                          log.includes('ERROR') ? 'text-red-400' :
                          log.includes('WARN') ? 'text-yellow-400' :
                          log.includes('INFO') ? 'text-blue-400' :
                          'text-gray-300'
                        }>
                          {log}
                        </span>
                      </div>
                    ));
                  })()}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};
