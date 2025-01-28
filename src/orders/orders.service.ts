import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { OrderItem } from './entities/order-item.entity';
import { Dish } from 'src/restaurants/entities/dish.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(Restaurant)
    private readonly restaurant: Repository<Restaurant>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
  ) {}

  async createOrder(
    { restaurantId, items }: CreateOrderInput,
    customer: User,
  ): Promise<CreateOrderOutput> {
    const restaurant = await this.restaurant.findOne({
      where: { id: restaurantId },
    });
    if (!restaurant) {
      return {
        ok: false,
        error: 'Restaurant Not Found',
      };
    }
    items.forEach(async (item) => {
      const dish = await this.dishes.findOne({ where: { id: item.dishId } });
      if (!dish) {
        // 에러처리 해주기
      }
      await this.orderItems.save(
        this.orderItems.create({
          dish,
          options: item.options,
        }),
      );
    });
    console.log(items.forEach((item) => console.log(item.options)));
    // const order = await this.orders.save(
    //   this.orders.create({ customer, restaurant }),
    // );
    // console.log(order);
    return {
      ok: true,
    };
  }
}
