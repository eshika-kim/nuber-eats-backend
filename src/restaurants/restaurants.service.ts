import { Injectable } from '@nestjs/common';
import { Restaurant } from './entities/retaurant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
  ) {}
  getAll(): Promise<Restaurant[]> {
    return this.restaurants.find();
  }

  createRestaurant(
    createRestaurantInput: CreateRestaurantDto,
  ): Promise<Restaurant> {
    // save vs create 차이점 :
    // const newRestaurant = new Restaurant();
    // newRestaurant.name = createRestaurantInput.name
    // => 매번 이런식으로 작성하면 코드도 길어지고 관리가 어려움
    // 하지만 아래처럼 typeorm method를 사용하면
    const newRestaurant = this.restaurants.create(createRestaurantInput);
    // 한줄로 객체를 만들어서 보관할 수 있음. 하지만 DB에 직접 저장한 것은 아님
    return this.restaurants.save(newRestaurant);
  }
}
