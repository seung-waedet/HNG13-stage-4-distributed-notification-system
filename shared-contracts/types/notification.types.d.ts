export interface NotificationRequest {
    notification_type: 'email' | 'push';
    user_id: string;
    template_code: string;
    variables: {
        name: string;
        link: string;
        meta?: Record<string, any>;
    };
    request_id: string;
    priority?: number;
    metadata?: Record<string, any>;
}
export interface NotificationMessage {
    notification_id: string;
    user_id: string;
    notification_type: 'email' | 'push';
    template_code: string;
    variables: Record<string, any>;
    request_id: string;
    priority: number;
    created_at: string;
    retry_count: number;
    metadata?: Record<string, any>;
}
export interface User {
    id: string;
    name: string;
    email: string;
    push_token?: string;
    preferences: {
        email: boolean;
        push: boolean;
    };
}
export interface Template {
    id: string;
    code: string;
    content: string;
    language: string;
    variables: Record<string, string>;
}
export interface NotificationStatusUpdate {
    notification_id: string;
    status: 'delivered' | 'pending' | 'failed';
    timestamp: string;
    error?: string;
}
