import { EventEmitter } from 'events';

class NotificationEmitter extends EventEmitter {
  static instance: NotificationEmitter;

  private constructor() {
    super();
    // Maximum listeners to avoid warnings on high concurrent users
    this.setMaxListeners(1000);
  }

  static getInstance() {
    if (!NotificationEmitter.instance) {
      NotificationEmitter.instance = new NotificationEmitter();
    }
    return NotificationEmitter.instance;
  }

  sendNotification(userId: number, notification: any) {
    this.emit(`user:${userId}`, notification);
  }
}

export const notificationEmitter = NotificationEmitter.getInstance();
