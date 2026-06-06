export interface Result {
  id: number;
  athleteId: number;
  sessionId: number;
  eventName: string;
  value: number;
  unit: string;
  resultDate: string;
  notes?: string;
  athleteName: string;
  sessionDate: string;
}

export interface ResultCreate {
  athleteId: number;
  sessionId: number;
  eventName: string;
  value: number;
  unit: string;
  resultDate?: string;
  notes?: string;
}

export interface ResultUpdate {
  eventName: string;
  value: number;
  unit: string;
  resultDate?: string;
  notes?: string;
}
