export interface Task {
  id: string;
  title: string;
  startTime: string; // "HH:mm" format
  endTime: string; // "HH:mm" format
  completed: boolean;
}

export interface Schedule {
  id: string;
  name: string;
  tasks: Task[];
}
