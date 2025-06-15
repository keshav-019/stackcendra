import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from 'lucide-react';

interface SprintPlanningProps {
  isManagerMode: boolean;
}

export const SprintPlanning = ({ isManagerMode }: SprintPlanningProps) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');

  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Implement database connection pooling',
      description: 'Increase connection pool size to handle peak loads',
      status: 'todo',
      priority: 'high',
      assignedTo: 'Sarah Chen',
      dueDate: '2024-03-15'
    },
    {
      id: 2,
      title: 'Add circuit breaker pattern',
      description: 'Implement circuit breaker to prevent cascading failures',
      status: 'inprogress',
      priority: 'medium',
      assignedTo: 'Mike Rodriguez',
      dueDate: '2024-03-18'
    },
    {
      id: 3,
      title: 'Write integration tests for payment service',
      description: 'Cover timeout handling and error scenarios',
      status: 'done',
      priority: 'high',
      assignedTo: 'Alex Kumar',
      dueDate: '2024-03-12'
    }
  ]);

  const [teamVelocity] = useState({
    currentSprint: 45,
    average: 42,
    trend: '+5%'
  });

  const taskColumns = [
    {
      title: 'To Do',
      status: 'todo',
      color: 'bg-red-500'
    },
    {
      title: 'In Progress',
      status: 'inprogress',
      color: 'bg-blue-500'
    },
    {
      title: 'Done',
      status: 'done',
      color: 'bg-green-500'
    }
  ];

  const aiSprintAnalysis = {
    riskAssessment: 'Low',
    potentialBlockers: 'Database migration timing',
    recommendations: 'Run migrations during low-traffic hours'
  };

  const createNewTask = () => {
    if (!newTaskTitle.trim()) return;
    
    // In manager mode, create task but don't assign to manager
    console.log('Creating new task:', {
      title: newTaskTitle,
      description: newTaskDescription,
      priority: selectedPriority,
      createdBy: 'Manager',
      assignedTo: null // Manager cannot be assigned tasks
    });
    
    // Reset form
    setNewTaskTitle('');
    setNewTaskDescription('');
    setSelectedPriority('');
  };

  return (
    <div className="space-y-6">
      {/* Manager Task Creation */}
      {isManagerMode && (
        <Card className="bg-yellow-500/10 border-yellow-500/20 p-4">
          <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
            👑 Manager: Create New Task
          </h4>
          <div className="space-y-3">
            <Input
              placeholder="Task title..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
            />
            <Textarea
              placeholder="Task description..."
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
            />
            <div className="flex gap-2">
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={createNewTask} className="bg-yellow-500/20 text-yellow-300">
                Create Task
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Sprint Overview - Full Width */}
      <Card className="bg-gradient-sprint/10 border-green-500/20 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Calendar className="text-green-400" size={20} />
            Sprint Overview
          </h3>
          <Badge className="bg-green-500/20 text-green-300">
            Week 3 (March 11 - March 15)
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm font-medium text-green-300 mb-1">Tasks Completed</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-green-400">8 / 12</span>
              <Badge className="bg-green-500/20 text-green-300">67%</Badge>
            </div>
          </div>

          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm font-medium text-blue-300 mb-1">Tasks In Progress</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-blue-400">3</span>
              <Badge className="bg-blue-500/20 text-blue-300">Active</Badge>
            </div>
          </div>

          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm font-medium text-red-300 mb-1">Tasks Remaining</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-red-400">1</span>
              <Badge className="bg-red-500/20 text-red-300">Critical</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Task Columns - Full Width */}
      <div className="space-y-6">
        {taskColumns.map((column, index) => (
          <Card key={index} className={`bg-black/20 border-white/10 p-4`}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-md font-semibold text-white flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${column.color}`} />
                {column.title}
              </h4>
              <Badge className="bg-white/10 text-white">+</Badge>
            </div>
            <div className="space-y-3">
              {tasks
                .filter(task => task.status === column.status)
                .map((task) => (
                  <div key={task.id} className="p-3 border border-white/10 rounded-lg hover:border-white/20 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm text-white">{task.title}</p>
                      <Badge className={`text-xs ${
                        task.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                        task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-green-500/20 text-green-300'
                      }`}>
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400 mb-1">{task.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Assigned to: {task.assignedTo}</span>
                      <span>Due: {task.dueDate}</span>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Team Velocity - Full Width */}
      <Card className="bg-black/20 border-white/10 p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-semibold text-white">Team Velocity</h4>
          <Badge className="bg-blue-500/20 text-blue-300">Sprint 3</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 border border-white/10 rounded-lg">
            <p className="text-sm font-medium text-gray-300 mb-1">Current Sprint</p>
            <span className="text-2xl font-bold text-white">{teamVelocity.currentSprint}</span>
          </div>

          <div className="p-3 border border-white/10 rounded-lg">
            <p className="text-sm font-medium text-gray-300 mb-1">Average Velocity</p>
            <span className="text-2xl font-bold text-white">{teamVelocity.average}</span>
          </div>

          <div className="p-3 border border-white/10 rounded-lg">
            <p className="text-sm font-medium text-gray-300 mb-1">Trend</p>
            <span className="text-2xl font-bold text-white">{teamVelocity.trend}</span>
          </div>
        </div>
      </Card>

      {/* AI Sprint Analysis - Full Width */}
      <Card className="bg-gradient-ai/10 border-ai-primary/20 p-4">
        <h4 className="text-md font-semibold text-white mb-3">🤖 AI Sprint Analysis</h4>
        <div className="space-y-3">
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm font-medium text-red-300 mb-1">Risk Assessment</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-red-400">{aiSprintAnalysis.riskAssessment}</span>
              <Badge className="bg-red-500/20 text-red-300">High Priority</Badge>
            </div>
          </div>

          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm font-medium text-yellow-300 mb-1">Potential Blockers</p>
            <span className="text-sm text-yellow-400">{aiSprintAnalysis.potentialBlockers}</span>
          </div>

          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm font-medium text-green-300 mb-1">Recommendations</p>
            <span className="text-sm text-green-400">{aiSprintAnalysis.recommendations}</span>
          </div>
        </div>

        <Button className="w-full mt-4 bg-gradient-ai">
          Optimize Sprint with AI
        </Button>
      </Card>
    </div>
  );
};
