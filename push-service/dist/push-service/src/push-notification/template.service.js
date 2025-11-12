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
var TemplateService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateService = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const axios_1 = require("@nestjs/axios");
let TemplateService = TemplateService_1 = class TemplateService {
    constructor(httpService) {
        this.httpService = httpService;
        this.logger = new common_1.Logger(TemplateService_1.name);
    }
    async getTemplate(templateCode) {
        var _a;
        const baseUrl = process.env.TEMPLATE_SERVICE_URL;
        if (!baseUrl) {
            this.logger.warn("TEMPLATE_SERVICE_URL is not set. Using mock template for development.");
            return this.getMockTemplate(templateCode);
        }
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.httpService.get(`${baseUrl}/api/v1/templates/${templateCode}`));
            return response.data;
        }
        catch (err) {
            const error = err;
            const status = (_a = error.response) === null || _a === void 0 ? void 0 : _a.status;
            const code = error.code;
            const message = error.message || "Unknown error";
            const transientCodes = [
                "ECONNREFUSED",
                "ENOTFOUND",
                "ETIMEDOUT",
                "ECONNRESET",
            ];
            const isTransient = !status || status >= 500 || transientCodes.includes(code !== null && code !== void 0 ? code : "");
            if (isTransient && process.env.TEMPLATE_FALLBACK_ON_ERROR === "true") {
                this.logger.warn(`Template service transient error (${code || status}): ${message}. Using mock template fallback.`);
                return this.getMockTemplate(templateCode);
            }
            throw new Error(`Failed to retrieve template: ${message}${status ? ` (status ${status})` : ""}`);
        }
    }
    getMockTemplate(templateCode) {
        const mockTemplates = {
            welcome_email: {
                code: "welcome_email",
                subject: "Welcome to our platform!",
                body: "Hi {{name}}, welcome aboard! We’re glad to have you here.",
                channels: ["email", "push"],
            },
            PASSWORD_RESET: {
                code: "PASSWORD_RESET",
                subject: "Reset your password",
                body: "Click the link below to reset your password: {{reset_link}}",
                channels: ["email"],
            },
        };
        return (mockTemplates[templateCode] || {
            code: templateCode,
            subject: "Default Notification",
            body: "This is a mock template body for {{templateCode}}.",
            channels: ["push"],
        });
    }
};
exports.TemplateService = TemplateService;
exports.TemplateService = TemplateService = TemplateService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], TemplateService);
//# sourceMappingURL=template.service.js.map