import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Plus, ChevronDown, ChevronRight, GitBranch, Star } from 'lucide-react';

type Group = 'Today' | 'This week' | 'Later' | 'Completed';

interface Task {
  id: number;
  title: string;
  notes: string;
  group: Group;
  done: boolean;
  starred: boolean;
  tags: string[];
}

const initialTasks: Task[] = [
  {
    id: 1,
    title: 'Implement database connection pooling',
    notes:
      'Increase connection pool size to handle peak loads. Review current config, analyze peak load patterns, update pool size, test in staging, monitor after deploy. Blocked on staging environment access.',
    group: 'Today',
    done: false,
    starred: true,
    tags: ['backend', 'performance'],
  },
  {
    id: 2,
    title: 'Write integration tests for payment service',
    notes: 'Cover timeout handling and error scenarios for payment processing, including network-failure edge cases.',
    group: 'This week',
    done: false,
    starred: false,
    tags: ['testing', 'payment'],
  },
  {
    id: 3,
    title: 'Optimize Docker image build process',
    notes: 'Reduce build time and image size using multi-stage builds and a .dockerignore.',
    group: 'Later',
    done: false,
    starred: false,
    tags: ['docker', 'devops'],
  },
  {
    id: 4,
    title: 'Fix flaky retry test in payment client',
    notes: 'Test intermittently fails under load; likely a race in the retry wrapper.',
    group: 'Completed',
    done: true,
    starred: false,
    tags: ['testing'],
  },
];

const groupOrder: Group[] = ['Today', 'This week', 'Later', 'Completed'];

export const MyTasks = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [newTask, setNewTask] = useState('');
  const [completedOpen, setCompletedOpen] = useState(false);

  const toggleDone = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done, group: !t.done ? 'Completed' : 'Today' } : t))
    );
  };

  const toggleStar = (id: number) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, starred: !t.starred } : t)));
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks((prev) => [
      { id: Date.now(), title: newTask.trim(), notes: '', group: 'Today', done: false, starred: false, tags: [] },
      ...prev,
    ]);
    setNewTask('');
  };

  const activeCount = tasks.filter((t) => !t.done).length;

  return (
    <div className="space-y-6">
      <Card className="bg-black/20 border-white/10 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">My Tasks</h3>
          <Badge className="bg-blue-500/20 text-blue-300">{activeCount} active</Badge>
        </div>

        <div className="flex items-center gap-2 mb-5">
          <Plus size={16} className="text-gray-500 flex-shrink-0" />
          <Input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder="Add a task"
            className="bg-transparent border-0 border-b border-white/10 rounded-none px-0 text-white placeholder:text-gray-500 focus-visible:ring-0 focus-visible:border-ai-primary"
          />
        </div>

        <div className="space-y-5">
          {groupOrder.map((group) => {
            const items = tasks.filter((t) => t.group === group);
            if (items.length === 0) return null;

            if (group === 'Completed') {
              return (
                <div key={group}>
                  <button
                    type="button"
                    onClick={() => setCompletedOpen((v) => !v)}
                    className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2"
                  >
                    {completedOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    Completed ({items.length})
                  </button>
                  {completedOpen && (
                    <div className="space-y-1">
                      {items.map((task) => (
                        <TaskRow key={task.id} task={task} onToggleDone={toggleDone} onToggleStar={toggleStar} />
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div key={group}>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{group}</p>
                <div className="space-y-1">
                  {items.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      onToggleDone={toggleDone}
                      onToggleStar={toggleStar}
                      expanded={expanded === task.id}
                      onToggleExpand={() => setExpanded(expanded === task.id ? null : task.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

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

          <Button className="w-full bg-gradient-ai text-sm">Get AI Task Recommendations</Button>
        </div>
      </Card>
    </div>
  );
};

interface TaskRowProps {
  task: Task;
  onToggleDone: (id: number) => void;
  onToggleStar: (id: number) => void;
  expanded?: boolean;
  onToggleExpand?: () => void;
}

const TaskRow: React.FC<TaskRowProps> = ({ task, onToggleDone, onToggleStar, expanded, onToggleExpand }) => {
  return (
    <div className="rounded-lg hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-3 px-2 py-2">
        <button
          type="button"
          onClick={() => onToggleDone(task.id)}
          className={cn(
            'w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors',
            task.done ? 'bg-ai-primary border-ai-primary' : 'border-white/30 hover:border-ai-primary'
          )}
        >
          {task.done && <div className="w-2 h-2 rounded-full bg-white" />}
        </button>

        <button
          type="button"
          onClick={onToggleExpand}
          className={cn('flex-1 min-w-0 text-left text-sm', task.done ? 'text-gray-500 line-through' : 'text-white')}
        >
          {task.title}
        </button>

        {task.tags.length > 0 && (
          <div className="hidden sm:flex gap-1 flex-shrink-0">
            {task.tags.map((tag) => (
              <Badge key={tag} className="bg-white/10 text-gray-300 text-[10px]">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <button type="button" onClick={() => onToggleStar(task.id)} className="flex-shrink-0">
          <Star size={14} className={task.starred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'} />
        </button>
      </div>

      {expanded && !task.done && (
        <div className="px-2 pb-3 pl-10 space-y-2">
          {task.notes && <p className="text-xs text-gray-400">{task.notes}</p>}
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="text-white border-white/20 text-xs h-7">
              <GitBranch size={12} className="mr-1" />
              Create Branch
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
