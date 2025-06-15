
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Users, GitBranch, Settings } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export const SprintPlanning = () => {
  const [sprintProgress, setSprintProgress] = useState(64);
  const [burndownData, setBurndownData] = useState([
    { day: 1, planned: 100, actual: 100 },
    { day: 2, planned: 92, actual: 95 },
    { day: 3, planned: 84, actual: 88 },
    { day: 4, planned: 76, actual: 82 },
    { day: 5, planned: 68, actual: 75 },
    { day: 6, planned: 60, actual: 64 },
    { day: 7, planned: 52, actual: 58 },
  ]);

  const sprintGoals = [
    { id: 1, title: 'Fix Payment Service Performance', priority: 'critical', progress: 85, assignee: 'Alex Kumar' },
    { id: 2, title: 'Implement Circuit Breaker Pattern', priority: 'high', progress: 60, assignee: 'Sarah Chen' },
    { id: 3, title: 'Database Connection Optimization', priority: 'high', progress: 40, assignee: 'Mike Rodriguez' },
    { id: 4, title: 'Add Monitoring Dashboard', priority: 'medium', progress: 20, assignee: 'Lisa Park' },
  ];

  const [tasks, setTasks] = useState({
    'todo': [
      {
        id: 'task-1',
        title: 'Implement retry logic for payment failures',
        description: 'Add exponential backoff retry mechanism',
        assignee: 'Alex Kumar',
        storyPoints: 5,
        priority: 'high',
        aiSuggestion: 'Based on error patterns, focus on timeout scenarios'
      },
      {
        id: 'task-2',
        title: 'Database connection pool tuning',
        description: 'Optimize connection pool parameters',
        assignee: 'Mike Rodriguez',
        storyPoints: 3,
        priority: 'medium',
        aiSuggestion: 'Historical data suggests 25 connections optimal'
      }
    ],
    'in-progress': [
      {
        id: 'task-3',
        title: 'Circuit breaker implementation',
        description: 'Add circuit breaker for external service calls',
        assignee: 'Sarah Chen',
        storyPoints: 8,
        priority: 'critical',
        aiSuggestion: 'Similar implementations show 40% error reduction'
      }
    ],
    'review': [
      {
        id: 'task-4',
        title: 'Performance monitoring setup',
        description: 'Configure APM tools for service monitoring',
        assignee: 'Lisa Park',
        storyPoints: 3,
        priority: 'medium',
        aiSuggestion: 'Auto-deploy with current CI/CD pipeline'
      }
    ],
    'done': [
      {
        id: 'task-5',
        title: 'Error logging improvements',
        description: 'Enhanced error logging with structured data',
        assignee: 'Alex Kumar',
        storyPoints: 2,
        priority: 'low',
        aiSuggestion: 'Deployment successful, 95% error visibility improved'
      }
    ]
  });

  const teamVelocity = {
    current: 47,
    average: 52,
    target: 55,
    trend: 'improving'
  };

  const aiInsights = [
    {
      type: 'prediction',
      title: 'Sprint Completion Probability',
      value: '87%',
      description: 'Based on current velocity and remaining work',
      confidence: 'high'
    },
    {
      type: 'recommendation',
      title: 'Resource Optimization',
      value: 'Reassign 1 story',
      description: 'Move database task to next sprint for better balance',
      confidence: 'medium'
    },
    {
      type: 'risk',
      title: 'Dependency Risk',
      value: 'Medium',
      description: 'Circuit breaker blocks 2 other tasks',
      confidence: 'high'
    }
  ];

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const { source, destination } = result;
    
    if (source.droppableId !== destination.droppableId) {
      const sourceItems = Array.from(tasks[source.droppableId]);
      const destItems = Array.from(tasks[destination.droppableId]);
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);
      
      setTasks({
        ...tasks,
        [source.droppableId]: sourceItems,
        [destination.droppableId]: destItems
      });
    }
  };

  return (
    <div className="h-full grid grid-cols-4 gap-4">
      {/* Sprint Overview */}
      <div className="space-y-4">
        <Card className="bg-gradient-ai/10 border-ai-primary/20 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Calendar className="text-ai-primary" size={20} />
              Sprint 47
            </h3>
            <Badge className="bg-green-500/20 text-green-300">Active</Badge>
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">Progress</span>
                <span className="text-sm text-white">{sprintProgress}%</span>
              </div>
              <Progress value={sprintProgress} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <p className="text-2xl font-bold text-white">{teamVelocity.current}</p>
                <p className="text-xs text-gray-400">Story Points</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">6</p>
                <p className="text-xs text-gray-400">Days Left</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-black/20 border-white/10 p-4">
          <h4 className="text-md font-semibold text-white mb-3">Sprint Goals</h4>
          <div className="space-y-3">
            {sprintGoals.map((goal) => (
              <div key={goal.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white">{goal.title}</span>
                  <Badge className={`text-xs ${
                    goal.priority === 'critical' ? 'bg-red-500/20 text-red-300' :
                    goal.priority === 'high' ? 'bg-orange-500/20 text-orange-300' :
                    'bg-blue-500/20 text-blue-300'
                  }`}>
                    {goal.priority}
                  </Badge>
                </div>
                <Progress value={goal.progress} className="h-2" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{goal.assignee}</span>
                  <span className="text-xs text-white">{goal.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-gradient-ai/10 border-ai-primary/20 p-4">
          <h4 className="text-md font-semibold text-white mb-3">🤖 AI Sprint Insights</h4>
          <div className="space-y-3">
            {aiInsights.map((insight, index) => (
              <div key={index} className="p-3 bg-white/5 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white">{insight.title}</span>
                  <Badge className={`text-xs ${
                    insight.confidence === 'high' ? 'bg-green-500/20 text-green-300' :
                    'bg-yellow-500/20 text-yellow-300'
                  }`}>
                    {insight.confidence}
                  </Badge>
                </div>
                <p className="text-lg font-bold text-ai-primary">{insight.value}</p>
                <p className="text-xs text-gray-400">{insight.description}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Kanban Board */}
      <div className="col-span-3">
        <Card className="bg-black/20 border-white/10 p-4 h-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Sprint Board</h3>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline">Add Story</Button>
              <Button size="sm" className="bg-gradient-ai">AI Optimize</Button>
            </div>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-4 gap-4 h-[calc(100%-80px)]">
              {Object.entries(tasks).map(([columnId, columnTasks]) => (
                <div key={columnId} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white capitalize">
                      {columnId.replace('-', ' ')}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {columnTasks.length}
                    </Badge>
                  </div>
                  
                  <Droppable droppableId={columnId}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-2 min-h-80 p-2 rounded-lg transition-colors ${
                          snapshot.isDraggingOver ? 'bg-white/10' : 'bg-white/5'
                        }`}
                      >
                        {columnTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`p-3 bg-white/10 border-white/20 cursor-grab active:cursor-grabbing transition-all ${
                                  snapshot.isDragging ? 'rotate-2 shadow-lg' : ''
                                }`}
                              >
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <Badge className={`text-xs ${
                                      task.priority === 'critical' ? 'bg-red-500/20 text-red-300' :
                                      task.priority === 'high' ? 'bg-orange-500/20 text-orange-300' :
                                      task.priority === 'medium' ? 'bg-blue-500/20 text-blue-300' :
                                      'bg-gray-500/20 text-gray-300'
                                    }`}>
                                      {task.priority}
                                    </Badge>
                                    <span className="text-xs text-gray-400">{task.storyPoints} pts</span>
                                  </div>
                                  
                                  <h5 className="text-sm font-medium text-white">{task.title}</h5>
                                  <p className="text-xs text-gray-400">{task.description}</p>
                                  
                                  {task.aiSuggestion && (
                                    <div className="p-2 bg-ai-primary/10 border border-ai-primary/20 rounded text-xs">
                                      <span className="text-ai-primary font-medium">AI: </span>
                                      <span className="text-gray-300">{task.aiSuggestion}</span>
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center justify-between">
                                    <Avatar className="w-6 h-6">
                                      <AvatarFallback className="bg-gradient-ai text-white text-xs">
                                        {task.assignee.split(' ').map(n => n[0]).join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex space-x-1">
                                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                        <GitBranch size={12} />
                                      </Button>
                                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                        <Settings size={12} />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        </Card>
      </div>
    </div>
  );
};
