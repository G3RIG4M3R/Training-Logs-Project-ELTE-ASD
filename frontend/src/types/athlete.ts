export type ClothingSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
export type Sex = 'male' | 'female' | 'other';

export interface Athlete {
  id: number;
  name: string;
  dateOfBirth: string; // 'YYYY-MM-DD'
  sex: Sex;
  height: number; // cm
  weight: number; // kg
  shirtSize: ClothingSize;
  shortSize: ClothingSize;
  shoeSize: number; // EU
  notes?: string;
  isActive?: boolean;
}

export interface AttendanceSummary {
  totalSessions: number;
  present: number;
  absent: number;
  excused: number;
}

export interface AthleteResultSummary {
  id: number;
  sessionId: number;
  sessionDate: string | null;
  eventName: string;
  value: number;
  unit: string;
  resultDate: string;
  notes?: string;
}

export interface AthleteProfile extends Athlete {
  attendanceSummary: AttendanceSummary;
  recentResults: AthleteResultSummary[];
}