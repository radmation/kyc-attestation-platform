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
var MemoryCacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryCacheService = void 0;
const common_1 = require("@nestjs/common");
let MemoryCacheService = MemoryCacheService_1 = class MemoryCacheService {
    constructor() {
        this.logger = new common_1.Logger(MemoryCacheService_1.name);
        this.cache = new Map();
        this.DEFAULT_TTL = 300;
        setInterval(() => this.cleanup(), 60000);
    }
    async get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return null;
        }
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }
        return entry.value;
    }
    async set(key, value, ttlSeconds) {
        const ttl = ttlSeconds || this.DEFAULT_TTL;
        const expiresAt = Date.now() + (ttl * 1000);
        this.cache.set(key, {
            value,
            expiresAt,
        });
    }
    async del(key) {
        this.cache.delete(key);
    }
    async delPattern(pattern) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.cache.delete(key);
            }
        }
    }
    async exists(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return false;
        }
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return false;
        }
        return true;
    }
    async ttl(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return -2;
        }
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return -2;
        }
        return Math.floor((entry.expiresAt - Date.now()) / 1000);
    }
    cleanup() {
        const now = Date.now();
        let deletedCount = 0;
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiresAt) {
                this.cache.delete(key);
                deletedCount++;
            }
        }
        if (deletedCount > 0) {
            this.logger.debug(`Cleaned up ${deletedCount} expired cache entries`);
        }
    }
    getCacheSize() {
        return this.cache.size;
    }
    clearAll() {
        this.cache.clear();
    }
};
exports.MemoryCacheService = MemoryCacheService;
exports.MemoryCacheService = MemoryCacheService = MemoryCacheService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MemoryCacheService);
//# sourceMappingURL=memory-cache.service.js.map