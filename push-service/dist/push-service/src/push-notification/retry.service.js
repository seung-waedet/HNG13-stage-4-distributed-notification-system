"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RetryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryService = void 0;
const common_1 = require("@nestjs/common");
let RetryService = RetryService_1 = class RetryService {
    constructor() {
        this.logger = new common_1.Logger(RetryService_1.name);
    }
    async executeWithRetry(operation, maxRetries = 3, baseDelay = 1000, onError) {
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const result = await operation();
                if (attempt > 0) {
                    this.logger.log(`Operation succeeded after ${attempt} retries`);
                }
                return result;
            }
            catch (error) {
                if (attempt === maxRetries) {
                    this.logger.error(`Operation failed after ${maxRetries} retries: ${error.message}`);
                    throw error;
                }
                const delay = baseDelay * Math.pow(2, attempt);
                this.logger.warn(`Attempt ${attempt + 1} failed: ${error.message}. Retrying in ${delay}ms...`);
                if (onError) {
                    onError(error, attempt + 1);
                }
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
};
exports.RetryService = RetryService;
exports.RetryService = RetryService = RetryService_1 = __decorate([
    (0, common_1.Injectable)()
], RetryService);
//# sourceMappingURL=retry.service.js.map