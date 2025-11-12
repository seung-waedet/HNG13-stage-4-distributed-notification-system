import { Cache } from 'cache-manager';
export declare class RedisCacheService {
    private cacheManager;
    constructor(cacheManager: Cache);
    set(key: string, value: any, ttl?: number): Promise<void>;
    get<T>(key: string): Promise<T | undefined>;
    del(key: string): Promise<void>;
    setNotificationStatus(notificationId: string, status: string): Promise<void>;
    getNotificationStatus(notificationId: string): Promise<string | undefined>;
    cacheUserPreferences(userId: string, preferences: any, ttl?: number): Promise<void>;
}
