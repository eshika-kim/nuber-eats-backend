import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Dish, DishChoice } from 'src/restaurants/entities/dish.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@InputType('OrderItemOptionsInputType', { isAbstract: true })
@ObjectType()
export class OrderItemOptions {
  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  choice?: string;
}

@InputType('OrderItemInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class OrderItem extends CoreEntity {
  @ManyToOne(() => Dish, { nullable: true, onDelete: 'CASCADE' })
  dish: Dish;

  // 이미 dish에서 존재하는 property인데 relation으로 묶어주지 않는 이유는
  // options(json type)은 컬럼을 가진 엔티티와 달리 언제든지 변할 수 있기때문이다.
  // 가게 주인이 특정 옵션을 지우거나 추가할 수 있기떄문에 주문 당시의 옵션을 따로 저장하는 것이다.
  @Field(() => [OrderItemOptions], {
    nullable: true,
    description: '주문 당시의 옵션',
  })
  @Column({ type: 'json', nullable: true })
  options?: OrderItemOptions[];
}
