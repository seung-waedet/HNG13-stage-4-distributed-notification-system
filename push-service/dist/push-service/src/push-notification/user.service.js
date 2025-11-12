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
var UserService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const axios_1 = require("@nestjs/axios");
let UserService = UserService_1 = class UserService {
    constructor(httpService) {
        this.httpService = httpService;
        this.logger = new common_1.Logger(UserService_1.name);
    }
    async getUser(userId) {
        var _a;
        const baseUrl = process.env.USER_SERVICE_URL;
        const mockPushToken = process.env.MOCK_PUSH_TOKEN || "czTNn4jiD6Egmdh5wqMpZy:APA91bGiE4utvdOKJuKH7as-GGDE-Lg9sEvK4FPBf4gAHK6GI0Lr0ezKUyxgr4kJSDsIgyWXFWlqY7RdYIi-WA-JX1BaA_KxRWorqlIsM-9etrRpfCfH3ys";
        if (!baseUrl) {
            this.logger.warn("USER_SERVICE_URL is not set. Using mock user for development.");
            return {
                id: userId,
                push_token: mockPushToken,
                preferences: { push: true },
            };
        }
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.httpService.get(`${baseUrl}/api/v1/users/${userId}`));
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
            if (isTransient && process.env.USER_FALLBACK_ON_ERROR === "true") {
                this.logger.warn(`User service transient error (${code || status}): ${message}. Using mock user fallback.`);
                return {
                    id: userId,
                    push_token: mockPushToken,
                    preferences: { push: true },
                };
            }
            throw new Error(`Failed to retrieve user: ${message}${status ? ` (status ${status})` : ""}`);
        }
    }
    async getUserPreferences(userId) {
        var _a;
        const baseUrl = process.env.USER_SERVICE_URL;
        if (!baseUrl) {
            this.logger.warn("USER_SERVICE_URL is not set. Returning default push-enabled preferences.");
            return { push: true };
        }
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.httpService.get(`${baseUrl}/api/v1/users/${userId}/preferences`));
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
            if (isTransient && process.env.USER_FALLBACK_ON_ERROR === "true") {
                this.logger.warn(`User preferences transient error (${code || status}): ${message}. Returning default preferences.`);
                return { push: true };
            }
            throw new Error(`Failed to retrieve user preferences: ${message}${status ? ` (status ${status})` : ""}`);
        }
    }
};
exports.UserService = UserService;
exports.UserService = UserService = UserService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], UserService);
//# sourceMappingURL=user.service.js.map