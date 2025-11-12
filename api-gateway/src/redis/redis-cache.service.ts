import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { NotificationMessage } from '../../../shared-contracts/types/notification.types';

@Injectable()
export class RedisCacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async get<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get<T>(key);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async setNotificationStatus(notificationId: string, status: string): Promise<void> {
    await this.set(`notification:${notificationId}`, status, 3600); // 1 hour TTL
  }

  async getNotificationStatus(notificationId: string): Promise<string | undefined> {
    return await this.get<string>(`notification:${notificationId}`);
  }

  async cacheUserPreferences(userId: string, preferences: any, ttl: number = 300): Promise<void> {
    await this.set(`user:${userId}:preferences`, preferences, ttl);
  }
}
