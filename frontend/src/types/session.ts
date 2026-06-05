export interface TrainingSession {
  id: number;
  date: string;
  title?: string;
  notes?: string;
}

export interface TrainingSessionCreate {
  date: string;
  title?: string;
  notes?: string;
}
