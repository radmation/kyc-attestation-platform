"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCorsConfig = void 0;
const createCorsConfig = (configService) => {
    const allowedOrigins = configService
        .get('ALLOWED_ORIGINS')
        ?.split(',') || ['http://localhost:4200'];
    return {
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            if (allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            }
            else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: [
            'Origin',
            'X-Requested-With',
            'Content-Type',
            'Accept',
            'Authorization',
            'API-Version',
            'X-API-Key',
        ],
        exposedHeaders: ['X-Total-Count', 'X-Request-ID'],
        credentials: true,
        maxAge: 86400,
    };
};
exports.createCorsConfig = createCorsConfig;
//# sourceMappingURL=cors.config.js.map