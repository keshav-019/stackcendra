"use client";

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
import { MyTasks } from '@/components/MyTasks';
import { BottomDock } from '@/components/BottomDock';
import { NotificationCenter } from '@/components/NotificationCenter';
import { UserDropdown } from '@/components/UserDropdown';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Monitor, GitBranch, Settings, Users, Calendar, MessageCircle } from 'lucide-react';
import { LogoMark } from '@/components/Logo';

export const UnifiedDashboard = () => {
  const [activeTab, setActiveTab] = useState('debugging');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(true);
  const [isManagerMode, setIsManagerMode] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Main Dashboard Layout */}
      <div className="h-[calc(100vh-4.5rem)] flex">
        {/* Left Sidebar */}
        <Sidebar collapsed={sidebarCollapsed} onToggle={setSidebarCollapsed} />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 bg-black/20 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 flex-shrink-0">
            <div className="flex items-center space-x-4">
              <LogoMark size={32} />
              <h1 className="text-xl font-bold gradient-text">StackCendra</h1>
            </div>
            <div className="flex items-center space-x-2">
              <NotificationCenter />
              <UserDropdown 
                isManagerMode={isManagerMode} 
                onToggleManagerMode={setIsManagerMode}
                onOpenAI={() => setAiAssistantOpen(true)}
              />
            </div>
          </header>

          {/* Tabbed Interface */}
          <div className="flex-1 flex flex-col p-4 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
              <TabsList className={`grid w-full ${isManagerMode ? 'grid-cols-5' : 'grid-cols-6'} mb-4 bg-black/20 flex-shrink-0`}>
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
                {!isManagerMode && (
                  <TabsTrigger value="mytasks" className="flex items-center gap-2">
                    <Users size={16} />
                    My Tasks
                  </TabsTrigger>
                )}
              </TabsList>

              <div className="flex-1 overflow-hidden">
                <TabsContent value="debugging" className="h-full">
                  <div className="h-full overflow-y-auto pr-2 pb-6">
                    <DebuggingSession />
                  </div>
                </TabsContent>
                
                <TabsContent value="git" className="h-full">
                  <div className="h-full overflow-y-auto pr-2 pb-6">
                    <GitTreeVisualization />
                  </div>
                </TabsContent>
                
                <TabsContent value="docker" className="h-full">
                  <div className="h-full overflow-y-auto pr-2 pb-6">
                    <DockerTopology />
                  </div>
                </TabsContent>
                
                <TabsContent value="sprint" className="h-full">
                  <div className="h-full overflow-y-auto pr-2 pb-6">
                    <SprintPlanning isManagerMode={isManagerMode} />
                  </div>
                </TabsContent>
                
                <TabsContent value="video" className="h-full">
                  <div className="h-full overflow-y-auto pr-2 pb-6">
                    <VideoCallInterface isManagerMode={isManagerMode} />
                  </div>
                </TabsContent>

                {!isManagerMode && (
                  <TabsContent value="mytasks" className="h-full">
                    <div className="h-full overflow-y-auto pr-2 pb-6">
                      <MyTasks />
                    </div>
                  </TabsContent>
                )}
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

      {/* Floating AI Chat Button */}
      {!aiAssistantOpen && (
        <Button
          onClick={() => setAiAssistantOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-ai hover:opacity-80 shadow-lg z-50 flex items-center justify-center"
        >
          <MessageCircle size={24} />
        </Button>
      )}
    </div>
  );
};
