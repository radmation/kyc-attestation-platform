"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitAction = exports.RateLimitAttempt = void 0;
class RateLimitAttempt {
    constructor(_id, _action, _userId, _ipAddress, _userAgent, _wasBlocked = false, _reason, _createdAt = new Date()) {
        this._id = _id;
        this._action = _action;
        this._userId = _userId;
        this._ipAddress = _ipAddress;
        this._userAgent = _userAgent;
        this._wasBlocked = _wasBlocked;
        this._reason = _reason;
        this._createdAt = _createdAt;
    }
    static create(props) {
        if (!props.action) {
            throw new Error('Action is required');
        }
        return new RateLimitAttempt(crypto.randomUUID(), props.action, props.userId, props.ipAddress, props.userAgent, props.wasBlocked || false, props.reason, new Date());
    }
    static reconstruct(data) {
        return new RateLimitAttempt(data.id, data.action, data.userId, data.ipAddress, data.userAgent, data.wasBlocked, data.reason, data.createdAt);
    }
    markAsBlocked(reason) {
        this._wasBlocked = true;
        this._reason = reason;
    }
    get id() {
        return this._id;
    }
    get userId() {
        return this._userId;
    }
    get action() {
        return this._action;
    }
    get ipAddress() {
        return this._ipAddress;
    }
    get userAgent() {
        return this._userAgent;
    }
    get wasBlocked() {
        return this._wasBlocked;
    }
    get reason() {
        return this._reason;
    }
    get createdAt() {
        return this._createdAt;
    }
}
exports.RateLimitAttempt = RateLimitAttempt;
var RateLimitAction;
(function (RateLimitAction) {
    RateLimitAction["EMAIL_VERIFICATION_RESEND"] = "email_verification_resend";
    RateLimitAction["LOGIN_ATTEMPT"] = "login_attempt";
    RateLimitAction["PASSWORD_RESET"] = "password_reset";
    RateLimitAction["API_CALL"] = "api_call";
})(RateLimitAction || (exports.RateLimitAction = RateLimitAction = {}));
//# sourceMappingURL=rate-limit-attempt.entity.js.map