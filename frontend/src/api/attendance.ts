import { get, post, put, del } from './client';
import type { AttendanceRecord, AttendanceCreate, AttendanceUpdate } from '../types/attendance';

export const getSessionAttendance = (sessionId: number): Promise<AttendanceRecord[]> =>
  get<AttendanceRecord[]>(`/sessions/${sessionId}/attendance`);

export const createAttendance = (data: AttendanceCreate): Promise<AttendanceRecord> =>
  post<AttendanceRecord>('/attendance', data);

export const updateAttendance = (id: number, data: AttendanceUpdate): Promise<AttendanceRecord> =>
  put<AttendanceRecord>(`/attendance/${id}`, data);

export const deleteAttendance = (id: number): Promise<void> =>
  del(`/attendance/${id}`);
