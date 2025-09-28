export interface NotificationTracking {
  id: string; // Unique notification ID
  status: 'pending' | 'completed';
  timestamp: number; // When notification was triggered
  completedAt?: number; // When mood-log was filled (if completed)
}