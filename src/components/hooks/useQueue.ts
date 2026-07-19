import { useState, useRef, useCallback } from 'react';
import type { QueueJob } from '../feature/upload/UploadQueuePanel';

interface UseQueueReturn {
  queue: QueueJob[];
  enqueueFiles: (list: FileList | File[]) => void;
  cancelQueueItem: (id: string) => void;
  retryQueueItem: (id: string) => void;
  dismissQueueItem: (id: string) => void;
  clearDoneQueue: () => void;
  setQueue: React.Dispatch<React.SetStateAction<QueueJob[]>>;
  queueBusy: React.MutableRefObject<boolean>;
  pumpQueueRef: React.MutableRefObject<(() => Promise<void>) | null>;
}

export function useQueue(): UseQueueReturn {
  const [queue, setQueue] = useState<QueueJob[]>([]);
  const queueBusy = useRef(false);
  const pumpQueueRef = useRef<(() => Promise<void>) | null>(null);

  const enqueueFiles = useCallback((list: FileList | File[]) => {
    const files = Array.from(list);
    const jobs: QueueJob[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      size: file.size,
      status: 'queued',
      progress: 0,
    }));
    setQueue((prev) => [...prev, ...jobs]);
  }, []);

  const cancelQueueItem = useCallback((id: string) => {
    setQueue((prev) =>
      prev.map((job) => {
        if (job.id !== id) return job;
        try {
          job.controller?.abort();
        } catch {}
        return {
          ...job,
          status: job.status === 'running' ? 'cancelled' : 'cancelled',
        };
      })
    );
  }, []);

  const retryQueueItem = useCallback((id: string) => {
    setQueue((prev) =>
      prev.map((job) =>
        job.id === id
          ? { ...job, status: 'queued', error: undefined, phase: undefined, ratio: 0 }
          : job
      )
    );
  }, []);

  const dismissQueueItem = useCallback((id: string) => {
    setQueue((prev) => prev.filter((job) => job.id !== id));
  }, []);

  const clearDoneQueue = useCallback(() => {
    setQueue((prev) =>
      prev.filter((job) => job.status === 'queued' || job.status === 'running')
    );
  }, []);

  return {
    queue,
    setQueue,
    enqueueFiles,
    cancelQueueItem,
    retryQueueItem,
    dismissQueueItem,
    clearDoneQueue,
    queueBusy,
    pumpQueueRef,
  };
}
