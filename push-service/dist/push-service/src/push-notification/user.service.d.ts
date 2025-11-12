import { HttpService } from "@nestjs/axios";
export declare class UserService {
    private httpService;
    private readonly logger;
    constructor(httpService: HttpService);
    getUser(userId: string): Promise<any>;
    getUserPreferences(userId: string): Promise<any>;
}
