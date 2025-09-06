"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserInvitation = void 0;
const client_1 = require("@prisma/client");
const client_2 = require("@prisma/client");
const crypto = require("crypto");
class UserInvitation {
    constructor(_id, _email, _role, _clientId, _invitedBy, _token, _expiresAt, _status = client_2.InvitationStatus.PENDING, _firstName, _lastName, _message, _permissions = [], _acceptedAt, _revokedAt, _emailSentAt, _emailSentCount = 0, _lastEmailSentAt, _createdAt = new Date(), _updatedAt = new Date()) {
        this._id = _id;
        this._email = _email;
        this._role = _role;
        this._clientId = _clientId;
        this._invitedBy = _invitedBy;
        this._token = _token;
        this._expiresAt = _expiresAt;
        this._status = _status;
        this._firstName = _firstName;
        this._lastName = _lastName;
        this._message = _message;
        this._permissions = _permissions;
        this._acceptedAt = _acceptedAt;
        this._revokedAt = _revokedAt;
        this._emailSentAt = _emailSentAt;
        this._emailSentCount = _emailSentCount;
        this._lastEmailSentAt = _lastEmailSentAt;
        this._createdAt = _createdAt;
        this._updatedAt = _updatedAt;
    }
    static create(props) {
        if (!props.email || !props.clientId || !props.invitedBy) {
            throw new Error('Email, clientId, and invitedBy are required');
        }
        if (!this.isValidEmail(props.email)) {
            throw new Error('Invalid email format');
        }
        if (!Object.values(client_1.UserRole).includes(props.role)) {
            throw new Error('Invalid user role');
        }
        const token = this.generateSecureToken();
        const expirationDays = props.expirationDays || 7;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expirationDays);
        return new UserInvitation(crypto.randomUUID(), props.email.toLowerCase().trim(), props.role, props.clientId, props.invitedBy, token, expiresAt, client_2.InvitationStatus.PENDING, props.firstName?.trim(), props.lastName?.trim(), props.message?.trim(), props.permissions || []);
    }
    static fromPersistence(props) {
        return new UserInvitation(props.id, props.email, props.role, props.clientId, props.invitedBy, props.token, props.expiresAt, props.status, props.firstName, props.lastName, props.message, props.permissions, props.acceptedAt, props.revokedAt, props.emailSentAt, props.emailSentCount, props.lastEmailSentAt, props.createdAt, props.updatedAt);
    }
    get id() { return this._id; }
    get email() { return this._email; }
    get role() { return this._role; }
    get clientId() { return this._clientId; }
    get invitedBy() { return this._invitedBy; }
    get token() { return this._token; }
    get expiresAt() { return this._expiresAt; }
    get status() { return this._status; }
    get firstName() { return this._firstName; }
    get lastName() { return this._lastName; }
    get message() { return this._message; }
    get permissions() { return [...this._permissions]; }
    get acceptedAt() { return this._acceptedAt; }
    get revokedAt() { return this._revokedAt; }
    get emailSentAt() { return this._emailSentAt; }
    get emailSentCount() { return this._emailSentCount; }
    get lastEmailSentAt() { return this._lastEmailSentAt; }
    get createdAt() { return this._createdAt; }
    get updatedAt() { return this._updatedAt; }
    accept() {
        if (this._status !== client_2.InvitationStatus.PENDING) {
            throw new Error('Can only accept pending invitations');
        }
        if (this.isExpired()) {
            throw new Error('Invitation has expired');
        }
        this._status = client_2.InvitationStatus.ACCEPTED;
        this._acceptedAt = new Date();
        this._updatedAt = new Date();
    }
    revoke() {
        if (this._status !== client_2.InvitationStatus.PENDING) {
            throw new Error('Can only revoke pending invitations');
        }
        this._status = client_2.InvitationStatus.REVOKED;
        this._revokedAt = new Date();
        this._updatedAt = new Date();
    }
    markEmailSent() {
        this._emailSentAt = new Date();
        this._emailSentCount += 1;
        this._lastEmailSentAt = new Date();
        this._updatedAt = new Date();
    }
    isExpired() {
        return this._expiresAt < new Date();
    }
    isPending() {
        return this._status === client_2.InvitationStatus.PENDING && !this.isExpired();
    }
    canResend() {
        return this.isPending() && this._emailSentCount < 5;
    }
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    static generateSecureToken() {
        return crypto.randomBytes(32).toString('hex');
    }
    toPersistence() {
        return {
            id: this._id,
            email: this._email,
            role: this._role,
            clientId: this._clientId,
            invitedBy: this._invitedBy,
            token: this._token,
            expiresAt: this._expiresAt,
            status: this._status,
            firstName: this._firstName,
            lastName: this._lastName,
            message: this._message,
            permissions: this._permissions,
            acceptedAt: this._acceptedAt,
            revokedAt: this._revokedAt,
            emailSentAt: this._emailSentAt,
            emailSentCount: this._emailSentCount,
            lastEmailSentAt: this._lastEmailSentAt,
            createdAt: this._createdAt,
            updatedAt: this._updatedAt,
        };
    }
}
exports.UserInvitation = UserInvitation;
//# sourceMappingURL=user-invitation.entity.js.map