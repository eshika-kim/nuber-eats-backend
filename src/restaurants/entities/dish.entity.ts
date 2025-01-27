import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { CoreEntity } from 'src/common/entities/core.entity';
import { IsNumber, IsString, Length } from 'class-validator';
import { Restaurant } from './restaurant.entity';
import { OrderItem } from 'src/orders/entities/order-item.entity';

@InputType('DishChoiceInputType', { isAbstract: true })
@ObjectType()
class DishChoice {
  @Field(() => String)
  name: string;
  @Field(() => Int, { nullable: true })
  extra?: number;
}

@InputType('DishOptionsInputType', { isAbstract: true })
@ObjectType()
export class DishOptions {
  @Field(() => String)
  name: string;

  @Field(() => [DishChoice], { nullable: true })
  choices?: DishChoice[];

  @Field(() => Int, { nullable: true })
  extra?: number;
}

@InputType('DishInputType', { isAbstract: true }) // 직접 주입해서 사용하는 것이 아니라 확장해서 사용하는 것. 이 클래스가 실제로
// db에 sync 되면 안되므로, 또한 다른 클래스가 상속받아 사용할 수도있으므로
@ObjectType()
@Entity()
export class Dish extends CoreEntity {
  @Field(() => String)
  @Column()
  @IsString()
  name: string;

  @Field(() => Int)
  @Column()
  @IsNumber()
  price: number;

  @Field(() => String)
  @Column({ nullable: true })
  @IsString()
  photo?: string;

  @Field(() => String)
  @Column()
  @IsString()
  @Length(5, 150)
  description: string;

  @Field(() => Restaurant, { nullable: true })
  @ManyToOne(() => Restaurant, (restaurant) => restaurant.menu, {
    nullable: true,
    onDelete: 'CASCADE', // 식당이 삭제되면 식당의 메뉴들이 모두 삭제되어야 하므로
  })
  restaurant: Restaurant;

  @RelationId((dish: Dish) => dish.restaurant)
  restaurantId: number;

  @Field(() => [DishOptions], { nullable: true })
  @Column({ type: 'json', nullable: true })
  options?: DishOptions[];
}
