import { get, post } from './client';
import type { TrainingSession, TrainingSessionCreate } from '../types/session';

export const listSessions = (): Promise<TrainingSession[]> =>
  get<TrainingSession[]>('/sessions');

export const createSession = (data: TrainingSessionCreate): Promise<TrainingSession> =>
  post<TrainingSession>('/sessions', data);
