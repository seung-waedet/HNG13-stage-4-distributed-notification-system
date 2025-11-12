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
exports.NotificationRequestDto = exports.UserData = exports.NotificationType = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var NotificationType;
(function (NotificationType) {
    NotificationType["email"] = "email";
    NotificationType["push"] = "push";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
class UserData {
}
exports.UserData = UserData;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John Doe', description: 'User name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserData.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://example.com', description: 'Link for the notification' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserData.prototype, "link", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: { custom_field: 'custom_value' },
        description: 'Additional metadata',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UserData.prototype, "meta", void 0);
class NotificationRequestDto {
}
exports.NotificationRequestDto = NotificationRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: NotificationType,
        description: 'Type of notification to send'
    }),
    (0, class_validator_1.IsEnum)(NotificationType),
    __metadata("design:type", String)
], NotificationRequestDto.prototype, "notification_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'User ID in UUID format'
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], NotificationRequestDto.prototype, "user_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'welcome_email',
        description: 'Template code to use for the notification'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NotificationRequestDto.prototype, "template_code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Variables to populate in the template'
    }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => UserData),
    __metadata("design:type", UserData)
], NotificationRequestDto.prototype, "variables", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'req-123e4567-e89b-12d3-a456-426614174000',
        description: 'Request ID for idempotency'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NotificationRequestDto.prototype, "request_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1,
        description: 'Priority level (1-5)',
        required: false,
        minimum: 1,
        maximum: 5
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], NotificationRequestDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: { title: 'Welcome!' },
        description: 'Additional metadata for the notification',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], NotificationRequestDto.prototype, "metadata", void 0);
//# sourceMappingURL=create-notification.dto.js.map