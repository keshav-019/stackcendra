import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Bug, BookMarked, CheckSquare, Plus, TrendingUp } from 'lucide-react';

interface SprintPlanningProps {
  isManagerMode: boolean;
}

type IssueType = 'story' | 'bug' | 'task';

const issueTypeIcon: Record<IssueType, React.ElementType> = {
  story: BookMarked,
  bug: Bug,
  task: CheckSquare,
};

const issueTypeColor: Record<IssueType, string> = {
  story: 'text-green-400',
  bug: 'text-red-400',
  task: 'text-blue-400',
};

const priorityBorder: Record<string, string> = {
  high: 'border-l-red-500',
  medium: 'border-l-yellow-500',
  low: 'border-l-green-500',
};

export const SprintPlanning = ({ isManagerMode }: SprintPlanningProps) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [tasks, setTasks] = useState([
    {
      id: 1,
      key: 'SC-142',
      type: 'task' as IssueType,
      title: 'Implement database connection pooling',
      status: 'todo',
      priority: 'high',
      points: 5,
      assignedTo: 'Sarah Chen',
      avatar: 'SC',
      dueDate: 'Mar 15',
    },
    {
      id: 2,
      key: 'SC-138',
      type: 'story' as IssueType,
      title: 'Add circuit breaker pattern',
      status: 'inprogress',
      priority: 'medium',
      points: 8,
      assignedTo: 'Mike Rodriguez',
      avatar: 'MR',
      dueDate: 'Mar 18',
    },
    {
      id: 3,
      key: 'SC-129',
      type: 'bug' as IssueType,
      title: 'Write integration tests for payment service',
      status: 'done',
      priority: 'high',
      points: 3,
      assignedTo: 'Alex Kumar',
      avatar: 'AK',
      dueDate: 'Mar 12',
    },
  ]);

  const [teamVelocity] = useState({
    currentSprint: 45,
    average: 42,
    trend: '+5%',
  });

  const taskColumns = [
    { title: 'To Do', status: 'todo', color: 'bg-gray-400' },
    { title: 'In Progress', status: 'inprogress', color: 'bg-blue-500' },
    { title: 'Done', status: 'done', color: 'bg-green-500' },
  ];

  const aiSprintAnalysis = {
    riskAssessment: 'Low',
    potentialBlockers: 'Database migration timing',
    recommendations: 'Run migrations during low-traffic hours',
  };

  const createNewTask = () => {
    if (!newTaskTitle.trim()) return;

    setTasks((prev) => [
      ...prev,
      {
        id: Date.now(),
        key: `SC-${140 + prev.length}`,
        type: 'task',
        title: newTaskTitle,
        status: 'todo',
        priority: selectedPriority || 'medium',
        points: 3,
        assignedTo: 'Unassigned',
        avatar: '?',
        dueDate: '—',
      },
    ]);

    setNewTaskTitle('');
    setNewTaskDescription('');
    setSelectedPriority('');
    setShowCreateForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Sprint Overview */}
      <Card className="bg-black/20 border-white/10 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="text-green-400" size={20} />
            <div>
              <h3 className="text-lg font-semibold text-white">Sprint 3</h3>
              <p className="text-xs text-gray-400">March 11 – March 15</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-lg font-bold text-white">
                {tasks.filter((t) => t.status === 'done').length}/{tasks.length}
              </p>
              <p className="text-xs text-gray-400">Completed</p>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-300">
              <TrendingUp size={14} className="text-green-400" />
              <span>{teamVelocity.currentSprint} pts</span>
              <Badge variant="outline" className="text-xs ml-1">{teamVelocity.trend}</Badge>
            </div>
            <Button size="sm" onClick={() => setShowCreateForm((v) => !v)} className="bg-gradient-ai">
              <Plus size={14} className="mr-1" />
              Create Issue
            </Button>
          </div>
        </div>

        {showCreateForm && (
          <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
            <Input
              placeholder="Issue title..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
            />
            <Textarea
              placeholder="Description..."
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
              <Button onClick={createNewTask} className="bg-gradient-ai">
                Create
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {taskColumns.map((column) => {
          const columnTasks = tasks.filter((task) => task.status === column.status);
          return (
            <div key={column.status} className="bg-black/20 border border-white/10 rounded-lg p-3">
              <div className="flex items-center justify-between mb-3 px-1">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${column.color}`} />
                  {column.title}
                </h4>
                <Badge className="bg-white/10 text-gray-300 text-xs">{columnTasks.length}</Badge>
              </div>
              <div className="space-y-2">
                {columnTasks.map((task) => {
                  const TypeIcon = issueTypeIcon[task.type];
                  return (
                    <Card
                      key={task.id}
                      className={`p-3 bg-white/5 border border-white/10 border-l-4 ${priorityBorder[task.priority]} hover:bg-white/10 transition-colors cursor-pointer`}
                    >
                      <p className="text-sm text-white mb-2 leading-snug">{task.title}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <TypeIcon size={13} className={issueTypeColor[task.type]} />
                          <span className="text-xs text-gray-500 font-mono">{task.key}</span>
                          <Badge className="bg-white/10 text-gray-300 text-[10px] px-1.5">{task.points} pts</Badge>
                        </div>
                        <Avatar className="w-6 h-6" title={task.assignedTo}>
                          <AvatarFallback className="bg-gradient-ai text-white text-[10px]">
                            {task.avatar}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </Card>
                  );
                })}
                {columnTasks.length === 0 && (
                  <p className="text-xs text-gray-600 text-center py-4">No issues</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Sprint Analysis */}
      <Card className="bg-gradient-ai/10 border-ai-primary/20 p-4">
        <h4 className="text-md font-semibold text-white mb-3">🤖 AI Sprint Analysis</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm font-medium text-red-300 mb-1">Risk Assessment</p>
            <span className="text-xl font-bold text-red-400">{aiSprintAnalysis.riskAssessment}</span>
          </div>

          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm font-medium text-yellow-300 mb-1">Potential Blockers</p>
            <span className="text-sm text-yellow-400">{aiSprintAnalysis.potentialBlockers}</span>
          </div>

          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm font-medium text-green-300 mb-1">Recommendation</p>
            <span className="text-sm text-green-400">{aiSprintAnalysis.recommendations}</span>
          </div>
        </div>

        <Button className="w-full mt-4 bg-gradient-ai">Optimize Sprint with AI</Button>
      </Card>
    </div>
  );
};
