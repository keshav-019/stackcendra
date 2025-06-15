import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Monitor, Settings, Play, GitBranch, Calendar } from 'lucide-react';

interface VideoCallInterfaceProps {
  isManagerMode: boolean;
}

export const VideoCallInterface = ({ isManagerMode }: VideoCallInterfaceProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingType, setMeetingType] = useState('');

  const participants = [
    {
      name: 'Sarah Chen',
      role: 'DevOps Lead',
      avatar: 'SC',
      status: 'speaking',
      muted: false,
      video: true,
      sharing: false
    },
    {
      name: 'Mike Rodriguez',
      role: 'Backend Dev',
      avatar: 'MR',
      status: 'listening',
      muted: false,
      video: true,
      sharing: false
    },
    {
      name: 'Alex Kumar',
      role: 'AI Engineer',
      avatar: 'AK',
      status: 'listening',
      muted: true,
      video: true,
      sharing: true
    },
    {
      name: 'Lisa Park',
      role: 'Frontend Dev',
      avatar: 'LP',
      status: 'listening',
      muted: false,
      video: false,
      sharing: false
    }
  ];

  const chatMessages = [
    {
      id: 1,
      sender: 'AI Assistant',
      message: '🤖 Meeting summary so far:\n• Payment service issue identified\n• Database optimization discussed\n• Circuit breaker implementation planned',
      timestamp: '2:34 PM',
      isAI: true
    },
    {
      id: 2,
      sender: 'Sarah Chen',
      message: 'The connection pool fix looks good. Should we deploy to staging first?',
      timestamp: '2:35 PM',
      isAI: false
    },
    {
      id: 3,
      sender: 'Mike Rodriguez',
      message: 'Yes, let me set up the staging deployment pipeline',
      timestamp: '2:36 PM',
      isAI: false
    },
    {
      id: 4,
      sender: 'AI Assistant',
      message: '💡 Suggestion: Based on similar deployments, consider these rollback triggers:\n• Error rate > 2%\n• Response time > 3s\n• CPU usage > 85%',
      timestamp: '2:37 PM',
      isAI: true
    }
  ];

  const meetingNotes = [
    {
      timestamp: '2:30 PM',
      speaker: 'Sarah Chen',
      note: 'Identified payment service connection timeout issue',
      aiConfidence: 95
    },
    {
      timestamp: '2:32 PM',
      speaker: 'Alex Kumar',
      note: 'Proposed increasing connection pool from 10 to 25',
      aiConfidence: 89
    },
    {
      timestamp: '2:34 PM',
      speaker: 'Mike Rodriguez',
      note: 'Agreed to implement circuit breaker pattern',
      aiConfidence: 92
    },
    {
      timestamp: '2:36 PM',
      speaker: 'AI Assistant',
      note: 'Generated deployment strategy with automated rollback',
      aiConfidence: 98
    }
  ];

  const actionItems = [
    {
      id: 1,
      task: 'Deploy payment service fix to staging',
      assignee: 'Mike Rodriguez',
      dueDate: 'Today 5:00 PM',
      priority: 'high',
      aiGenerated: false
    },
    {
      id: 2,
      task: 'Implement circuit breaker pattern',
      assignee: 'Sarah Chen',
      dueDate: 'Tomorrow 2:00 PM',
      priority: 'medium',
      aiGenerated: true
    },
    {
      id: 3,
      task: 'Set up monitoring alerts for connection pool',
      assignee: 'Alex Kumar',
      dueDate: 'End of week',
      priority: 'medium',
      aiGenerated: true
    }
  ];

  const sharedContent = {
    type: 'code',
    title: 'Database Connection Configuration',
    content: `// payment-service/src/db/connection.js
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  max: 25, // Increased from 10
  connectionTimeoutMillis: 2000,
  idleTimeoutMillis: 30000,
  allowExitOnIdle: true
});`
  };

  const scheduledCalls = [
    {
      id: 1,
      title: 'Sprint Retrospective',
      date: '2024-03-16',
      time: '2:00 PM',
      duration: '1 hour',
      participants: ['Sarah Chen', 'Mike Rodriguez', 'Alex Kumar', 'Lisa Park'],
      type: 'retrospective',
      status: 'upcoming'
    },
    {
      id: 2,
      title: 'Code Review Session',
      date: '2024-03-17',
      time: '10:00 AM',
      duration: '45 minutes',
      participants: ['Sarah Chen', 'Alex Kumar'],
      type: 'review',
      status: 'upcoming'
    },
    {
      id: 3,
      title: 'Daily Standup',
      date: '2024-03-15',
      time: '9:00 AM',
      duration: '15 minutes',
      participants: ['Sarah Chen', 'Mike Rodriguez', 'Alex Kumar', 'Lisa Park'],
      type: 'standup',
      status: 'completed'
    }
  ];

  const scheduleInstantMeeting = () => {
    console.log('Starting instant meeting as manager');
  };

  const scheduleFutureMeeting = () => {
    if (!meetingTitle.trim() || !meetingTime) return;
    
    console.log('Scheduling meeting:', {
      title: meetingTitle,
      time: meetingTime,
      type: meetingType,
      scheduledBy: 'Manager'
    });
    
    // Reset form
    setMeetingTitle('');
    setMeetingTime('');
    setMeetingType('');
  };

  return (
    <div className="space-y-6">
      {/* Manager Meeting Controls */}
      {isManagerMode && (
        <Card className="bg-yellow-500/10 border-yellow-500/20 p-4">
          <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
            👑 Manager: Meeting Controls
          </h4>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button onClick={scheduleInstantMeeting} className="bg-green-500/20 text-green-300">
                Start Instant Meeting
              </Button>
            </div>
            
            <div className="border-t border-white/10 pt-3">
              <p className="text-sm text-gray-300 mb-2">Schedule Future Meeting</p>
              <div className="space-y-2">
                <Input
                  placeholder="Meeting title..."
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
                <div className="flex gap-2">
                  <Input
                    type="datetime-local"
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                  <Select value={meetingType} onValueChange={setMeetingType}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standup">Daily Standup</SelectItem>
                      <SelectItem value="planning">Sprint Planning</SelectItem>
                      <SelectItem value="review">Code Review</SelectItem>
                      <SelectItem value="retrospective">Retrospective</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={scheduleFutureMeeting} className="bg-blue-500/20 text-blue-300">
                    Schedule
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Video Call Interface - Full Width */}
      <Card className="bg-gradient-video/10 border-purple-500/20 p-4">
        {/* Video Grid */}
        <div className="col-span-2 space-y-4">
          <Card className="bg-black/20 border-white/10 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Users className="text-blue-400" size={20} />
                Team Debug Session
              </h3>
              <div className="flex items-center space-x-2">
                <Badge className="bg-red-500/20 text-red-300 animate-pulse">LIVE</Badge>
                <span className="text-sm text-gray-400">32:15</span>
              </div>
            </div>

            {/* Main Speaker View */}
            <div className="relative mb-4">
              <div className="video-tile speaking aspect-video rounded-lg p-6 flex items-center justify-center">
                <div className="text-center">
                  <Avatar className="w-20 h-20 mb-4 mx-auto">
                    <AvatarFallback className="bg-gradient-ai text-white text-2xl">
                      {participants.find(p => p.status === 'speaking')?.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <h4 className="text-xl font-semibold text-white">
                    {participants.find(p => p.status === 'speaking')?.name}
                  </h4>
                  <p className="text-sm text-gray-400">
                    {participants.find(p => p.status === 'speaking')?.role}
                  </p>
                </div>
                
                {/* Speaking Indicator */}
                <div className="absolute top-4 left-4 flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm text-green-400 font-medium">Speaking</span>
                </div>

                {/* Screen Share Indicator */}
                {participants.find(p => p.sharing) && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-blue-500/20 text-blue-300">
                      <Monitor size={12} className="mr-1" />
                      Screen Sharing
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Participant Thumbnails */}
            <div className="grid grid-cols-4 gap-3">
              {participants.map((participant, index) => (
                <div key={index} className={`video-tile rounded-lg p-3 flex flex-col items-center justify-center aspect-video ${
                  participant.status === 'speaking' ? 'speaking' : ''
                }`}>
                  <Avatar className="w-12 h-12 mb-2">
                    <AvatarFallback className="bg-gradient-ai text-white text-sm">
                      {participant.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-xs text-white text-center font-medium">{participant.name}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    {participant.muted && (
                      <div className="w-2 h-2 bg-red-400 rounded-full" />
                    )}
                    {!participant.video && (
                      <div className="w-2 h-2 bg-gray-400 rounded-full" />
                    )}
                    {participant.sharing && (
                      <div className="w-2 h-2 bg-blue-400 rounded-full" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center space-x-4 mt-6">
              <Button
                variant={isMuted ? "destructive" : "secondary"}
                size="lg"
                onClick={() => setIsMuted(!isMuted)}
                className="w-12 h-12 rounded-full p-0"
              >
                🎤
              </Button>
              <Button
                variant={isVideoOff ? "destructive" : "secondary"}
                size="lg"
                onClick={() => setIsVideoOff(!isVideoOff)}
                className="w-12 h-12 rounded-full p-0"
              >
                📹
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="w-12 h-12 rounded-full p-0"
              >
                📱
              </Button>
              <Button
                variant="destructive"
                size="lg"
                className="px-6 rounded-full"
              >
                End Call
              </Button>
            </div>
          </Card>

          {/* Shared Content */}
          <Card className="bg-black/20 border-white/10 p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-semibold text-white">Shared Content</h4>
              <Badge className="bg-blue-500/20 text-blue-300">
                Shared by Alex Kumar
              </Badge>
            </div>
            
            <div className="code-block p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">{sharedContent.title}</span>
                <Button size="sm" variant="outline" className="h-6">
                  <GitBranch size={12} className="mr-1" />
                  Apply
                </Button>
              </div>
              <pre className="text-sm text-gray-100 overflow-x-auto">
                <code>{sharedContent.content}</code>
              </pre>
            </div>
          </Card>
        </div>
      </Card>

      {/* Scheduled Calls Section */}
      <Card className="bg-black/20 border-white/10 p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-semibold text-white flex items-center gap-2">
            <Calendar className="text-purple-400" size={20} />
            Scheduled Calls
          </h4>
          <Badge className="bg-purple-500/20 text-purple-300">
            {scheduledCalls.filter(call => call.status === 'upcoming').length} Upcoming
          </Badge>
        </div>

        <div className="space-y-3">
          {scheduledCalls.map((call) => (
            <div key={call.id} className={`p-3 rounded-lg border ${
              call.status === 'upcoming' ? 'bg-purple-500/10 border-purple-500/20' : 'bg-gray-500/10 border-gray-500/20'
            }`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h5 className="text-sm font-semibold text-white">{call.title}</h5>
                  <p className="text-xs text-gray-400">
                    {call.date} at {call.time} • {call.duration}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${
                    call.type === 'standup' ? 'bg-blue-500/20 text-blue-300' :
                    call.type === 'review' ? 'bg-green-500/20 text-green-300' :
                    call.type === 'retrospective' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-purple-500/20 text-purple-300'
                  }`}>
                    {call.type}
                  </Badge>
                  <Badge className={`text-xs ${
                    call.status === 'upcoming' ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'
                  }`}>
                    {call.status}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Participants:</span>
                  <div className="flex -space-x-1">
                    {call.participants.slice(0, 3).map((participant, index) => (
                      <Avatar key={index} className="w-6 h-6 border border-white/20">
                        <AvatarFallback className="bg-gradient-ai text-white text-xs">
                          {participant.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {call.participants.length > 3 && (
                      <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-xs text-white">
                        +{call.participants.length - 3}
                      </div>
                    )}
                  </div>
                </div>
                
                {call.status === 'upcoming' && (
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-green-500/20 text-green-300 text-xs">
                      Join
                    </Button>
                    {isManagerMode && (
                      <Button size="sm" variant="outline" className="text-white border-white/20 text-xs">
                        Edit
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Sidebar - Chat, Notes, Actions */}
      <div className="space-y-4">
        <Card className="bg-black/20 border-white/10 p-4 h-96">
          <Tabs defaultValue="chat" className="h-full">
            <TabsList className="grid w-full grid-cols-3 mb-3">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="h-80">
              <ScrollArea className="h-64 mb-3">
                <div className="space-y-3">
                  {chatMessages.map((message) => (
                    <div key={message.id} className={`p-3 rounded-lg ${
                      message.isAI ? 'ai-message' : 'bg-white/5'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white">
                          {message.sender}
                        </span>
                        <span className="text-xs text-gray-400">{message.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-100 whitespace-pre-wrap">{message.message}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="flex space-x-2">
                <Input
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-white/5 border-white/10 text-white"
                />
                <Button size="sm">Send</Button>
              </div>
            </TabsContent>
            
            <TabsContent value="notes" className="h-80">
              <ScrollArea className="h-full">
                <div className="space-y-3">
                  {meetingNotes.map((note, index) => (
                    <div key={index} className="p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">{note.timestamp}</span>
                        <Badge className="bg-ai-primary/20 text-ai-primary text-xs">
                          {note.aiConfidence}% AI
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-white mb-1">{note.speaker}</p>
                      <p className="text-sm text-gray-300">{note.note}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="actions" className="h-80">
              <ScrollArea className="h-full">
                <div className="space-y-3">
                  {actionItems.map((item) => (
                    <div key={item.id} className="p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={`text-xs ${
                          item.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                          'bg-blue-500/20 text-blue-300'
                        }`}>
                          {item.priority}
                        </Badge>
                        {item.aiGenerated && (
                          <Badge className="bg-ai-primary/20 text-ai-primary text-xs">AI</Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium text-white mb-1">{item.task}</p>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{item.assignee}</span>
                        <span>{item.dueDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </Card>

        <Card className="bg-gradient-ai/10 border-ai-primary/20 p-4">
          <h4 className="text-md font-semibold text-white mb-3">🤖 AI Meeting Assistant</h4>
          <div className="space-y-3">
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-sm font-medium text-ai-primary mb-1">Real-time Insights</p>
              <p className="text-xs text-gray-300">
                Discussion focused on performance optimization (73% of time). 
                High team engagement detected.
              </p>
            </div>
            
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-sm font-medium text-ai-primary mb-1">Next Steps Suggestion</p>
              <p className="text-xs text-gray-300">
                Consider scheduling follow-up in 2 days to review staging deployment results.
              </p>
            </div>

            <Button className="w-full bg-gradient-ai text-sm">
              Generate Meeting Summary
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
