'use client';

import * as React from 'react';
import { Clock, GripVertical, Plus, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { AddTaskDialog } from '@/components/planner/add-task-dialog';
import { SmartScheduleDialog } from '@/components/planner/smart-schedule-dialog';
import { TimelineView } from '@/components/planner/timeline-view';
import { useSchedule } from '@/hooks/use-schedule';
import type { Task } from '@/types';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function Header({
  onAddTask,
  onSmartSchedule,
  schedules,
  currentScheduleId,
  onScheduleChange,
  onNewSchedule,
}: {
  onAddTask: () => void;
  onSmartSchedule: () => void;
  schedules: { id: string; name: string }[];
  currentScheduleId: string;
  onScheduleChange: (id: string) => void;
  onNewSchedule: (name: string) => void;
}) {
  const handleNewSchedule = () => {
    const name = prompt('Enter new schedule name:');
    if (name) {
      onNewSchedule(name);
    }
  };

  return (
    <header className="bg-card/80 backdrop-blur-sm sticky top-0 z-40 border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Clock className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold font-headline text-foreground">
            Chronos Flow
          </h1>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <Select value={currentScheduleId} onValueChange={onScheduleChange}>
            <SelectTrigger className="w-[180px] hidden md:flex">
              <SelectValue placeholder="Select schedule" />
            </SelectTrigger>
            <SelectContent>
              {schedules.map((schedule) => (
                <SelectItem key={schedule.id} value={schedule.id}>
                  {schedule.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNewSchedule}
            className="hidden md:inline-flex"
          >
            New Schedule
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onSmartSchedule}
            className="h-9 w-9"
          >
            <Sparkles className="h-4 w-4" />
            <span className="sr-only">Smart Schedule</span>
          </Button>
          <Button onClick={onAddTask} size="sm" className="h-9">
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>
    </header>
  );
}

function TaskItem({
  task,
  onToggle,
  onDelete,
  onDragStart,
  onDragEnd,
  onDragOver,
  isDragging,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id:string) => void;
  onDragStart: (e: React.DragEvent<HTMLLIElement>, id: string) => void;
  onDragEnd: (e: React.DragEvent<HTMLLIElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLLIElement>, id: string) => void;
  isDragging: boolean;
}) {
  return (
    <li
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => onDragOver(e, task.id)}
      className={cn(
        'flex items-center gap-3 rounded-lg bg-card p-3 transition-all duration-300',
        isDragging ? 'opacity-50 scale-105 shadow-lg' : 'opacity-100',
        task.completed && 'opacity-60'
      )}
    >
      <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
      <Checkbox
        id={`task-${task.id}`}
        checked={task.completed}
        onCheckedChange={() => onToggle(task.id)}
      />
      <div className="flex-1">
        <label
          htmlFor={`task-${task.id}`}
          className={cn(
            'font-medium transition-colors',
            task.completed && 'line-through text-muted-foreground'
          )}
        >
          {task.title}
        </label>
        <p className="text-sm text-muted-foreground">
          {task.startTime} - {task.endTime}
        </p>
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => onDelete(task.id)}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </li>
  );
}

function TaskList({
  tasks,
  onToggle,
  onDelete,
  onReorder,
}: {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (draggedId: string, targetId: string) => void;
}) {
  const [draggedId, setDraggedId] = React.useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLLIElement>, id: string) => {
    e.preventDefault();
    if (draggedId && draggedId !== id) {
        onReorder(draggedId, id);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Today's Plan</CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length > 0 ? (
          <ul className="space-y-3">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggle}
                onDelete={onDelete}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                isDragging={draggedId === task.id}
              />
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted p-12 text-center">
            <h3 className="text-lg font-medium">No tasks yet</h3>
            <p className="text-sm text-muted-foreground">
              Add a task to get started.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const {
    schedules,
    currentSchedule,
    setCurrentScheduleId,
    addNewSchedule,
    addTask,
    toggleTask,
    deleteTask,
    reorderTasks,
    getTasksForAI,
  } = useSchedule();

  const [isAddTaskOpen, setAddTaskOpen] = React.useState(false);
  const [isSmartScheduleOpen, setSmartScheduleOpen] = React.useState(false);

  if (!currentSchedule) {
    return (
       <div className="flex h-screen items-center justify-center bg-background">
          <div className="text-center">
            <p className="text-muted-foreground">Loading schedules...</p>
         </div>
       </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header
        onAddTask={() => setAddTaskOpen(true)}
        onSmartSchedule={() => setSmartScheduleOpen(true)}
        schedules={schedules.map((s) => ({ id: s.id, name: s.name }))}
        currentScheduleId={currentSchedule.id}
        onScheduleChange={setCurrentScheduleId}
        onNewSchedule={addNewSchedule}
      />

      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-[1fr_1.5fr] xl:grid-cols-[1fr_2fr]">
          <div className="flex flex-col">
            <TaskList
              tasks={currentSchedule.tasks}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onReorder={reorderTasks}
            />
          </div>
          <div className="hidden md:block">
            <TimelineView tasks={currentSchedule.tasks} />
          </div>
        </div>
      </main>

      <AddTaskDialog
        isOpen={isAddTaskOpen}
        onOpenChange={setAddTaskOpen}
        onAddTask={(task) => {
          addTask(task);
          setAddTaskOpen(false);
        }}
      />
      <SmartScheduleDialog
        isOpen={isSmartScheduleOpen}
        onOpenChange={setSmartScheduleOpen}
        getTasksForAI={getTasksForAI}
      />
    </div>
  );
}
