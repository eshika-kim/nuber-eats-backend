import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(Restaurant)
    private readonly restaurant: Repository<Restaurant>,
  ) {}

  async createOrder(
    input: CreateOrderInput,
    customer: User,
  ): Promise<CreateOrderOutput> {
    const restaurant = await this.restaurant.findOne({
      where: { id: input.restaurantId },
    });
    if (!restaurant) {
      return {
        ok: false,
        error: 'Restaurant Not Found',
      };
    }
    const order = await this.orders.save(
      this.orders.create({ customer, restaurant }),
    );
    console.log(order);
    return {
      ok: true,
    };
  }
}
