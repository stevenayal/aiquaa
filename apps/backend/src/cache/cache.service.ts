import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly namespace = 'forum';

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
      await this.cacheManager.set(this.getKey(key), value, ttl);
      this.logger.debug(`Cache set: ${key} (TTL: ${ttl || 'default'})`);
    } catch (error) {
      this.logger.error(`Error setting cache key ${key}:`, error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(this.getKey(key));
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
      // This is a simplified implementation
      // In a real scenario, you might want to use Redis SCAN command
      this.logger.debug(`Invalidating pattern: ${pattern}`);
      // For now, we'll just log the pattern - you can implement actual pattern invalidation
      // based on your specific needs
    } catch (error) {
      this.logger.error(`Error invalidating pattern ${pattern}:`, error);
    }
  }

  async invalidateThreads(): Promise<void> {
    await this.invalidatePattern('forum:threads:*');
  }

  async invalidatePosts(threadId?: number): Promise<void> {
    if (threadId) {
      await this.invalidatePattern(`forum:posts:${threadId}:*`);
    } else {
      await this.invalidatePattern('forum:posts:*');
    }
  }
}
