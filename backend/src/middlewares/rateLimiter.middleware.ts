import rateLimit from 'express-rate-limit'
import { RedisStore } from 'rate-limit-redis'
import { redisClient } from '../lib/redis'

const isDev = process.env.NODE_ENV !== "production"

// general api rate limiter 
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 1000 : 100,
    message: "Too many requests, please try again later",
    store: new RedisStore({
        sendCommand: (...args: string[]) => redisClient.sendCommand(args)
    })
})

// login/register rate limiter
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 100 : 10,
    message: "Too many login attempts, please try again later",
    store: new RedisStore({
        sendCommand: (...args: string[]) => redisClient.sendCommand(args)
    })
})