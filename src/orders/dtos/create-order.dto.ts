import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { Order } from '../entities/order.entity';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class CreateOrderInput extends PickType(Order, ['items']) {
  @Field(() => Int)
  restaurantId: number;
}

@ObjectType()
export class CreateOrderOutput extends CoreOutput {}
