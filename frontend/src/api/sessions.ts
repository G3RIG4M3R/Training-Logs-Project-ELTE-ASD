import { get, post, put, del } from './client';
import type { TrainingSession, TrainingSessionCreate } from '../types/session';

export const listSessions = (): Promise<TrainingSession[]> =>
  get<TrainingSession[]>('/sessions');

export const createSession = (data: TrainingSessionCreate): Promise<TrainingSession> =>
  post<TrainingSession>('/sessions', data);

export const updateSession = (id: number, data: TrainingSessionCreate): Promise<TrainingSession> =>
  put<TrainingSession>(`/sessions/${id}`, data);

export const deleteSession = (id: number): Promise<void> =>
  del(`/sessions/${id}`);
