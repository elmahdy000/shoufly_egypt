import { EventEmitter } from 'events';

interface NotificationData {
  id: number;
  type: string;
  title: string;
  message: string;
  requestId?: number;
  createdAt: Date;
}

interface ChatMessageData {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt: Date;
}

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

  sendNotification(userId: number, notification: NotificationData) {
    this.emit(`user:${userId}`, notification);
  }

  sendChatMessage(receiverId: number, message: ChatMessageData) {
    this.emit(`chat:${receiverId}`, message);
  }
}

export const notificationEmitter = NotificationEmitter.getInstance();
