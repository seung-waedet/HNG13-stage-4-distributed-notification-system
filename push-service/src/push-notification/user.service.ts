import { Injectable } from "@nestjs/common";
import { lastValueFrom, catchError } from "rxjs";
import { HttpService } from "@nestjs/axios";
import { NotificationMessage } from "../../../shared-contracts/types/notification.types";

@Injectable()
export class UserService {
  constructor(private httpService: HttpService) {}

  async getUser(userId: string): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(
          `${process.env.USER_SERVICE_URL}/api/v1/users/${userId}`,
        ),
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to retrieve user: ${error.message}`);
    }
  }

  async getUserPreferences(userId: string): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(
          `${process.env.USER_SERVICE_URL}/api/v1/users/${userId}/preferences`,
        ),
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to retrieve user preferences: ${error.message}`);
    }
  }
}
