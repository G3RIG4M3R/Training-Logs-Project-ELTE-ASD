import { get, post } from './client';
import type { Result, ResultCreate } from '../types/result';

export const getSessionResults = (sessionId: number): Promise<Result[]> =>
  get<Result[]>(`/sessions/${sessionId}/results`);

export const getAthleteResults = (athleteId: number): Promise<Result[]> =>
  get<Result[]>(`/athletes/${athleteId}/results`);

export const createResult = (data: ResultCreate): Promise<Result> =>
  post<Result>('/results', data);
