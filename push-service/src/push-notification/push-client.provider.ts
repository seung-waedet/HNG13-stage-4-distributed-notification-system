import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class PushClientProvider {
  private readonly logger = new Logger(PushClientProvider.name);
  private fcmInitialized = false;
  private fcm: any;

  constructor() {
    // Initialize Firebase Admin SDK for FCM
    try {
      const admin = require("firebase-admin");

      if (admin.apps.length === 0) {
        // Check if we have service account credentials
        if (process.env.FIREBASE_CREDENTIALS_PATH) {
          // Initialize with service account file
          admin.initializeApp({
            credential: admin.credential.cert(
              process.env.FIREBASE_CREDENTIALS_PATH,
            ),
          });
        } else if (
          process.env.FIREBASE_PROJECT_ID &&
          process.env.FIREBASE_CLIENT_EMAIL &&
          process.env.FIREBASE_PRIVATE_KEY
        ) {
          // Initialize with service account credentials from environment variables
          admin.initializeApp({
            credential: admin.credential.cert({
              projectId: process.env.FIREBASE_PROJECT_ID,
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
              privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(
                /\\n/g,
                "\n",
              ),
            }),
          });
        } else {
          // Initialize with default credentials (for Google Cloud deployment)
          admin.initializeApp();
        }
      }

      this.fcm = admin;
      this.fcmInitialized = true;
      this.logger.log("Firebase Admin SDK initialized successfully");
    } catch (error) {
      this.logger.warn(
        `Firebase initialization failed: ${error.message}. Using mock provider for push notifications.`,
      );
      this.fcmInitialized = false;
    }
  }

  async sendPush(
    deviceToken: string,
    content: string,
    metadata?: any,
  ): Promise<any> {
    if (!this.fcmInitialized) {
      // Mock implementation for when Firebase isn't available
      this.logger.log(
        `Mock push notification sent to ${deviceToken}: ${content}`,
      );
      return {
        success: true,
        responseId: `mock-${Date.now()}`,
      };
    }

    try {
      const message = {
        token: deviceToken,
        notification: {
          title: metadata?.title || "New Notification",
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
    } catch (error) {
      this.logger.error(
        `Failed to send push notification: ${error.message}`,
        error,
      );
      throw error;
    }
  }
}
