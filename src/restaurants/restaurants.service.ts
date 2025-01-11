import { Injectable } from '@nestjs/common';
import { Restaurant } from './entities/restaurant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateRestaurantInputDto,
  CreateRestaurantOutputDto,
} from './dto/create-restaurant.dto';
import { User } from 'src/users/entities/user.entity';
import { Category } from './entities/category.entity';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dto/edit-restaurant.dto';
import { CategoryRepository } from './repositories/category.repository';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Category)
    private readonly category: CategoryRepository,
  ) {}
  getAll(): Promise<Restaurant[]> {
    return this.restaurants.find();
  }

  async createRestaurant(
    owner: User,
    input: CreateRestaurantInputDto,
  ): Promise<CreateRestaurantOutputDto> {
    try {
      const newRestaurant = this.restaurants.create(input);
      newRestaurant.owner = owner;

      const categoryName = input.categoryName.trim().toLowerCase();
      const categorySlug = categoryName.replace(/ /g, '-');
      const category = await this.category.getOrCreateCategory(
        input.categoryName,
      );
      await this.restaurants.save(newRestaurant);
      return {
        ok: true,
      };
    } catch (e) {
      let error = e.message;
      return {
        ok: false,
        error,
      };
    }
  }

  async editRestaurant(
    owner: User,
    input: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne({
        where: { id: input.restaurantId },
      });
      if (!restaurant) {
        throw new Error('Restaurant not found');
      }
      if (restaurant.ownerId !== owner.id) {
        throw new Error('You are not this restaurant owner');
      }
      let category: Category = null;
      if (input.categoryName) {
        category = await this.category.getOrCreateCategory(input.categoryName);
      }
      await this.restaurants.save([
        {
          id: input.restaurantId,
          ...input,
          ...(category && { category }),
        },
      ]);
      return {
        ok: true,
      };
    } catch (e) {
      let error = e.message;
      return {
        ok: false,
        error,
      };
    }
  }
}
