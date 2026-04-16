import Redis from 'ioredis';

// Check if we are in a Node.js environment before accessing global
const globalForRedis: any = globalThis;

// Instantiate a new client, or use the existing one if it's already attached to the global object
export const redis =
  globalForRedis.redis ||
  new Redis(process.env.REDIS_URL || 'redis://localhost:6379'); // Replace with your connection string

// In development, attach the client to the global object so it survives hot-reloads
if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}