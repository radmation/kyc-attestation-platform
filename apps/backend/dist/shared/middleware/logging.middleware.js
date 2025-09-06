"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var LoggingMiddleware_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingMiddleware = void 0;
const common_1 = require("@nestjs/common");
const morgan_1 = require("morgan");
let LoggingMiddleware = LoggingMiddleware_1 = class LoggingMiddleware {
    constructor() {
        this.logger = new common_1.Logger(LoggingMiddleware_1.name);
    }
    use(req, res, next) {
        const morganMiddleware = (0, morgan_1.default)(':remote-addr :method :url :status :res[content-length] - :response-time ms', {
            stream: {
                write: (message) => {
                    this.logger.log(message.trim());
                },
            },
            skip: (req, res) => {
                return req.url === '/health' || req.url === '/metrics';
            },
        });
        morganMiddleware(req, res, next);
    }
};
exports.LoggingMiddleware = LoggingMiddleware;
exports.LoggingMiddleware = LoggingMiddleware = LoggingMiddleware_1 = __decorate([
    (0, common_1.Injectable)()
], LoggingMiddleware);
//# sourceMappingURL=logging.middleware.js.map