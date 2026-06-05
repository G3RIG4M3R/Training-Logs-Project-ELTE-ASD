import { get, post, put, del } from './client';
import type { Athlete, AthleteProfile, ClothingSize, Sex } from '../types/athlete';

export interface AthletePayload {
  name: string;
  dateOfBirth: string;
  sex: Sex;
  height: number;
  weight: number;
  shirtSize: ClothingSize;
  shortSize: ClothingSize;
  shoeSize: number;
  notes?: string;
}

export const listAthletes = (): Promise<Athlete[]> =>
  get<Athlete[]>('/athletes');

export const getAthlete = (id: number): Promise<Athlete> =>
  get<Athlete>(`/athletes/${id}`);

export const createAthlete = (data: AthletePayload): Promise<Athlete> =>
  post<Athlete>('/athletes', data);

export const updateAthlete = (id: number, data: AthletePayload): Promise<Athlete> =>
  put<Athlete>(`/athletes/${id}`, data);

export const deleteAthlete = (id: number): Promise<void> =>
  del(`/athletes/${id}`);

export const getAthleteProfile = (id: number): Promise<AthleteProfile> =>
  get<AthleteProfile>(`/athletes/${id}/profile`);
