import Redis from 'ioredis';
import { REDIS_CONFIG } from './config';

// Check if we're on the server side
const isServer = typeof window === 'undefined';

class RedisClient {
  private static instance: RedisClient;
  private client: Redis | null = null;
  private subscriber: Redis | null = null;
  private isConnected: boolean = false;

  private constructor() {
    if (isServer) {
      this.client = new Redis(REDIS_CONFIG);
      this.subscriber = new Redis(REDIS_CONFIG);
      this.setupEventListeners();
    }
  }

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  private setupEventListeners(): void {
    if (!this.client || !this.subscriber) return;

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

  public getClient(): Redis | null {
    return this.client;
  }

  public getSubscriber(): Redis | null {
    return this.subscriber;
  }

  public async connect(): Promise<void> {
    if (!isServer || !this.client || this.isConnected) return;
    await this.client.connect();
  }

  public async disconnect(): Promise<void> {
    if (!isServer || !this.client || !this.subscriber || !this.isConnected) return;
    await this.client.quit();
    await this.subscriber.quit();
    this.isConnected = false;
  }

  public isReady(): boolean {
    return this.isConnected;
  }
}

export const redisClient = RedisClient.getInstance(); 