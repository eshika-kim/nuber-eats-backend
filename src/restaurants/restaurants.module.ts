import { Module } from '@nestjs/common';
import { RestaurantService } from './restaurants.service';
import { CategoryResolver, RestaurantResolver } from './restaurants.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryRepository } from './repositories/category.repository';
import { Category } from './entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, Category])],
  providers: [
    RestaurantResolver,
    RestaurantService,
    CategoryRepository,
    CategoryResolver,
  ],
})
export class RestaurantsModule {}
