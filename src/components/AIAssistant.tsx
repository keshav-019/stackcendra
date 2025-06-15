
import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Settings, Monitor, GitBranch } from 'lucide-react';

export const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "🤖 **AI Analysis Complete**\n\nI've detected a critical issue in your payment microservice:\n\n**Root Cause:** Database connection pool exhaustion in `payment-service/src/db/connection.js`\n\n**Impact:** 47% of payment requests failing\n\n**Recommended Fix:**\n1. Increase pool size from 10 to 25\n2. Add connection timeout handling\n3. Implement circuit breaker pattern\n\nShall I apply these fixes automatically?",
      timestamp: new Date(Date.now() - 30000),
      actions: ['Apply Fix', 'Show Code', 'Schedule Deploy']
    },
    {
      id: 2,
      type: 'user',
      content: "Show me the specific code changes needed",
      timestamp: new Date(Date.now() - 20000)
    },
    {
      id: 3,
      type: 'ai',
      content: "```javascript\n// payment-service/src/db/connection.js\nconst pool = new Pool({\n  user: process.env.DB_USER,\n  host: process.env.DB_HOST,\n  database: process.env.DB_NAME,\n  password: process.env.DB_PASSWORD,\n  port: process.env.DB_PORT,\n- max: 10, // Current pool size\n+ max: 25, // Increased pool size\n+ connectionTimeoutMillis: 2000,\n+ idleTimeoutMillis: 30000,\n+ allowExitOnIdle: true\n});\n\n+ // Add circuit breaker\n+ const CircuitBreaker = require('opossum');\n+ const options = {\n+   timeout: 3000,\n+   errorThresholdPercentage: 50,\n+   resetTimeout: 30000\n+ };\n+ const breaker = new CircuitBreaker(pool.query, options);\n```\n\n**Git Impact Analysis:**\n- Files changed: 3\n- Tests affected: 12\n- Deployment risk: LOW\n\nThis change is backward compatible and follows your team's coding standards.",
      timestamp: new Date(Date.now() - 10000),
      codeBlock: true
    }
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user' as const,
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsThinking(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        type: 'ai' as const,
        content: generateAIResponse(inputValue),
        timestamp: new Date(),
        actions: ['Apply Suggestion', 'Learn More', 'Schedule Fix']
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsThinking(false);
    }, 2000);
  };

  const generateAIResponse = (input: string) => {
    const responses = [
      "🔍 **Analysis Complete**\n\nBased on your Docker containers and Git history, I've identified the optimal solution:\n\n**Performance Impact:** This change will reduce response time by ~40%\n**Risk Assessment:** Low risk, fully reversible\n**Team Impact:** Sarah and Mike should review the database changes\n\nReady to proceed?",
      "🚀 **Deployment Strategy**\n\nI recommend a staged rollout:\n\n1. **Stage 1:** Deploy to development (auto)\n2. **Stage 2:** A/B test with 10% traffic\n3. **Stage 3:** Full production rollout\n\n**Rollback Plan:** Automated rollback if error rate > 1%\n\nShall I initiate the deployment pipeline?",
      "🧠 **Pattern Recognition**\n\nI've analyzed similar issues across 247 projects:\n\n**Success Rate:** 94% with this approach\n**Common Pitfalls:** Database migration timing\n**Best Practice:** Run migrations during low-traffic hours\n\n**Recommendation:** Schedule for 2 AM UTC (in 6 hours)\n\nWould you like me to set up the automated deployment?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const quickActions = [
    { label: 'Analyze Logs', icon: Monitor, color: 'bg-blue-500/20 text-blue-300' },
    { label: 'Check Git Status', icon: GitBranch, color: 'bg-green-500/20 text-green-300' },
    { label: 'Deploy Fix', icon: Play, color: 'bg-purple-500/20 text-purple-300' },
    { label: 'Team Update', icon: Settings, color: 'bg-orange-500/20 text-orange-300' },
  ];

  return (
    <div className="w-80 bg-black/20 backdrop-blur-md border-l border-white/10 flex flex-col">
      {/* AI Assistant Header */}
      <div className="p-4 border-b border-white/10 bg-gradient-ai/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-ai rounded-full flex items-center justify-center animate-pulse-ai">
            <span className="text-white font-bold">AI</span>
          </div>
          <div>
            <h3 className="font-semibold text-white">DevOps Assistant</h3>
            <p className="text-xs text-gray-300">Analyzing your stack...</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-white/10">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className={`${action.color} hover:scale-105 transition-all duration-200 text-xs h-auto py-2 px-3`}
            >
              <action.icon size={14} className="mr-1" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                <div className={`p-3 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-ai-primary/20 text-white' 
                    : 'ai-message text-gray-100'
                } ${message.codeBlock ? 'font-mono text-sm' : ''}`}>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  {message.actions && (
                    <div className="flex gap-2 mt-3">
                      {message.actions.map((action, index) => (
                        <Button key={index} size="sm" variant="secondary" className="text-xs h-6 px-2">
                          {action}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1 px-2">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {message.type === 'ai' && (
                <Avatar className="w-6 h-6 order-1 mr-2 mt-1">
                  <AvatarFallback className="bg-gradient-ai text-white text-xs">AI</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          
          {isThinking && (
            <div className="flex justify-start">
              <div className="flex items-center space-x-2 ai-message p-3 rounded-lg">
                <div className="w-2 h-2 bg-ai-primary rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-ai-primary rounded-full animate-pulse animation-delay-100" />
                <div className="w-2 h-2 bg-ai-primary rounded-full animate-pulse animation-delay-200" />
                <span className="text-sm text-gray-300 ml-2">AI is thinking...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask AI about your infrastructure..."
            className="flex-1 bg-white/5 border-white/10 text-white placeholder-gray-400"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isThinking}
            className="bg-gradient-ai hover:opacity-80"
          >
            <Play size={16} />
          </Button>
        </div>
      </div>

      {/* AI Status */}
      <div className="p-3 bg-black/30 text-center">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-gray-300">AI Connected</span>
          <Badge variant="secondary" className="text-xs">Pro</Badge>
        </div>
      </div>
    </div>
  );
};
