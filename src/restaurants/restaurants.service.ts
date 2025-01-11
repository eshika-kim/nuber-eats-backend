import { Injectable } from '@nestjs/common';
import { Restaurant } from './entities/retaurant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateRestaurantInputDto,
  CreateRestaurantOutputDto,
} from './dto/create-restaurant.dto';
import { User } from 'src/users/entities/user.entity';
import { Category } from './entities/category.entity';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Category)
    private readonly category: Repository<Category>,
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
      let category = await this.category.findOne({
        where: { slug: categorySlug },
      });
      if (!category) {
        category = await this.category.save(
          this.category.create({
            slug: categorySlug,
            name: categoryName,
            coverImage: ' ',
          }),
        );
      }
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
}
