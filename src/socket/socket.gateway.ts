// src/socket/socket.gateway.ts

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';

// ⭐ Type للـ WebSocket Client
interface WebSocketClient {
  readyState: number;
  send: (data: string) => void;
}

// ⭐ Type للـ Server
interface WebSocketServer {
  clients: Set<WebSocketClient>;
}

@WebSocketGateway()
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: WebSocketServer | null = null;

  // ⭐ Map يحفظ الـ Room لكل Client
  private clientRooms = new Map<WebSocketClient, string>();

  handleConnection(client: WebSocketClient): void {
    console.log(`🔌 Client connected`);
  }

  handleDisconnect(client: WebSocketClient): void {
    console.log(`❌ Client disconnected`);
    this.clientRooms.delete(client);
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: WebSocketClient,
    @MessageBody() data: unknown,
  ): void {
    // ⭐ Type guard للـ data
    const room = this.extractRoom(data);

    if (room) {
      this.clientRooms.set(client, room);
      console.log(`🏠 Client joined room: ${room}`);
    } else {
      console.log(`⚠️ No room provided in join_room data:`, data);
    }
  }

  /**
   * ⭐⭐⭐ يرسل فقط للعملاء في نفس الـ Room
   */
  emitToRoom(room: string, event: string, data: unknown): number {
    const payload = JSON.stringify({
      event,
      room,
      data,
    });

    let sentCount = 0;

    if (this.server?.clients) {
      this.server.clients.forEach((client: WebSocketClient) => {
        const clientRoom = this.clientRooms.get(client);

        if (clientRoom === room && client.readyState === 1) {
          client.send(payload);
          sentCount++;
        }
      });
    }

    console.log(
      `📢 Broadcasted "${event}" to room "${room}": ${sentCount} client(s)`,
    );

    return sentCount;
  }

  // ⭐⭐⭐ Helper: يستخرج الـ Room من الـ data بأمان
  private extractRoom(data: unknown): string | null {
    if (typeof data !== 'object' || data === null) {
      return null;
    }

    // التنسيق الأول: { room: '...' }
    if (
      'room' in data &&
      typeof (data as Record<string, unknown>).room === 'string'
    ) {
      return (data as Record<string, unknown>).room as string;
    }

    // التنسيق الثاني: { data: { room: '...' } }
    if ('data' in data) {
      const innerData = (data as Record<string, unknown>).data;
      if (
        typeof innerData === 'object' &&
        innerData !== null &&
        'room' in innerData &&
        typeof (innerData as Record<string, unknown>).room === 'string'
      ) {
        return (innerData as Record<string, unknown>).room as string;
      }
    }

    return null;
  }
}
