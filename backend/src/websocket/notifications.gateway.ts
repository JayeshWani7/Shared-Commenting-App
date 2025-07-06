import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
@UseGuards(JwtAuthGuard)
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // userId -> socketId

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Client connected: ${client.id}`);
    
    // Extract user ID from JWT token
    const token = client.handshake.auth.token;
    if (token) {
      try {
        // In a real implementation, you'd validate the JWT token here
        // For now, we'll assume the user ID is passed directly
        const userId = client.handshake.auth.userId;
        if (userId) {
          this.connectedUsers.set(userId, client.id);
          client.join(`user_${userId}`);
        }
      } catch (error) {
        console.error('Error processing connection:', error);
        client.disconnect();
      }
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    
    // Remove user from connected users
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(client: Socket, payload: { userId: string }) {
    const { userId } = payload;
    this.connectedUsers.set(userId, client.id);
    client.join(`user_${userId}`);
    return { event: 'joined_room', data: { userId } };
  }

  // Method to send notifications to specific users
  sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user_${userId}`).emit('new_notification', notification);
  }

  // Method to send real-time comment updates
  sendCommentUpdate(data: any) {
    this.server.emit('comment_update', data);
  }
}
