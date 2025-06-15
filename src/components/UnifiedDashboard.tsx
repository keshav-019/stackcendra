
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/Sidebar';
import { AIAssistant } from '@/components/AIAssistant';
import { GitTreeVisualization } from '@/components/GitTreeVisualization';
import { DockerTopology } from '@/components/DockerTopology';
import { DebuggingSession } from '@/components/DebuggingSession';
import { SprintPlanning } from '@/components/SprintPlanning';
import { VideoCallInterface } from '@/components/VideoCallInterface';
import { BottomDock } from '@/components/BottomDock';
import { NotificationCenter } from '@/components/NotificationCenter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Monitor, GitBranch, Settings, Users, Calendar } from 'lucide-react';

export const UnifiedDashboard = () => {
  const [activeTab, setActiveTab] = useState('debugging');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Main Dashboard Layout */}
      <div className="h-screen flex">
        {/* Left Sidebar */}
        <Sidebar collapsed={sidebarCollapsed} onToggle={setSidebarCollapsed} />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 bg-black/20 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 flex-shrink-0">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-ai rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <h1 className="text-xl font-bold gradient-text">DevOps AI Platform</h1>
            </div>
            <NotificationCenter />
          </header>

          {/* Tabbed Interface */}
          <div className="flex-1 flex flex-col p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
              <TabsList className="grid w-full grid-cols-5 mb-4 bg-black/20 flex-shrink-0">
                <TabsTrigger value="debugging" className="flex items-center gap-2">
                  <Monitor size={16} />
                  Debug Session
                </TabsTrigger>
                <TabsTrigger value="git" className="flex items-center gap-2">
                  <GitBranch size={16} />
                  Git Tree
                </TabsTrigger>
                <TabsTrigger value="docker" className="flex items-center gap-2">
                  <Settings size={16} />
                  Containers
                </TabsTrigger>
                <TabsTrigger value="sprint" className="flex items-center gap-2">
                  <Calendar size={16} />
                  Sprint
                </TabsTrigger>
                <TabsTrigger value="video" className="flex items-center gap-2">
                  <Users size={16} />
                  Team Call
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-hidden">
                <TabsContent value="debugging" className="h-full overflow-auto">
                  <DebuggingSession />
                </TabsContent>
                
                <TabsContent value="git" className="h-full overflow-auto">
                  <GitTreeVisualization />
                </TabsContent>
                
                <TabsContent value="docker" className="h-full overflow-auto">
                  <DockerTopology />
                </TabsContent>
                
                <TabsContent value="sprint" className="h-full overflow-auto">
                  <SprintPlanning />
                </TabsContent>
                
                <TabsContent value="video" className="h-full overflow-auto">
                  <VideoCallInterface />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>

        {/* Right Sidebar - AI Assistant */}
        {aiAssistantOpen && (
          <AIAssistant onClose={() => setAiAssistantOpen(false)} />
        )}
      </div>

      {/* Bottom Dock */}
      <BottomDock />
    </div>
  );
};
