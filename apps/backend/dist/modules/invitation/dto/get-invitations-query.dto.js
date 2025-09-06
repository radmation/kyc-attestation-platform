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
exports.PaginatedInvitationsResult = exports.GetInvitationsQueryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var InvitationStatus;
(function (InvitationStatus) {
    InvitationStatus["PENDING"] = "PENDING";
    InvitationStatus["ACCEPTED"] = "ACCEPTED";
    InvitationStatus["EXPIRED"] = "EXPIRED";
    InvitationStatus["REVOKED"] = "REVOKED";
})(InvitationStatus || (InvitationStatus = {}));
class GetInvitationsQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
        this.sortBy = 'createdAt';
        this.sortOrder = 'desc';
    }
}
exports.GetInvitationsQueryDto = GetInvitationsQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Page number for pagination',
        example: 1,
        required: false,
        type: Number,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GetInvitationsQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of items per page',
        example: 20,
        required: false,
        type: Number,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], GetInvitationsQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by invitation status',
        enum: InvitationStatus,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(InvitationStatus),
    __metadata("design:type", String)
], GetInvitationsQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by email address',
        example: 'user@example.com',
        required: false,
        type: String,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetInvitationsQueryDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by inviter user ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
        type: String,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], GetInvitationsQueryDto.prototype, "invitedBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Sort field',
        example: 'createdAt',
        required: false,
        type: String,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetInvitationsQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Sort order',
        example: 'desc',
        required: false,
        enum: ['asc', 'desc'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['asc', 'desc']),
    __metadata("design:type", String)
], GetInvitationsQueryDto.prototype, "sortOrder", void 0);
class PaginatedInvitationsResult {
}
exports.PaginatedInvitationsResult = PaginatedInvitationsResult;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of invitations',
        type: [Object],
    }),
    __metadata("design:type", Array)
], PaginatedInvitationsResult.prototype, "invitations", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total number of invitations matching the query',
        example: 100,
    }),
    __metadata("design:type", Number)
], PaginatedInvitationsResult.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current page number',
        example: 1,
    }),
    __metadata("design:type", Number)
], PaginatedInvitationsResult.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of items per page',
        example: 20,
    }),
    __metadata("design:type", Number)
], PaginatedInvitationsResult.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total number of pages',
        example: 5,
    }),
    __metadata("design:type", Number)
], PaginatedInvitationsResult.prototype, "totalPages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether there is a next page',
        example: true,
    }),
    __metadata("design:type", Boolean)
], PaginatedInvitationsResult.prototype, "hasNextPage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether there is a previous page',
        example: false,
    }),
    __metadata("design:type", Boolean)
], PaginatedInvitationsResult.prototype, "hasPrevPage", void 0);
//# sourceMappingURL=get-invitations-query.dto.js.map