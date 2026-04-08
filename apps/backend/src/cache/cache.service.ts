import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly namespace = 'forum';
  private readonly trackedKeys = new Set<string>();

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  private getKey(key: string): string {
    return `${this.namespace}:${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.cacheManager.get<T>(this.getKey(key));
      if (value) {
        this.logger.debug(`Cache hit: ${key}`);
      } else {
        this.logger.debug(`Cache miss: ${key}`);
      }
      return value || null;
    } catch (error) {
      this.logger.error(`Error getting cache key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const namespacedKey = this.getKey(key);
      await this.cacheManager.set(namespacedKey, value, ttl);
      this.trackedKeys.add(namespacedKey);
      this.logger.debug(`Cache set: ${key} (TTL: ${ttl || 'default'})`);
    } catch (error) {
      this.logger.error(`Error setting cache key ${key}:`, error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      const namespacedKey = this.getKey(key);
      await this.cacheManager.del(namespacedKey);
      this.trackedKeys.delete(namespacedKey);
      this.logger.debug(`Cache deleted: ${key}`);
    } catch (error) {
      this.logger.error(`Error deleting cache key ${key}:`, error);
    }
  }

  async getOrSet<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fn();
    await this.set(key, value, ttl);
    return value;
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const prefix = this.getKey(pattern.replace(/\*$/, ''));
      const keysToDelete = Array.from(this.trackedKeys).filter((key) => key.startsWith(prefix));

      await Promise.all(keysToDelete.map((key) => this.cacheManager.del(key)));
      keysToDelete.forEach((key) => this.trackedKeys.delete(key));

      this.logger.debug(`Invalidated ${keysToDelete.length} cache keys for pattern: ${pattern}`);
    } catch (error) {
      this.logger.error(`Error invalidating pattern ${pattern}:`, error);
    }
  }

  async invalidateThreads(): Promise<void> {
    await this.invalidatePattern('threads:');
  }

  async invalidatePosts(threadId?: number): Promise<void> {
    if (threadId) {
      await this.invalidatePattern(`posts:${threadId}:`);
    } else {
      await this.invalidatePattern('posts:');
    }
  }
}
