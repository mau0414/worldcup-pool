// lib/config.ts

export const POOL_LIMITS = {
    free: {
        maxPools: 10,
        maxParticipantsPerPool: 10,
    },
    premium: {
        maxPools: Infinity,
        maxParticipantsPerPool: 100,
    },
} as const