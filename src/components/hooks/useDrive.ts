import { useState, useCallback } from 'react';

export function useDrive() {
  const [folderId, setFolderId] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [status, setStatus] = useState<{ msg: string; kind: 'info' | 'err' | 'ok' } | null>(null);
  const [drag, setDrag] = useState(false);

  const refresh = useCallback(() => {
    setTick((t) => t + 1);
  }, []);

  const clearStatus = useCallback(() => {
    setStatus(null);
  }, []);

  return {
    folderId,
    setFolderId,
    tick,
    status,
    setStatus,
    drag,
    setDrag,
    refresh,
    clearStatus,
  };
}
