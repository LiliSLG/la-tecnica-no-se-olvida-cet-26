import { redisClient } from './client';
import Redis from 'ioredis';

export interface RedisHealthStatus {
  isConnected: boolean;
  pingLatency: number;
  memoryUsage: {
    used: number;
    peak: number;
  };
  lastError?: string;
}

export class RedisHealthCheck {
  private static instance: RedisHealthCheck;
  private lastError?: string;
  private lastCheck: number = 0;
  private checkInterval: number = 30000; // 30 seconds

  private constructor() {}

  public static getInstance(): RedisHealthCheck {
    if (!RedisHealthCheck.instance) {
      RedisHealthCheck.instance = new RedisHealthCheck();
    }
    return RedisHealthCheck.instance;
  }

  public async checkHealth(): Promise<RedisHealthStatus> {
    const now = Date.now();
    if (now - this.lastCheck < this.checkInterval) {
      return this.getLastStatus();
    }

    this.lastCheck = now;
    const client = redisClient.getClient();

    if (!client) {
      this.lastError = 'Redis client not initialized';
      return {
        isConnected: false,
        pingLatency: -1,
        memoryUsage: { used: 0, peak: 0 },
        lastError: this.lastError,
      };
    }

    try {
      const startTime = Date.now();
      await client.ping();
      const pingLatency = Date.now() - startTime;

      const memoryInfo = await client.info('memory');
      const memoryUsage = this.parseMemoryInfo(memoryInfo);

      this.lastError = undefined;
      return {
        isConnected: true,
        pingLatency,
        memoryUsage,
      };
    } catch (error) {
      this.lastError = error instanceof Error ? error.message : 'Unknown error';
      return {
        isConnected: false,
        pingLatency: -1,
        memoryUsage: { used: 0, peak: 0 },
        lastError: this.lastError,
      };
    }
  }

  private parseMemoryInfo(memoryInfo: string): { used: number; peak: number } {
    const lines = memoryInfo.split('\n');
    let used = 0;
    let peak = 0;

    for (const line of lines) {
      if (line.startsWith('used_memory:')) {
        used = parseInt(line.split(':')[1], 10);
      } else if (line.startsWith('used_memory_peak:')) {
        peak = parseInt(line.split(':')[1], 10);
      }
    }

    return { used, peak };
  }

  private getLastStatus(): RedisHealthStatus {
    return {
      isConnected: redisClient.isReady(),
      pingLatency: -1,
      memoryUsage: { used: 0, peak: 0 },
      lastError: this.lastError,
    };
  }
}

export const redisHealth = RedisHealthCheck.getInstance(); 