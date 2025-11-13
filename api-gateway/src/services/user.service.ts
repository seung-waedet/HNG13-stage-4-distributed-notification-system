import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  private readonly baseUrl = process.env.USER_SERVICE_URL || 'http://user-service:3002';

  constructor(private httpService: HttpService) {}

  async getUser(userId: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/api/v1/users/${userId}`;
      this.logger.log(`Fetching user from: ${url}`);
      const response = await lastValueFrom(this.httpService.get(url));
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      this.logger.error(`Failed to fetch user ${userId}: ${err.message}`, err.stack);
      throw new Error(`Failed to fetch user: ${err.message}`);
    }
  }
}
