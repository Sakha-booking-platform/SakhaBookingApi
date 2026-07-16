import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';

@WebSocketGateway() // تركها فارغة لتعمل مع WsAdapter
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer()
  server: any; // تحويلها إلى any لمنع تعارض الأنواع مع socket.io القديم

  handleConnection(client: any) {
    console.log(`🔌 مريض اتصل بالسوكت النقي بنجاح!`);
  }

  handleDisconnect(client: any) {
    console.log(`❌ انقطع اتصال السوكت النقي`);
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(@ConnectedSocket() client: any, @MessageBody() data: any) {
    console.log(`وصلت بيانات:`, data);
  }

  /**
   * 📢 الدالة البديلة المتوافقة مع الـ WebSockets النقية
   * تقوم بتحويل البيانات إلى نص وبثها مباشرة عبر السيرفر لجميع الأجهزة المتصلة
   */
  emitToRoom(room: string, event: string, data: any) {
    const payload = JSON.stringify({
      event: event,
      room: room, // تمرير اسم الغرفة بداخل الـ payload ليفهمها الـ Flutter
      data: data,
    });

    // الـ WebSockets النقية تدور على جميع العملاء المتصلين وتبث لهم
    if (this.server && this.server.clients) {
      this.server.clients.forEach((client: any) => {
        // التأكد من أن الاتصال مفتوح وجاهز (ReadyState === 1 تعني OPEN)
        if (client.readyState === 1) {
          client.send(payload);
        }
      });
    }
  }
}