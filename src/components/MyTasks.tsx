
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, AlertCircle, User, Calendar, GitBranch } from 'lucide-react';

export const MyTasks = () => {
  const [selectedTask, setSelectedTask] = useState<number | null>(null);

  const myTasks = [
    {
      id: 1,
      title: 'Implement database connection pooling',
      description: 'Increase connection pool size to handle peak loads during high traffic periods',
      status: 'inprogress',
      priority: 'high',
      assignedBy: 'Sarah Chen',
      dueDate: '2024-03-15',
      progress: 65,
      timeSpent: '4h 30m',
      estimatedTime: '8h',
      approach: [
        'Review current connection pool configuration',
        'Analyze peak load patterns from monitoring data',
        'Update pool size parameters in configuration',
        'Test with staging environment',
        'Monitor performance metrics after deployment'
      ],
      blockers: ['Waiting for staging environment access'],
      tags: ['backend', 'performance', 'database']
    },
    {
      id: 2,
      title: 'Write integration tests for payment service',
      description: 'Cover timeout handling and error scenarios for payment processing',
      status: 'todo',
      priority: 'medium',
      assignedBy: 'Mike Rodriguez',
      dueDate: '2024-03-18',
      progress: 0,
      timeSpent: '0h',
      estimatedTime: '6h',
      approach: [
        'Set up test environment with mock payment gateway',
        'Write tests for successful payment flows',
        'Add timeout scenario tests',
        'Implement error handling test cases',
        'Add edge case coverage for network failures'
      ],
      blockers: [],
      tags: ['testing', 'payment', 'integration']
    },
    {
      id: 3,
      title: 'Optimize Docker image build process',
      description: 'Reduce build time and image size for faster deployments',
      status: 'todo',
      priority: 'low',
      assignedBy: 'Alex Kumar',
      dueDate: '2024-03-20',
      progress: 0,
      timeSpent: '0h',
      estimatedTime: '4h',
      approach: [
        'Analyze current Dockerfile for optimization opportunities',
        'Implement multi-stage builds',
        'Add .dockerignore for unnecessary files',
        'Use smaller base images where possible',
        'Set up build caching strategies'
      ],
      blockers: [],
      tags: ['docker', 'devops', 'optimization']
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <CheckCircle className="text-green-400" size={16} />;
      case 'inprogress':
        return <Clock className="text-blue-400" size={16} />;
      default:
        return <AlertCircle className="text-gray-400" size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-500/20 text-green-300';
      case 'inprogress':
        return 'bg-blue-500/20 text-blue-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-300';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300';
      default:
        return 'bg-green-500/20 text-green-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* My Tasks Overview */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <User className="text-blue-400" size={20} />
            My Tasks Overview
          </h3>
          <Badge className="bg-blue-500/20 text-blue-300">
            {myTasks.filter(t => t.status === 'inprogress').length} Active
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm font-medium text-green-300 mb-1">Completed</p>
            <span className="text-2xl font-bold text-green-400">
              {myTasks.filter(t => t.status === 'done').length}
            </span>
          </div>

          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm font-medium text-blue-300 mb-1">In Progress</p>
            <span className="text-2xl font-bold text-blue-400">
              {myTasks.filter(t => t.status === 'inprogress').length}
            </span>
          </div>

          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm font-medium text-red-300 mb-1">To Do</p>
            <span className="text-2xl font-bold text-red-400">
              {myTasks.filter(t => t.status === 'todo').length}
            </span>
          </div>
        </div>
      </Card>

      {/* Task List */}
      <div className="space-y-4">
        {myTasks.map((task) => (
          <Card key={task.id} className="bg-black/20 border-white/10 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                {getStatusIcon(task.status)}
                <div>
                  <h4 className="text-md font-semibold text-white">{task.title}</h4>
                  <p className="text-sm text-gray-400 mt-1">{task.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
                <Badge className={getStatusColor(task.status)}>
                  {task.status}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <User size={14} />
                <span>Assigned by: {task.assignedBy}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar size={14} />
                <span>Due: {task.dueDate}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock size={14} />
                <span>{task.timeSpent} / {task.estimatedTime}</span>
              </div>
            </div>

            {task.status === 'inprogress' && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">Progress</span>
                  <span className="text-sm text-gray-400">{task.progress}%</span>
                </div>
                <Progress value={task.progress} className="h-2" />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag, index) => (
                  <Badge key={index} className="bg-white/10 text-white text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
                className="text-white border-white/20"
              >
                {selectedTask === task.id ? 'Hide Details' : 'View Details'}
              </Button>
            </div>

            {selectedTask === task.id && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-semibold text-white mb-2">Approach Strategy</h5>
                    <ul className="space-y-2">
                      {task.approach.map((step, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                          <span className="text-blue-400 font-bold">{index + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {task.blockers.length > 0 && (
                    <div>
                      <h5 className="text-sm font-semibold text-red-300 mb-2">Current Blockers</h5>
                      <ul className="space-y-1">
                        {task.blockers.map((blocker, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-red-400">
                            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                            <span>{blocker}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button size="sm" className="bg-blue-500/20 text-blue-300">
                      Start Working
                    </Button>
                    <Button size="sm" variant="outline" className="text-white border-white/20">
                      Update Progress
                    </Button>
                    <Button size="sm" variant="outline" className="text-white border-white/20">
                      <GitBranch size={14} className="mr-1" />
                      Create Branch
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* AI Task Assistant */}
      <Card className="bg-gradient-ai/10 border-ai-primary/20 p-4">
        <h4 className="text-md font-semibold text-white mb-3">🤖 AI Task Assistant</h4>
        <div className="space-y-3">
          <div className="p-3 bg-white/5 rounded-lg">
            <p className="text-sm font-medium text-ai-primary mb-1">Smart Suggestions</p>
            <p className="text-xs text-gray-300">
              Consider tackling high-priority tasks first. The database pooling task is blocking other team members.
            </p>
          </div>
          
          <div className="p-3 bg-white/5 rounded-lg">
            <p className="text-sm font-medium text-ai-primary mb-1">Time Management</p>
            <p className="text-xs text-gray-300">
              You're on track with current progress. Estimated completion: 2 days ahead of schedule.
            </p>
          </div>

          <Button className="w-full bg-gradient-ai text-sm">
            Get AI Task Recommendations
          </Button>
        </div>
      </Card>
    </div>
  );
};
