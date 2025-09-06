"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimitConfig = exports.createRateLimitConfig = void 0;
const createRateLimitConfig = (configService) => ({
    throttlers: [
        {
            name: 'short',
            ttl: 60000,
            limit: 100,
        },
        {
            name: 'medium',
            ttl: 300000,
            limit: 300,
        },
        {
            name: 'long',
            ttl: 900000,
            limit: 500,
        },
    ],
});
exports.createRateLimitConfig = createRateLimitConfig;
exports.rateLimitConfig = {
    windowMs: 15 * 60 * 1000,
    max: 100,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    keyGenerator: (req) => `${req.ip}:${req.user?.id || 'anonymous'}`,
};
//# sourceMappingURL=rate-limit.config.js.map