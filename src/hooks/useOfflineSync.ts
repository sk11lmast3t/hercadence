import { useState, useCallback, useRef, useEffect } from 'react';
import { useSupabase } from './useSupabase';

const DB_NAME = 'hercadence_offline';
const STORE_NAME = 'sync_queue';

interface QueuedOperation {
  id: string;
  table: string;
  method: 'upsert' | 'delete';
  payload: Record<string, unknown>;
  timestamp: number;
}

/**
 * Offline sync queue using IndexedDB.
 * Enqueues operations when offline, replays them on reconnect.
 */
export function useOfflineSync() {
  const supabase = useSupabase();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const dbRef = useRef<IDBDatabase | null>(null);

  const openDb = useCallback((): Promise<IDBDatabase> => {
    if (dbRef.current) return Promise.resolve(dbRef.current);
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        req.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
      };
      req.onsuccess = () => {
        dbRef.current = req.result;
        resolve(req.result);
      };
      req.onerror = () => reject(req.error);
    });
  }, []);

  const enqueue = useCallback(
    async (op: Omit<QueuedOperation, 'id' | 'timestamp'>) => {
      const db = await openDb();
      const entry: QueuedOperation = {
        ...op,
        id: `${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
      };
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).add(entry);
      setPendingCount(c => c + 1);
    },
    [openDb]
  );

  const flush = useCallback(async () => {
    if (!navigator.onLine) return;
    const db = await openDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const all: QueuedOperation[] = await new Promise((res, rej) => {
      const req = store.getAll();
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error);
    });

    for (const op of all) {
      try {
        if (op.method === 'upsert') {
          await supabase.from(op.table).upsert(op.payload);
        } else {
          await supabase.from(op.table).delete().eq('id', op.payload.id as string);
        }
        store.delete(op.id);
        setPendingCount(c => Math.max(0, c - 1));
      } catch {
        // leave in queue for next flush
      }
    }
  }, [openDb, supabase]);

  useEffect(() => {
    const onOnline = () => {
      setIsOnline(true);
      flush();
    };
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [flush]);

  return { isOnline, pendingCount, enqueue, flush };
}
