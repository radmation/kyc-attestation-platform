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
exports.BulkInvitationResult = exports.BulkInvitationDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const create_invitation_dto_1 = require("./create-invitation.dto");
class BulkInvitationDto {
}
exports.BulkInvitationDto = BulkInvitationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of invitation requests',
        type: [create_invitation_dto_1.CreateInvitationDto],
        minItems: 1,
        maxItems: 50,
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ArrayMaxSize)(50),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => create_invitation_dto_1.CreateInvitationDto),
    __metadata("design:type", Array)
], BulkInvitationDto.prototype, "invitations", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Common message for all invitations',
        example: 'Welcome to our KYC platform!',
        required: false,
        type: String,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], BulkInvitationDto.prototype, "commonMessage", void 0);
class BulkInvitationResult {
}
exports.BulkInvitationResult = BulkInvitationResult;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of invitations successfully created',
        example: 5,
    }),
    __metadata("design:type", Number)
], BulkInvitationResult.prototype, "successCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of invitations that failed to create',
        example: 0,
    }),
    __metadata("design:type", Number)
], BulkInvitationResult.prototype, "failureCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of successfully created invitation IDs',
        type: [String],
    }),
    __metadata("design:type", Array)
], BulkInvitationResult.prototype, "successfulInvitations", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of failed invitations with error details',
        type: [Object],
    }),
    __metadata("design:type", Array)
], BulkInvitationResult.prototype, "failedInvitations", void 0);
//# sourceMappingURL=bulk-invitation.dto.js.map