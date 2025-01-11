import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { RestaurantService } from './restaurants.service';
import { Restaurant } from './entities/restaurant.entity';
import {
  CreateRestaurantInputDto,
  CreateRestaurantOutputDto,
} from './dto/create-restaurant.dto';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/auth/role.decorator';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dto/edit-restaurant.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dto/delete-restaurant.dto';
import { Category } from './entities/category.entity';
import { AllCategoryListOutput } from './dto/all-category.dto';

@Resolver()
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}
  @Query(() => [Restaurant])
  restaurant(): Promise<Restaurant[]> {
    return this.restaurantService.getAll();
  }

  @Mutation(() => CreateRestaurantOutputDto)
  @Role(['Owner'])
  async createRestaurant(
    @AuthUser() authUser: User,
    @Args('input') input: CreateRestaurantInputDto,
  ): Promise<CreateRestaurantOutputDto> {
    return await this.restaurantService.createRestaurant(authUser, input);
  }

  @Mutation(() => EditRestaurantOutput)
  @Role(['Owner'])
  async editRestaurant(
    @AuthUser() authUser: User,
    @Args('input') input: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    return await this.restaurantService.editRestaurant(authUser, input);
  }

  @Mutation(() => EditRestaurantOutput)
  @Role(['Owner'])
  async deleteRestaurant(
    @AuthUser() authUser: User,
    @Args('input') input: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    return await this.restaurantService.deleteRestaurant(authUser, input);
  }
}

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @ResolveField(() => Int)
  restaurantCount(@Parent() category: Category): Promise<number> {
    console.log(category);
    return this.restaurantService.countRestaurants(category);
  }

  @Query(() => AllCategoryListOutput)
  async allCategoryList(): Promise<AllCategoryListOutput> {
    return await this.restaurantService.allCategoryList();
  }
}
