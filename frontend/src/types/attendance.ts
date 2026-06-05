export type AttendanceStatus = 'present' | 'absent' | 'excused';

export interface AttendanceRecord {
  id: number;
  athleteId: number;
  sessionId: number;
  status: AttendanceStatus;
  notes?: string;
  athleteName: string;
  sessionDate: string;
}

export interface AttendanceCreate {
  athleteId: number;
  sessionId: number;
  status?: AttendanceStatus;
  notes?: string;
}

export interface AttendanceUpdate {
  status: AttendanceStatus;
  notes?: string;
}
