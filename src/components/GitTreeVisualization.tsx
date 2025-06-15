
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GitBranch, Play, Users, Settings } from 'lucide-react';

export const GitTreeVisualization = () => {
  const [selectedBranch, setSelectedBranch] = useState('feature/payment-fix');

  const gitBranches = [
    {
      name: 'main',
      commits: 247,
      lastCommit: '2 hours ago',
      author: 'Sarah Chen',
      status: 'protected',
      color: 'bg-green-500'
    },
    {
      name: 'develop',
      commits: 156,
      lastCommit: '30 minutes ago',
      author: 'Mike Rodriguez',
      status: 'active',
      color: 'bg-blue-500'
    },
    {
      name: 'feature/payment-fix',
      commits: 12,
      lastCommit: '5 minutes ago',
      author: 'Alex Kumar',
      status: 'review',
      color: 'bg-purple-500'
    },
    {
      name: 'feature/user-auth',
      commits: 8,
      lastCommit: '1 hour ago',
      author: 'Lisa Park',
      status: 'draft',
      color: 'bg-orange-500'
    }
  ];

  const commitHistory = [
    {
      id: 'a7f3d2e',
      message: 'Fix: Increase database connection pool size',
      author: 'Alex Kumar',
      timestamp: '5 minutes ago',
      files: ['src/db/connection.js', 'config/database.yml'],
      additions: 23,
      deletions: 7,
      aiSuggestion: true
    },
    {
      id: 'b8e4c1f',
      message: 'Add: Circuit breaker pattern for payment service',
      author: 'Sarah Chen',
      timestamp: '15 minutes ago',
      files: ['src/services/payment.js', 'src/utils/circuitBreaker.js'],
      additions: 45,
      deletions: 12,
      aiSuggestion: true
    },
    {
      id: 'c9d5a3b',
      message: 'Test: Add integration tests for timeout handling',
      author: 'Mike Rodriguez',
      timestamp: '25 minutes ago',
      files: ['tests/integration/payment.test.js'],
      additions: 67,
      deletions: 3,
      aiSuggestion: false
    }
  ];

  const mergeConflicts = [
    {
      file: 'src/db/connection.js',
      conflicts: 2,
      suggestion: 'Keep both changes - they target different connection parameters'
    },
    {
      file: 'package.json',
      conflicts: 1,
      suggestion: 'Use version from feature branch - includes required dependency'
    }
  ];

  const collaborators = [
    { name: 'Sarah Chen', avatar: 'SC', commits: 47, status: 'online' },
    { name: 'Mike Rodriguez', avatar: 'MR', commits: 32, status: 'busy' },
    { name: 'Alex Kumar', avatar: 'AK', commits: 28, status: 'online' },
    { name: 'Lisa Park', avatar: 'LP', commits: 19, status: 'away' }
  ];

  return (
    <div className="space-y-6">
      {/* Git Tree Visualization - Full Width */}
      <Card className="bg-gradient-git/10 border-pink-500/20 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <GitBranch className="text-pink-400" size={20} />
            Repository Tree
          </h3>
          <Button size="sm" className="bg-gradient-git">
            <Play size={16} className="mr-1" />
            Merge All
          </Button>
        </div>

        {/* Interactive Git Tree */}
        <div className="relative mb-6">
          <svg className="w-full h-80" viewBox="0 0 600 300">
            {/* Main branch line */}
            <line x1="50" y1="50" x2="550" y2="50" stroke="#22c55e" strokeWidth="3" />
            
            {/* Develop branch */}
            <line x1="100" y1="50" x2="100" y2="100" stroke="#3b82f6" strokeWidth="2" />
            <line x1="100" y1="100" x2="500" y2="100" stroke="#3b82f6" strokeWidth="3" />
            <line x1="450" y1="100" x2="450" y2="50" stroke="#3b82f6" strokeWidth="2" />
            
            {/* Feature branches */}
            <line x1="200" y1="100" x2="200" y2="150" stroke="#8b5cf6" strokeWidth="2" />
            <line x1="200" y1="150" x2="400" y2="150" stroke="#8b5cf6" strokeWidth="3" />
            
            <line x1="150" y1="100" x2="150" y2="200" stroke="#f97316" strokeWidth="2" />
            <line x1="150" y1="200" x2="350" y2="200" stroke="#f97316" strokeWidth="3" />

            {/* Commit nodes */}
            <circle cx="50" cy="50" r="6" fill="#22c55e" className="animate-pulse" />
            <circle cx="150" cy="50" r="6" fill="#22c55e" />
            <circle cx="250" cy="50" r="6" fill="#22c55e" />
            <circle cx="350" cy="50" r="6" fill="#22c55e" />
            <circle cx="450" cy="50" r="6" fill="#22c55e" />
            <circle cx="550" cy="50" r="6" fill="#22c55e" />

            <circle cx="100" cy="100" r="6" fill="#3b82f6" />
            <circle cx="200" cy="100" r="6" fill="#3b82f6" />
            <circle cx="300" cy="100" r="6" fill="#3b82f6" />
            <circle cx="400" cy="100" r="6" fill="#3b82f6" />
            <circle cx="500" cy="100" r="6" fill="#3b82f6" className="animate-pulse" />

            <circle cx="200" cy="150" r="6" fill="#8b5cf6" />
            <circle cx="300" cy="150" r="6" fill="#8b5cf6" />
            <circle cx="400" cy="150" r="6" fill="#8b5cf6" className="animate-pulse" />

            <circle cx="150" cy="200" r="6" fill="#f97316" />
            <circle cx="250" cy="200" r="6" fill="#f97316" />
            <circle cx="350" cy="200" r="6" fill="#f97316" />

            {/* Branch labels */}
            <text x="560" y="55" fill="#22c55e" fontSize="12" fontWeight="bold">main</text>
            <text x="510" y="105" fill="#3b82f6" fontSize="12" fontWeight="bold">develop</text>
            <text x="410" y="155" fill="#8b5cf6" fontSize="12" fontWeight="bold">payment-fix</text>
            <text x="360" y="205" fill="#f97316" fontSize="12" fontWeight="bold">user-auth</text>
          </svg>
        </div>

        {/* Branch List */}
        <div className="space-y-2">
          {gitBranches.map((branch, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                selectedBranch === branch.name
                  ? 'border-white/30 bg-white/10'
                  : 'border-white/10 hover:border-white/20 hover:bg-white/5'
              }`}
              onClick={() => setSelectedBranch(branch.name)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${branch.color}`} />
                  <div>
                    <p className="text-sm font-medium text-white">{branch.name}</p>
                    <p className="text-xs text-gray-400">{branch.commits} commits • {branch.lastCommit}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={`text-xs ${
                    branch.status === 'protected' ? 'bg-green-500/20 text-green-300' :
                    branch.status === 'active' ? 'bg-blue-500/20 text-blue-300' :
                    branch.status === 'review' ? 'bg-purple-500/20 text-purple-300' :
                    'bg-orange-500/20 text-orange-300'
                  }`}>
                    {branch.status}
                  </Badge>
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="bg-gradient-ai text-white text-xs">
                      {branch.author.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Bottom Section - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Commits */}
        <Card className="bg-black/20 border-white/10 p-4">
          <h4 className="text-md font-semibold text-white mb-3">Recent Commits</h4>
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {commitHistory.map((commit, index) => (
                <div key={index} className="p-3 border border-white/10 rounded-lg hover:border-white/20 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-xs bg-white/10 px-2 py-1 rounded text-blue-300">
                      {commit.id}
                    </code>
                    {commit.aiSuggestion && (
                      <Badge className="bg-ai-primary/20 text-ai-primary text-xs">AI</Badge>
                    )}
                  </div>
                  <p className="text-sm text-white mb-1">{commit.message}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{commit.author}</span>
                    <span>{commit.timestamp}</span>
                  </div>
                  <div className="flex items-center space-x-4 mt-2 text-xs">
                    <span className="text-green-400">+{commit.additions}</span>
                    <span className="text-red-400">-{commit.deletions}</span>
                    <span className="text-gray-400">{commit.files.length} files</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Merge Conflicts & Contributors */}
        <div className="space-y-4">
          <Card className="bg-red-500/10 border-red-500/20 p-4">
            <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
              ⚠️ Merge Conflicts
            </h4>
            <div className="space-y-2">
              {mergeConflicts.map((conflict, index) => (
                <div key={index} className="p-2 bg-red-500/10 border border-red-500/20 rounded">
                  <div className="flex items-center justify-between mb-1">
                    <code className="text-xs text-red-300">{conflict.file}</code>
                    <Badge className="bg-red-500/20 text-red-300 text-xs">
                      {conflict.conflicts} conflicts
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400">{conflict.suggestion}</p>
                  <Button size="sm" variant="outline" className="mt-2 h-6 text-xs text-red-300 border-red-500/20">
                    AI Resolve
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-black/20 border-white/10 p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-semibold text-white flex items-center gap-2">
                <Users className="text-blue-400" size={16} />
                Contributors
              </h4>
              <Button size="sm" variant="outline">Invite</Button>
            </div>

            <div className="space-y-3">
              {collaborators.map((collaborator, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gradient-ai text-white text-xs">
                        {collaborator.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-black ${
                      collaborator.status === 'online' ? 'status-online' :
                      collaborator.status === 'busy' ? 'status-busy' : 'status-away'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{collaborator.name}</p>
                    <p className="text-xs text-gray-400">{collaborator.commits} commits this week</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* AI Git Analysis */}
        <Card className="bg-gradient-ai/10 border-ai-primary/20 p-4">
          <h4 className="text-md font-semibold text-white mb-3">🤖 AI Git Analysis</h4>
          <div className="space-y-3">
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm font-medium text-green-300 mb-1">Code Quality Score</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-green-400">94%</span>
                <Badge className="bg-green-500/20 text-green-300">Excellent</Badge>
              </div>
            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm font-medium text-blue-300 mb-1">Merge Safety</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-blue-400">Safe</span>
                <Badge className="bg-blue-500/20 text-blue-300">Low Risk</Badge>
              </div>
            </div>

            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <p className="text-sm font-medium text-purple-300 mb-1">Performance Impact</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-purple-400">+40%</span>
                <Badge className="bg-purple-500/20 text-purple-300">Improvement</Badge>
              </div>
            </div>
          </div>

          <Button className="w-full mt-4 bg-gradient-ai">
            Deploy with AI Recommendations
          </Button>
        </Card>
      </div>
    </div>
  );
};
