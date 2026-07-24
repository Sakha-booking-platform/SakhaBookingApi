import { Module, Global } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';

@Global() // جعل الموديول عالمياً لسهولة حقنه في أي الخدمة (Service) تريدها
@Module({
  providers: [SocketGateway],
  exports: [SocketGateway], // تصديره ليكون متاحاً للاستخدام الخارجي
})
export class SocketModule {}
