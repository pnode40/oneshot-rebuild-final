export interface TimelinePhase {
  id: string;
  title: string;
  tasks: TimelineTask[];
}

export interface TimelineTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface TimelineData {
  phases: TimelinePhase[];
} 