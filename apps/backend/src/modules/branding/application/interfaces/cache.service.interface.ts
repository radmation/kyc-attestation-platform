export interface CacheService {
  /**
   * Get value from cache
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Set value in cache with optional TTL
   */
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;

  /**
   * Delete value from cache
   */
  del(key: string): Promise<void>;

  /**
   * Delete multiple keys from cache
   */
  delPattern(pattern: string): Promise<void>;

  /**
   * Check if key exists in cache
   */
  exists(key: string): Promise<boolean>;

  /**
   * Get cache TTL for key
   */
  ttl(key: string): Promise<number>;
} 