import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { Restaurant } from '../entities/restaurant.entity';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class DeleteRestaurantInput extends PickType(Restaurant, ['id']) {}

@ObjectType()
export class DeleteRestaurantOutput extends CoreOutput {}
