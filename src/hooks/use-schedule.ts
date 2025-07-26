'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Schedule, Task } from '@/types';
import { useToast } from './use-toast';

const LOCAL_STORAGE_KEY = 'taskpilot-schedules';

const createDefaultSchedule = (): Schedule => ({
  id: crypto.randomUUID(),
  name: 'My Day',
  tasks: [
    { id: crypto.randomUUID(), title: 'Morning Stand-up', startTime: '09:00', endTime: '09:15', completed: true },
    { id: crypto.randomUUID(), title: 'Focus Work: Project A', startTime: '09:30', endTime: '11:30', completed: false },
    { id: crypto.randomUUID(), title: 'Lunch Break', startTime: '12:00', endTime: '13:00', completed: false },
  ],
});

export function useSchedule() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [currentScheduleId, setCurrentScheduleId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        if (parsedData.schedules && parsedData.schedules.length > 0 && parsedData.currentScheduleId && parsedData.schedules.find((s: Schedule) => s.id === parsedData.currentScheduleId)) {
          setSchedules(parsedData.schedules);
          setCurrentScheduleId(parsedData.currentScheduleId);
        } else {
            const defaultSchedule = createDefaultSchedule();
            setSchedules([defaultSchedule]);
            setCurrentScheduleId(defaultSchedule.id);
        }
      } else {
        const defaultSchedule = createDefaultSchedule();
        setSchedules([defaultSchedule]);
        setCurrentScheduleId(defaultSchedule.id);
      }
    } catch (error) {
      console.error('Failed to load from localStorage', error);
      const defaultSchedule = createDefaultSchedule();
      setSchedules([defaultSchedule]);
      setCurrentScheduleId(defaultSchedule.id);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        const dataToStore = JSON.stringify({ schedules, currentScheduleId });
        localStorage.setItem(LOCAL_STORAGE_KEY, dataToStore);
      } catch (error) {
        console.error('Failed to save to localStorage', error);
         toast({
            variant: "destructive",
            title: "Error",
            description: "Could not save your schedule.",
        });
      }
    }
  }, [schedules, currentScheduleId, isLoaded, toast]);
  
  const currentSchedule = schedules.find(s => s.id === currentScheduleId);

  const updateTasksForCurrentSchedule = useCallback((newTasks: Task[] | ((tasks: Task[]) => Task[])) => {
    setSchedules(prevSchedules => 
        prevSchedules.map(schedule => {
            if (schedule.id === currentScheduleId) {
                const updatedTasks = typeof newTasks === 'function' ? newTasks(schedule.tasks) : newTasks;
                return { ...schedule, tasks: updatedTasks };
            }
            return schedule;
        })
    );
  }, [currentScheduleId]);


  const addTask = useCallback((taskData: Omit<Task, 'id' | 'completed'>) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      completed: false,
    };
    const newTasks = [...(currentSchedule?.tasks || []), newTask].sort(
      (a, b) => a.startTime.localeCompare(b.startTime)
    );
    updateTasksForCurrentSchedule(newTasks);
    toast({ title: 'Task Added', description: `"${newTask.title}" has been added.` });
  }, [currentSchedule, updateTasksForCurrentSchedule, toast]);

  const toggleTask = useCallback((taskId: string) => {
    updateTasksForCurrentSchedule(tasks => 
        tasks.map(task => 
            task.id === taskId ? { ...task, completed: !task.completed } : task
        )
    );
  }, [updateTasksForCurrentSchedule]);

  const deleteTask = useCallback((taskId: string) => {
    updateTasksForCurrentSchedule(tasks => tasks.filter(task => task.id !== taskId));
    toast({ title: 'Task Removed', variant: 'destructive' });
  }, [updateTasksForCurrentSchedule, toast]);
  
  const reorderTasks = useCallback((draggedId: string, targetId: string) => {
      if(draggedId === targetId) return;

      updateTasksForCurrentSchedule(currentTasks => {
          const draggedIndex = currentTasks.findIndex(t => t.id === draggedId);
          const targetIndex = currentTasks.findIndex(t => t.id === targetId);
          
          if(draggedIndex === -1 || targetIndex === -1) return currentTasks;

          const newTasks = [...currentTasks];
          const [draggedItem] = newTasks.splice(draggedIndex, 1);
          newTasks.splice(targetIndex, 0, draggedItem);
          
          return newTasks;
      });
  }, [updateTasksForCurrentSchedule]);

  const addNewSchedule = useCallback((name: string) => {
    const newSchedule: Schedule = {
        id: crypto.randomUUID(),
        name,
        tasks: [],
    };
    setSchedules(prev => [...prev, newSchedule]);
    setCurrentScheduleId(newSchedule.id);
    toast({ title: 'Schedule Created', description: `New schedule "${name}" is ready.` });
  }, [toast]);

  const getTasksForAI = useCallback(() => {
    return JSON.stringify(currentSchedule?.tasks || []);
  }, [currentSchedule]);

  return {
    schedules: schedules.map(s => ({id: s.id, name: s.name})),
    currentSchedule,
    setCurrentScheduleId,
    addNewSchedule,
    addTask,
    toggleTask,
    deleteTask,
    reorderTasks,
    getTasksForAI,
  };
}
