/**
 * useLocalCache - Hook for localStorage caching with TTL support
 * Provides get/set/remove operations with optional time-to-live expiration
 */

const PREFIX = 'sdc_cache_'

interface CacheEntry<T> {
  value: T
  expiry: number | null // null = no expiry
}

export function useLocalCache() {
  function get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(PREFIX + key)
      if (!raw) return null
      const entry: CacheEntry<T> = JSON.parse(raw)
      if (entry.expiry !== null && Date.now() > entry.expiry) {
        localStorage.removeItem(PREFIX + key)
        return null
      }
      return entry.value
    } catch {
      return null
    }
  }

  function set<T>(key: string, value: T, ttlSeconds?: number): void {
    try {
      const entry: CacheEntry<T> = {
        value,
        expiry: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
      }
      localStorage.setItem(PREFIX + key, JSON.stringify(entry))
    } catch {
      // localStorage might be full; silently fail
    }
  }

  function remove(key: string): void {
    localStorage.removeItem(PREFIX + key)
  }

  return { get, set, remove }
}
