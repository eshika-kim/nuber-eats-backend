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
    try {
      const restaurant = await this.restaurant.findOne({
        where: { id: restaurantId },
      });
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant Not Found',
        };
      }

      const orderItemsArray: OrderItem[] = [];
      let orderFinalPrice = 0;
      for (const item of items) {
        // input으로 넣은 값 반복 (dishId, options)
        const dish = await this.dishes.findOne({ where: { id: item.dishId } });
        // const dish = await this.dishes.findOne({ where: { id: 231321 } });
        if (!dish) {
          // 에러처리 해주기
          return {
            ok: false,
          };
        }
        let dishFinalPrice = dish.price;

        // input으로 들어온 설정 값 반복 => 소비자가 선택한 옵션 값들 ex) 피클 한 개, 매운 맛 - 3단계, 사이즈 etc
        for (const itemOption of item.options) {
          const dishOption = dish.options.find(
            (dishOption) => dishOption.name === itemOption.name,
          );
          if (dishOption) {
            if (dishOption.extra) {
              console.log(`$USD ${dishOption.extra}`);
              dishFinalPrice += dishOption.extra;
              console.log(dishFinalPrice);
            } else {
              const dishOptionChoice = dishOption.choices.find(
                (optionChoice) => optionChoice.name === itemOption.choice,
              );
              if (dishOptionChoice) {
                if (dishOptionChoice.extra) {
                  console.log(`$USD ${dishOptionChoice.extra}`);
                  dishFinalPrice += dishOptionChoice.extra;
                  console.log(dishFinalPrice);
                }
              }
            }
            console.log(dishOption);
          }
        }
        console.log(dishFinalPrice);
        orderFinalPrice += dishFinalPrice;
        const orderItem = await this.orderItems.save(
          this.orderItems.create({
            dish,
            options: item.options,
          }),
        );
        orderItemsArray.push(orderItem);
      }

      const order = await this.orders.save(
        this.orders.create({
          customer,
          restaurant,
          total: orderFinalPrice,
          items: orderItemsArray,
        }),
      );

      return {
        ok: true,
      };
    } catch (e) {
      return {
        ok: false,
        error: 'Could not create error',
      };
    }
  }
}
