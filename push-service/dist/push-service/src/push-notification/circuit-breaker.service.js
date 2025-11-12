"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CircuitBreakerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreakerService = void 0;
const common_1 = require("@nestjs/common");
const CircuitBreaker = require("opossum");
let CircuitBreakerService = CircuitBreakerService_1 = class CircuitBreakerService {
    constructor() {
        this.logger = new common_1.Logger(CircuitBreakerService_1.name);
        this.circuitBreakers = new Map();
    }
    createCircuitBreaker(name, operation, options) {
        const defaultOptions = {
            timeout: 3000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
        };
        const circuitBreaker = new CircuitBreaker(operation, Object.assign(Object.assign({}, defaultOptions), options));
        circuitBreaker.on('open', () => {
            this.logger.warn(`Circuit breaker ${name} opened`);
        });
        circuitBreaker.on('close', () => {
            this.logger.log(`Circuit breaker ${name} closed`);
        });
        circuitBreaker.on('halfOpen', () => {
            this.logger.log(`Circuit breaker ${name} half-opened`);
        });
        this.circuitBreakers.set(name, circuitBreaker);
        return circuitBreaker;
    }
    getCircuitBreaker(name) {
        return this.circuitBreakers.get(name);
    }
};
exports.CircuitBreakerService = CircuitBreakerService;
exports.CircuitBreakerService = CircuitBreakerService = CircuitBreakerService_1 = __decorate([
    (0, common_1.Injectable)()
], CircuitBreakerService);
//# sourceMappingURL=circuit-breaker.service.js.map