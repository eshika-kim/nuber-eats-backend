import { Module } from '@nestjs/common';
import { OrderService } from './orders.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderResolver } from './order.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  providers: [OrderResolver, OrderService],
})
export class OrdersModule {}
