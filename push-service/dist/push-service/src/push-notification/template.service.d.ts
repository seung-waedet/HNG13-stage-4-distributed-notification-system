import { HttpService } from "@nestjs/axios";
export declare class TemplateService {
    private httpService;
    private readonly logger;
    constructor(httpService: HttpService);
    getTemplate(templateCode: string): Promise<any>;
    private getMockTemplate;
}
