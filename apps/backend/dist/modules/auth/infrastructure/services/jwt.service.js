"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../../../prisma/prisma.service");
let JwtService = class JwtService {
    constructor(nestJwtService, configService, prismaService) {
        this.nestJwtService = nestJwtService;
        this.configService = configService;
        this.prismaService = prismaService;
    }
    async generateTokens(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            clientId: user.clientId,
            permissions: user.permissions || [],
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 15 * 60,
            jti: `${user.id}-${Date.now()}`,
        };
        const refreshPayload = {
            sub: user.id,
            tokenFamily: `${user.id}-${Date.now()}`,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
        };
        const accessToken = this.nestJwtService.sign(payload);
        const refreshSecret = this.configService.get('JWT_REFRESH_SECRET');
        if (!refreshSecret) {
            throw new Error('JWT_REFRESH_SECRET not configured');
        }
        const refreshToken = this.nestJwtService.sign(refreshPayload, {
            secret: refreshSecret,
            expiresIn: '7d',
        });
        return { accessToken, refreshToken };
    }
    async validateToken(token) {
        try {
            return this.nestJwtService.verify(token);
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
    async refreshTokens(refreshToken) {
        try {
            const refreshSecret = this.configService.get('JWT_REFRESH_SECRET');
            if (!refreshSecret) {
                throw new Error('JWT_REFRESH_SECRET not configured');
            }
            const payload = this.nestJwtService.verify(refreshToken, {
                secret: refreshSecret,
            });
            const user = await this.prismaService.user.findUnique({
                where: { id: payload.sub },
                include: {
                    client: true,
                    roles: {
                        include: {
                            permissions: true,
                        },
                    },
                },
            });
            if (!user) {
                throw new common_1.UnauthorizedException('User not found');
            }
            const userTokenData = {
                id: user.id,
                email: user.email,
                role: user.role,
                clientId: user.clientId,
                permissions: user.roles.flatMap((role) => role.permissions.map((p) => p.name)),
            };
            return this.generateTokens(userTokenData);
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
};
exports.JwtService = JwtService;
exports.JwtService = JwtService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        prisma_service_1.PrismaService])
], JwtService);
//# sourceMappingURL=jwt.service.js.map