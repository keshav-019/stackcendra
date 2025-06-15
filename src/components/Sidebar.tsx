
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Monitor, GitBranch, Users, Settings, Calendar, Play } from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const projects = [
    { name: 'E-Commerce API', status: 'active', errors: 3 },
    { name: 'Analytics Dashboard', status: 'building', errors: 0 },
    { name: 'User Service', status: 'error', errors: 12 },
  ];

  const teamMembers = [
    { name: 'Sarah Chen', avatar: '/placeholder.svg', status: 'online', role: 'DevOps Lead' },
    { name: 'Mike Rodriguez', avatar: '/placeholder.svg', status: 'busy', role: 'Backend Dev' },
    { name: 'Lisa Park', avatar: '/placeholder.svg', status: 'away', role: 'Frontend Dev' },
    { name: 'Alex Kumar', avatar: '/placeholder.svg', status: 'online', role: 'AI Engineer' },
  ];

  const debuggingSessions = [
    { id: 1, title: 'Payment Service Timeout', participants: 3, priority: 'high' },
    { id: 2, title: 'Database Connection Pool', participants: 2, priority: 'medium' },
  ];

  return (
    <div className={`${collapsed ? 'w-16' : 'w-80'} transition-all duration-300 bg-black/20 backdrop-blur-md border-r border-white/10 flex flex-col`}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-white/10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggle(!collapsed)}
          className="w-full justify-start text-white hover:bg-white/10"
        >
          <Settings size={20} />
          {!collapsed && <span className="ml-2">Workspace</span>}
        </Button>
      </div>

      {/* Projects Section */}
      <div className="p-4 flex-1 overflow-y-auto">
        {!collapsed && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Active Projects</h3>
              <div className="space-y-2">
                {projects.map((project, index) => (
                  <Card key={index} className="p-3 bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">{project.name}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className={`w-2 h-2 rounded-full ${
                            project.status === 'active' ? 'bg-green-400' : 
                            project.status === 'building' ? 'bg-yellow-400' : 'bg-red-400'
                          }`} />
                          <span className="text-xs text-gray-400 capitalize">{project.status}</span>
                        </div>
                      </div>
                      {project.errors > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {project.errors}
                        </Badge>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Active Debugging</h3>
              <div className="space-y-2">
                {debuggingSessions.map((session) => (
                  <Card key={session.id} className="p-3 bg-red-500/10 border-red-500/20 cursor-pointer hover:bg-red-500/20 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">{session.title}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Users size={12} className="text-gray-400" />
                          <span className="text-xs text-gray-400">{session.participants} members</span>
                        </div>
                      </div>
                      <Badge className={`text-xs ${
                        session.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                        'bg-yellow-500/20 text-yellow-300'
                      }`}>
                        {session.priority}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Team Members</h3>
              <div className="space-y-2">
                {teamMembers.map((member, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                    <div className="relative">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback className="bg-gradient-ai text-white text-xs">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-black ${
                        member.status === 'online' ? 'status-online' :
                        member.status === 'busy' ? 'status-busy' : 'status-away'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{member.name}</p>
                      <p className="text-xs text-gray-400 truncate">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Git Activity</h3>
              <Card className="p-3 bg-gradient-git/10 border-pink-500/20">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <GitBranch size={14} className="text-pink-400" />
                    <span className="text-sm text-white">feature/payment-fix</span>
                  </div>
                  <p className="text-xs text-gray-400">Latest: Fix timeout issues in payment service</p>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-xs text-gray-400">3 active contributors</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
