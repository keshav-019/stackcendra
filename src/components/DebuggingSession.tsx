
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, Square, Bug, Zap, AlertTriangle, CheckCircle } from 'lucide-react';

export const DebuggingSession = () => {
  const [isDebugging, setIsDebugging] = useState(true);
  const [selectedLog, setSelectedLog] = useState(0);

  const debugLogs = [
    {
      timestamp: '14:23:15.332',
      level: 'ERROR',
      service: 'payment-service',
      message: 'Connection timeout to database',
      stack: 'at PaymentProcessor.process (payment.js:45)\n  at OrderHandler.handle (order.js:123)',
      resolved: false
    },
    {
      timestamp: '14:23:16.445',
      level: 'WARN',
      service: 'user-service',
      message: 'High memory usage detected: 91%',
      stack: null,
      resolved: false
    },
    {
      timestamp: '14:23:17.556',
      level: 'INFO',
      service: 'api-gateway',
      message: 'Circuit breaker opened for payment-service',
      stack: null,
      resolved: true
    }
  ];

  const aiSuggestions = [
    {
      priority: 'high',
      title: 'Database Connection Pool',
      description: 'Increase connection pool size from 10 to 25 connections',
      confidence: 92,
      action: 'Apply Fix'
    },
    {
      priority: 'medium',
      title: 'Memory Optimization',
      description: 'Add garbage collection hints for user-service',
      confidence: 78,
      action: 'Review Code'
    },
    {
      priority: 'low',
      title: 'Circuit Breaker Timeout',
      description: 'Adjust timeout from 30s to 45s for payment operations',
      confidence: 65,
      action: 'Test Change'
    }
  ];

  const currentBreakpoints = [
    { file: 'payment.js', line: 45, condition: 'amount > 1000', active: true },
    { file: 'order.js', line: 123, condition: null, active: false },
    { file: 'user.js', line: 67, condition: 'user.premium === true', active: true }
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Debugging Controls */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isDebugging ? 'bg-red-400 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-sm font-medium text-white">
              {isDebugging ? 'Debugging Active' : 'Debugging Paused'}
            </span>
          </div>
          <div className="flex space-x-2">
            <Button size="sm" variant={isDebugging ? "destructive" : "default"} onClick={() => setIsDebugging(!isDebugging)} className="bg-ai-primary hover:bg-ai-primary/80">
              {isDebugging ? <Pause size={16} /> : <Play size={16} />}
            </Button>
            <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Square size={16} />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="border-blue-400/50 text-blue-300">3 Services</Badge>
          <Badge variant="outline" className="border-red-400/50 text-red-300">2 Active Issues</Badge>
          <Button size="sm" variant="outline" className="border-ai-primary/50 text-ai-primary hover:bg-ai-primary/10">
            <Bug size={16} className="mr-2" />
            AI Analyze
          </Button>
        </div>
      </div>

      <div className="flex-1 p-4">
        <Tabs defaultValue="logs" className="h-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/5">
            <TabsTrigger value="logs">Debug Logs</TabsTrigger>
            <TabsTrigger value="ai">AI Analysis</TabsTrigger>
            <TabsTrigger value="breakpoints">Breakpoints</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="logs" className="mt-4 h-[calc(100%-3rem)]">
            <ScrollArea className="h-full">
              <div className="space-y-2">
                {debugLogs.map((log, index) => (
                  <Card 
                    key={index} 
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedLog === index ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/10'
                    }`}
                    onClick={() => setSelectedLog(index)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge className={`text-xs ${
                            log.level === 'ERROR' ? 'bg-red-500' :
                            log.level === 'WARN' ? 'bg-yellow-500' :
                            'bg-blue-500'
                          }`}>
                            {log.level}
                          </Badge>
                          <span className="text-sm font-medium">{log.service}</span>
                          <span className="text-xs text-gray-400">{log.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-300 mb-2">{log.message}</p>
                        {log.stack && (
                          <pre className="text-xs text-gray-500 bg-slate-800/50 p-2 rounded font-mono">
                            {log.stack}
                          </pre>
                        )}
                      </div>
                      <div className="ml-4">
                        {log.resolved ? (
                          <CheckCircle size={16} className="text-green-400" />
                        ) : (
                          <AlertTriangle size={16} className="text-red-400" />
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="ai" className="mt-4 h-[calc(100%-3rem)]">
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-4 rounded-lg border border-white/10">
                <div className="flex items-center space-x-2 mb-3">
                  <Zap size={16} className="text-yellow-400" />
                  <span className="font-medium">AI Debugging Assistant</span>
                </div>
                <p className="text-sm text-gray-300 mb-3">
                  Analyzing microservices architecture... Found 2 critical issues affecting payment processing.
                </p>
                <div className="space-y-3">
                  {aiSuggestions.map((suggestion, index) => (
                    <div key={index} className="bg-slate-800/30 p-3 rounded border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant={suggestion.priority === 'high' ? 'destructive' : suggestion.priority === 'medium' ? 'default' : 'outline'}>
                            {suggestion.priority}
                          </Badge>
                          <span className="font-medium text-sm">{suggestion.title}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-400">{suggestion.confidence}% confidence</span>
                          <Button size="sm" variant="outline" className="text-xs border-ai-primary/50 text-ai-primary hover:bg-ai-primary/10">
                            {suggestion.action}
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400">{suggestion.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="breakpoints" className="mt-4 h-[calc(100%-3rem)]">
            <ScrollArea className="h-full">
              <div className="space-y-2">
                {currentBreakpoints.map((bp, index) => (
                  <Card key={index} className="p-4 bg-white/5 border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${bp.active ? 'bg-red-400' : 'bg-gray-400'}`} />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm">{bp.file}</span>
                            <Badge variant="outline" className="text-xs border-blue-400/50 text-blue-300">Line {bp.line}</Badge>
                          </div>
                          {bp.condition && (
                            <p className="text-xs text-gray-400 mt-1">Condition: {bp.condition}</p>
                          )}
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="border-ai-primary/50 text-ai-primary hover:bg-ai-primary/10">
                        {bp.active ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="performance" className="mt-4 h-[calc(100%-3rem)]">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 bg-white/5 border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">CPU Usage</span>
                    <span className="text-sm text-red-400">87%</span>
                  </div>
                  <Progress value={87} className="h-2" />
                </Card>
                <Card className="p-4 bg-white/5 border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Memory Usage</span>
                    <span className="text-sm text-yellow-400">73%</span>
                  </div>
                  <Progress value={73} className="h-2" />
                </Card>
              </div>
              
              <Card className="p-4 bg-white/5 border-white/10">
                <h4 className="font-medium mb-3">Service Response Times</h4>
                <div className="space-y-3">
                  {[
                    { service: 'payment-service', time: '2.3s', status: 'slow' },
                    { service: 'user-service', time: '120ms', status: 'normal' },
                    { service: 'order-service', time: '45ms', status: 'fast' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{item.service}</span>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm ${
                          item.status === 'slow' ? 'text-red-400' :
                          item.status === 'normal' ? 'text-yellow-400' :
                          'text-green-400'
                        }`}>
                          {item.time}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${
                          item.status === 'slow' ? 'bg-red-400' :
                          item.status === 'normal' ? 'bg-yellow-400' :
                          'bg-green-400'
                        }`} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
