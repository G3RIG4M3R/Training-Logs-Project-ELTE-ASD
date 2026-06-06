import { get, post, put, del } from './client';
import type { Result, ResultCreate, ResultUpdate } from '../types/result';

export const getSessionResults = (sessionId: number): Promise<Result[]> =>
  get<Result[]>(`/sessions/${sessionId}/results`);

export const getAthleteResults = (athleteId: number): Promise<Result[]> =>
  get<Result[]>(`/athletes/${athleteId}/results`);

export const createResult = (data: ResultCreate): Promise<Result> =>
  post<Result>('/results', data);

export const updateResult = (id: number, data: ResultUpdate): Promise<Result> =>
  put<Result>(`/results/${id}`, data);

export const deleteResult = (id: number): Promise<void> =>
  del(`/results/${id}`);
