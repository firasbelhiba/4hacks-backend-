import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'https://4hacksdb-front.vercel.app',
    ],
    credentials: true,
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private jwtService: JwtService) {}

  /**
   * Called automatically when a client connects
   */
  async handleConnection(client: Socket) {
    console.log(`Client trying to connect: ${client.id}`);
    try {
      console.log(client.handshake);

      const token = client.handshake.auth.token;

      if (!token) {
        // No identity → disconnect them
        client.disconnect();
        console.log('Disconnected because no authentication');
        return;
      }

      // Get user identity from jwt
      const jwtPayload = await this.jwtService.verifyAsync(token);

      console.log('jwtPayload', jwtPayload);

      const userId = jwtPayload.sub;

      if (!userId) {
        client.disconnect();
        console.log('Disconnected because no user id');
        return;
      }

      // Join a room with the user's ID. This to allow targeted notifications
      client.join(userId);

      console.log(`User ${userId} connected to notifications`);
    } catch (err) {
      client.disconnect();
    }
  }

  /**
   * Called automatically when a client disconnects
   */
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Emit notification to a specific user
   */
  sendNotificationEventToUser(userId: string, payload: any) {
    try {
      this.server.to(userId).emit('notification', payload);
    } catch (err) {
      console.error('Failed to send notification to user', userId, err);
    }
  }
}
