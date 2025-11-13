import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class TemplateService {
  private readonly logger = new Logger(TemplateService.name);
  private readonly baseUrl = process.env.TEMPLATE_SERVICE_URL || 'http://template-service:8002';

  constructor(private httpService: HttpService) {}

  async getTemplate(templateCode: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/api/v1/templates/${templateCode}`;
      this.logger.log(`Fetching template from: ${url}`);
      const response = await lastValueFrom(this.httpService.get(url));
      // The template service returns a response object, we need the data property
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError;
      this.logger.error(`Failed to fetch template ${templateCode}: ${err.message}`, err.stack);
      throw new Error(`Failed to fetch template: ${err.message}`);
    }
  }
}
