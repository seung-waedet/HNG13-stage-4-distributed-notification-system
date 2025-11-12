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
var PushClientProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushClientProvider = void 0;
const common_1 = require("@nestjs/common");
let PushClientProvider = PushClientProvider_1 = class PushClientProvider {
    constructor() {
        this.logger = new common_1.Logger(PushClientProvider_1.name);
        this.fcmInitialized = false;
        try {
            const admin = require("firebase-admin");
            if (admin.apps.length > 0) {
                this.fcm = admin;
                this.fcmInitialized = true;
                this.logger.log("Firebase Admin SDK already initialized.");
                return;
            }
            if (process.env.FIREBASE_CREDENTIALS_PATH) {
                admin.initializeApp({
                    credential: admin.credential.cert(process.env.FIREBASE_CREDENTIALS_PATH),
                });
                this.logger.log("Firebase initialized with credentials file.");
            }
            else if (process.env.FIREBASE_PROJECT_ID &&
                process.env.FIREBASE_CLIENT_EMAIL &&
                process.env.FIREBASE_PRIVATE_KEY) {
                admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId: process.env.FIREBASE_PROJECT_ID,
                        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
                    }),
                });
                this.logger.log("Firebase initialized with environment variables.");
            }
            else {
                this.logger.warn("No Firebase credentials found. Push notifications will be mocked.");
                this.fcmInitialized = false;
                return;
            }
            this.fcm = admin;
            this.fcmInitialized = true;
            this.logger.log("Firebase Admin SDK initialized successfully");
        }
        catch (error) {
            this.logger.error(`Firebase initialization failed: ${error.message}. Using mock provider for push notifications.`, error);
            this.fcmInitialized = false;
        }
    }
    async sendPush(deviceToken, content, metadata) {
        if (!this.fcmInitialized) {
            this.logger.log(`Mock push notification sent to ${deviceToken}: ${content}`);
            return {
                success: true,
                responseId: `mock-${Date.now()}`,
            };
        }
        try {
            const message = {
                token: deviceToken,
                notification: {
                    title: (metadata === null || metadata === void 0 ? void 0 : metadata.title) || "New Notification",
                    body: content,
                },
                data: metadata || {},
            };
            const response = await this.fcm.messaging().send(message);
            this.logger.log(`Successfully sent push notification: ${response}`);
            return {
                success: true,
                responseId: response,
            };
        }
        catch (error) {
            this.logger.error(`Failed to send push notification: ${error.message}`, error);
            throw error;
        }
    }
};
exports.PushClientProvider = PushClientProvider;
exports.PushClientProvider = PushClientProvider = PushClientProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PushClientProvider);
//# sourceMappingURL=push-client.provider.js.map