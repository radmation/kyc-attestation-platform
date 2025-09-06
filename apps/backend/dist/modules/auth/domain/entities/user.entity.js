"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const client_1 = require("@prisma/client");
class User {
    constructor(_id, _email, _password, _clientId, _firstName, _lastName, _role = client_1.UserRole.CLIENT_USER, _accountStatus = client_1.AccountStatus.PENDING, _isActive = true, _emailVerified = false, _emailVerificationToken, _emailVerificationExpires, _lastVerificationEmailSent, _verificationEmailCount = 0, _createdAt = new Date(), _updatedAt = new Date()) {
        this._id = _id;
        this._email = _email;
        this._password = _password;
        this._clientId = _clientId;
        this._firstName = _firstName;
        this._lastName = _lastName;
        this._role = _role;
        this._accountStatus = _accountStatus;
        this._isActive = _isActive;
        this._emailVerified = _emailVerified;
        this._emailVerificationToken = _emailVerificationToken;
        this._emailVerificationExpires = _emailVerificationExpires;
        this._lastVerificationEmailSent = _lastVerificationEmailSent;
        this._verificationEmailCount = _verificationEmailCount;
        this._createdAt = _createdAt;
        this._updatedAt = _updatedAt;
    }
    static create(props) {
        if (!props.email || !props.password || !props.clientId) {
            throw new Error('Email, password, and clientId are required');
        }
        if (!this.isValidEmail(props.email)) {
            throw new Error('Invalid email format');
        }
        if (props.password.length < 8) {
            throw new Error('Password must be at least 8 characters');
        }
        return new User(crypto.randomUUID(), props.email, props.password, props.clientId, props.firstName, props.lastName, client_1.UserRole.CLIENT_USER, client_1.AccountStatus.PENDING, true, false, undefined, undefined, undefined, 0, new Date(), new Date());
    }
    static reconstruct(data) {
        return new User(data.id, data.email, data.password, data.clientId, data.firstName, data.lastName, data.role, data.accountStatus, data.isActive, data.emailVerified, data.emailVerificationToken, data.emailVerificationExpires, data.lastVerificationEmailSent, data.verificationEmailCount, data.createdAt, data.updatedAt);
    }
    verifyEmail() {
        if (this._emailVerified) {
            throw new Error('Email already verified');
        }
        this._emailVerified = true;
        this._accountStatus = client_1.AccountStatus.ACTIVE;
        this._updatedAt = new Date();
    }
    setVerificationToken(token, expiresInHours = 24) {
        this._emailVerificationToken = token;
        this._emailVerificationExpires = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
        this._updatedAt = new Date();
    }
    clearVerificationToken() {
        this._emailVerificationToken = undefined;
        this._emailVerificationExpires = undefined;
        this._updatedAt = new Date();
    }
    incrementVerificationEmailCount() {
        this._verificationEmailCount += 1;
        this._lastVerificationEmailSent = new Date();
        this._updatedAt = new Date();
    }
    updatePassword(newPassword) {
        if (newPassword.length < 8) {
            throw new Error('Password must be at least 8 characters');
        }
        this._password = newPassword;
        this._updatedAt = new Date();
    }
    suspend() {
        this._isActive = false;
        this._accountStatus = client_1.AccountStatus.SUSPENDED;
        this._updatedAt = new Date();
    }
    activate() {
        this._isActive = true;
        this._accountStatus = client_1.AccountStatus.ACTIVE;
        this._updatedAt = new Date();
    }
    get id() {
        return this._id;
    }
    get email() {
        return this._email;
    }
    get password() {
        return this._password;
    }
    get firstName() {
        return this._firstName;
    }
    get lastName() {
        return this._lastName;
    }
    get role() {
        return this._role;
    }
    get accountStatus() {
        return this._accountStatus;
    }
    get isActive() {
        return this._isActive;
    }
    get clientId() {
        return this._clientId;
    }
    get emailVerified() {
        return this._emailVerified;
    }
    get emailVerificationToken() {
        return this._emailVerificationToken;
    }
    get emailVerificationExpires() {
        return this._emailVerificationExpires;
    }
    get lastVerificationEmailSent() {
        return this._lastVerificationEmailSent;
    }
    get verificationEmailCount() {
        return this._verificationEmailCount;
    }
    get createdAt() {
        return this._createdAt;
    }
    get updatedAt() {
        return this._updatedAt;
    }
    static isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
}
exports.User = User;
//# sourceMappingURL=user.entity.js.map