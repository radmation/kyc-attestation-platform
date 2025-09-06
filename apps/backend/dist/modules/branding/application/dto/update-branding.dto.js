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
exports.UpdateBrandingDto = void 0;
const class_validator_1 = require("class-validator");
class UpdateBrandingDto {
}
exports.UpdateBrandingDto = UpdateBrandingDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UpdateBrandingDto.prototype, "logoUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-F]{6}$/i, { message: 'Primary color must be a valid hex color' }),
    __metadata("design:type", String)
], UpdateBrandingDto.prototype, "primaryColor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-F]{6}$/i, { message: 'Secondary color must be a valid hex color' }),
    __metadata("design:type", String)
], UpdateBrandingDto.prototype, "secondaryColor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-F]{6}$/i, { message: 'Accent color must be a valid hex color' }),
    __metadata("design:type", String)
], UpdateBrandingDto.prototype, "accentColor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-F]{6}$/i, { message: 'Background color must be a valid hex color' }),
    __metadata("design:type", String)
], UpdateBrandingDto.prototype, "backgroundColor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-F]{6}$/i, { message: 'Surface color must be a valid hex color' }),
    __metadata("design:type", String)
], UpdateBrandingDto.prototype, "surfaceColor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-F]{6}$/i, { message: 'Text color must be a valid hex color' }),
    __metadata("design:type", String)
], UpdateBrandingDto.prototype, "textColor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^#[0-9A-F]{6}$/i, { message: 'Border color must be a valid hex color' }),
    __metadata("design:type", String)
], UpdateBrandingDto.prototype, "borderColor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['Inter', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'system-ui', 'sans-serif'], {
        message: 'Font family must be one of: Inter, Roboto, Open Sans, Lato, Poppins, system-ui, sans-serif'
    }),
    __metadata("design:type", String)
], UpdateBrandingDto.prototype, "fontFamily", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[0-9]+(\.[0-9]+)?(px|rem|em)$/, { message: 'Border radius must be in px, rem, or em units' }),
    __metadata("design:type", String)
], UpdateBrandingDto.prototype, "borderRadius", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBrandingDto.prototype, "shadow", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(10000, { message: 'Custom CSS is too long' }),
    __metadata("design:type", String)
], UpdateBrandingDto.prototype, "customCSS", void 0);
//# sourceMappingURL=update-branding.dto.js.map