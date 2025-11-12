export declare enum NotificationType {
    email = "email",
    push = "push"
}
export declare class UserData {
    name: string;
    link: string;
    meta?: Record<string, any>;
}
export declare class NotificationRequestDto {
    notification_type: NotificationType;
    user_id: string;
    template_code: string;
    variables: UserData;
    request_id: string;
    priority?: number;
    metadata?: Record<string, any>;
}
