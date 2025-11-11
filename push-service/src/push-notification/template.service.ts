import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class TemplateService {
  constructor(private httpService: HttpService) {}

  async getTemplate(templateCode: string): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`${process.env.TEMPLATE_SERVICE_URL}/api/v1/templates/${templateCode}`)
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to retrieve template: ${error.message}`);
    }
  }
}
