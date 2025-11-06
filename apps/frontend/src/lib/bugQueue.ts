import type { BugReportPayload, BugReportQueueItem } from '@/types/bug';

const DB_NAME = 'aiquaa_bug_reports';
const DB_VERSION = 1;
const STORE_NAME = 'bug_queue';
const MAX_RETRY_COUNT = 3;

/**
 * IndexedDB manager for offline bug report queue
 */
export class BugReportQueue {
  private db: IDBDatabase | null = null;

  /**
   * Initialize the IndexedDB database
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB is not supported'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
          objectStore.createIndex('retryCount', 'retryCount', { unique: false });
        }
      };
    });
  }

  /**
   * Add a bug report to the queue
   */
  async enqueue(payload: BugReportPayload): Promise<string> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const item: BugReportQueueItem = {
        id: this.generateId(),
        payload,
        timestamp: Date.now(),
        retryCount: 0,
      };

      const request = store.add(item);

      request.onsuccess = () => {
        resolve(item.id);
      };

      request.onerror = () => {
        reject(new Error('Failed to enqueue bug report'));
      };
    });
  }

  /**
   * Get all queued bug reports
   */
  async getAll(): Promise<BugReportQueueItem[]> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error('Failed to retrieve bug reports'));
      };
    });
  }

  /**
   * Remove a bug report from the queue
   */
  async dequeue(id: string): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to remove bug report'));
      };
    });
  }

  /**
   * Increment retry count for a bug report
   */
  async incrementRetry(id: string): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const item = getRequest.result as BugReportQueueItem;
        if (!item) {
          reject(new Error('Bug report not found'));
          return;
        }

        item.retryCount += 1;
        const putRequest = store.put(item);

        putRequest.onsuccess = () => {
          resolve();
        };

        putRequest.onerror = () => {
          reject(new Error('Failed to update retry count'));
        };
      };

      getRequest.onerror = () => {
        reject(new Error('Failed to retrieve bug report'));
      };
    });
  }

  /**
   * Check if a bug report has exceeded max retries
   */
  async shouldRemove(id: string): Promise<boolean> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        const item = request.result as BugReportQueueItem;
        resolve(item ? item.retryCount >= MAX_RETRY_COUNT : false);
      };

      request.onerror = () => {
        reject(new Error('Failed to check retry count'));
      };
    });
  }

  /**
   * Get count of queued items
   */
  async count(): Promise<number> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.count();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error('Failed to count bug reports'));
      };
    });
  }

  /**
   * Clear all queued items
   */
  async clear(): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to clear bug reports'));
      };
    });
  }

  /**
   * Generate a unique ID for queue items
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Close the database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Singleton instance
let queueInstance: BugReportQueue | null = null;

/**
 * Get the singleton queue instance
 */
export function getBugReportQueue(): BugReportQueue {
  if (!queueInstance) {
    queueInstance = new BugReportQueue();
  }
  return queueInstance;
}

/**
 * Process queued bug reports
 */
export async function processQueue(
  submitFn: (payload: BugReportPayload) => Promise<void>
): Promise<{ processed: number; failed: number }> {
  const queue = getBugReportQueue();
  await queue.init();

  const items = await queue.getAll();
  let processed = 0;
  let failed = 0;

  for (const item of items) {
    try {
      await submitFn(item.payload);
      await queue.dequeue(item.id);
      processed++;
    } catch (error) {
      console.error('Failed to process queued bug report:', error);

      const shouldRemove = await queue.shouldRemove(item.id);
      if (shouldRemove) {
        await queue.dequeue(item.id);
        failed++;
      } else {
        await queue.incrementRetry(item.id);
      }
    }
  }

  return { processed, failed };
}
