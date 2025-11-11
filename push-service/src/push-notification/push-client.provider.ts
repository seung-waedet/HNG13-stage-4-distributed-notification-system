import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class PushClientProvider {
  private readonly logger = new Logger(PushClientProvider.name);

  constructor() {
    // Initialize Firebase Admin SDK for FCM
    if (!admin.apps.length) {
      try {
        admin.initializeApp({
          credential: admin.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          }),
        });
      } catch (error) {
        this.logger.warn(`Firebase initialization failed: ${error.message}. Using mock provider.`);
        // In a real implementation, you might want to throw an error or use a different provider
      }
    }
  }

  async sendPush(deviceToken: string, content: string, metadata?: any): Promise<any> {
    try {
      // For actual FCM implementation
      const message = {
        token: deviceToken,
        notification: {
          title: metadata?.title || 'New Notification',
          body: content,
        },
        data: metadata || {},
      };

      const response = await admin.messaging().send(message);
      this.logger.log(`Successfully sent push notification: ${response}`);

      return {
        success: true,
        responseId: response,
      };
    } catch (error) {
      this.logger.error(`Failed to send push notification: ${error.message}`, error);
      throw error;
    }
  }
}
