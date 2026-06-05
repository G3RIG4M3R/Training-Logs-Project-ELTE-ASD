import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { TrainingSession } from '../types/session';

function parseSessionId(param: string | null): number | null {
  if (!param) return null;
  const id = Number(param);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function resolveSessionId(
  sessions: TrainingSession[],
  sessionParam: string | null,
): number | null {
  if (sessions.length === 0) return null;
  const parsed = parseSessionId(sessionParam);
  if (parsed !== null && sessions.some(s => s.id === parsed)) {
    return parsed;
  }
  return sessions[0].id;
}

/** Keeps selected session in sync with the ?session= query param. */
export function useSessionSelection(sessions: TrainingSession[]) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    if (sessions.length === 0) {
      setSelectedId(null);
      if (searchParams.has('session')) {
        setSearchParams({}, { replace: true });
      }
      return;
    }

    const resolved = resolveSessionId(sessions, searchParams.get('session'));
    setSelectedId(resolved);

    if (resolved !== null && searchParams.get('session') !== String(resolved)) {
      setSearchParams({ session: String(resolved) }, { replace: true });
    }
  }, [sessions, searchParams, setSearchParams]);

  const selectSession = useCallback((id: number) => {
    setSearchParams({ session: String(id) });
  }, [setSearchParams]);

  return { selectedId, selectSession };
}
