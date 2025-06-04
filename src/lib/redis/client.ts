import Redis from 'ioredis';
import { REDIS_CONFIG } from './config';

class RedisClient {
  private static instance: RedisClient;
  private client: Redis;
  private subscriber: Redis;
  private isConnected: boolean = false;

  private constructor() {
    this.client = new Redis(REDIS_CONFIG);
    this.subscriber = new Redis(REDIS_CONFIG);
    this.setupEventListeners();
  }

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  private setupEventListeners(): void {
    this.client.on('connect', () => {
      console.log('Redis client connected');
      this.isConnected = true;
    });

    this.client.on('error', (error) => {
      console.error('Redis client error:', error);
      this.isConnected = false;
    });

    this.client.on('close', () => {
      console.log('Redis client connection closed');
      this.isConnected = false;
    });

    this.subscriber.on('connect', () => {
      console.log('Redis subscriber connected');
    });

    this.subscriber.on('error', (error) => {
      console.error('Redis subscriber error:', error);
    });
  }

  public getClient(): Redis {
    return this.client;
  }

  public getSubscriber(): Redis {
    return this.subscriber;
  }

  public async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect();
    }
  }

  public async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.quit();
      await this.subscriber.quit();
      this.isConnected = false;
    }
  }

  public isReady(): boolean {
    return this.isConnected;
  }
}

export const redisClient = RedisClient.getInstance(); 