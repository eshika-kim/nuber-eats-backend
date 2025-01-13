import { Injectable } from '@nestjs/common';
import { Restaurant } from './entities/restaurant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Raw, Repository } from 'typeorm';
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
import { DeleteRestaurantOutput } from './dto/delete-restaurant.dto';
import { DeleteRestaurantInput } from './dto/delete-restaurant.dto';
import { AllCategoryListOutput } from './dto/all-category.dto';
import {
  FindCategoryBySlugInput,
  FindCategoryBySlugOutput,
} from './dto/category.dto';
import { RestaurantsInput, RestaurantsOutput } from './dto/restaurants.dto';
import { Args } from '@nestjs/graphql';
import { RestaurantInput } from './dto/restaurant.dto';
import { RestaurantOutput } from './dto/restaurant.dto';
import { SearchRestaurantOutput } from './dto/search-restaurant.dto';
import { SearchRestaurantInput } from './dto/search-restaurant.dto';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
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
      newRestaurant.category = category;
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

  async deleteRestaurant(
    owner: User,
    input: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne({
        where: { id: input.id },
      });
      if (!restaurant) {
        throw new Error('Restaurant not found');
      }
      if (restaurant.ownerId !== owner.id) {
        throw new Error('You are not this restaurant owner');
      }

      await this.restaurants.delete(restaurant.id);

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

  async allCategoryList(): Promise<AllCategoryListOutput> {
    try {
      const categoryList: Category[] = await this.category.find();
      return {
        ok: true,
        categoryList,
      };
    } catch (e) {
      let error = e.message;
      return {
        ok: false,
        error,
      };
    }
  }

  async countRestaurants(category: Category) {
    return await this.restaurants.count({
      where: { category: { id: category.id } },
    });
  }

  async findCategoryBySlug({
    slug,
    page,
  }: FindCategoryBySlugInput): Promise<FindCategoryBySlugOutput> {
    try {
      const category = await this.category.findOne({
        where: { slug },
      });
      const restaurants = await this.restaurants.find({
        where: { category: { id: category.id } },
        take: 25,
        skip: (page - 1) * 25,
      });

      const totalResults = await this.countRestaurants(category);
      return {
        ok: true,
        category,
        restaurants,
        totalPages: Math.ceil(totalResults / 25),
      };
    } catch (e) {
      let error = e.message;
      return {
        ok: false,
        error,
      };
    }
  }

  async allRestaurants(
    @Args('input') { page }: RestaurantsInput,
  ): Promise<RestaurantsOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        take: 25,
        skip: (page - 1) * 25,
      });

      return {
        ok: true,
        results: restaurants,
        totalPages: Math.ceil(totalResults / 25),
        totalResults,
      };
    } catch (e) {
      let error = e.message;
      return {
        ok: false,
        error,
      };
    }
  }

  async findRestaurantById({
    restaurantId,
  }: RestaurantInput): Promise<RestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne({
        where: { id: restaurantId },
      });

      if (!restaurant) {
        throw new Error('restaurant could not find');
      }
      return {
        ok: true,
        result: restaurant,
      };
    } catch (e) {
      let error = e.message;
      return {
        ok: false,
        error,
      };
    }
  }

  async searchRestaurantByName({
    page,
    query,
  }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        where: { name: Raw((name) => `${name} ILIKE '%${query}%'`) },
      });

      return {
        ok: true,
        totalResults,
        restaurants,
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
