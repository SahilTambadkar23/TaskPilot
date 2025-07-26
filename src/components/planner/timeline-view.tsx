'use client';

import * as React from 'react';
import type { Task } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const HOURS_IN_DAY = 24;
const START_HOUR = 6;
const END_HOUR = 23;

const timeToPercentage = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  const totalMinutes = (hours - START_HOUR) * 60 + minutes;
  const totalDurationMinutes = (END_HOUR - START_HOUR + 1) * 60;
  return (totalMinutes / totalDurationMinutes) * 100;
};

const TaskBlock = ({ task }: { task: Task }) => {
  const top = timeToPercentage(task.startTime);
  const end = timeToPercentage(task.endTime);
  const height = end - top;
  
  // A simple hashing function to get a color index from task title
  const colorIndex = task.title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 5 + 1;

  if (height <= 0) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'absolute w-full rounded-lg p-2 text-white transition-all duration-300 ease-in-out',
              task.completed ? 'opacity-50' : 'opacity-90 hover:opacity-100',
              `bg-chart-${colorIndex}`
            )}
            style={{
              top: `${top}%`,
              height: `${height}%`,
              minHeight: '20px',
            }}
          >
            <p className="font-bold text-xs truncate">{task.title}</p>
            <p className="text-xs opacity-80">{`${task.startTime} - ${task.endTime}`}</p>
          </div>
        </TooltipTrigger>
        <TooltipContent>
            <p>{task.title}</p>
            <p className="text-sm text-muted-foreground">{`${task.startTime} - ${task.endTime}`}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export function TimelineView({ tasks }: { tasks: Task[] }) {
  const timelineHours = Array.from(
    { length: END_HOUR - START_HOUR + 1 },
    (_, i) => START_HOUR + i
  );

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader>
        <CardTitle>Daily Timeline</CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100vh-10rem)] overflow-y-auto pr-4">
        <div className="relative">
          {/* Hour markers and grid lines */}
          <div className="relative">
            {timelineHours.map((hour) => (
              <div key={hour} className="relative h-24 border-t border-dashed">
                <span className="absolute -top-3 -left-8 text-xs text-muted-foreground">
                  {hour.toString().padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* Task blocks */}
          <div className="absolute top-0 left-0 right-0 bottom-0 ml-4">
             {tasks.map((task) => (
               <TaskBlock key={task.id} task={task} />
             ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
