import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsOptional } from 'class-validator';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { Category } from './category.entity';
import { User } from 'src/users/entities/user.entity';
import { Dish } from './dish.entity';
import { Order } from 'src/orders/entities/order.entity';

@InputType('RestaurantInputType', { isAbstract: true }) // 직접 주입해서 사용하는 것이 아니라 확장해서 사용하는 것. 이 클래스가 실제로
// db에 sync 되면 안되므로, 또한 다른 클래스가 상속받아 사용할 수도있으므로
@ObjectType()
@Entity()
export class Restaurant {
  @PrimaryGeneratedColumn()
  @Field(() => Number)
  id: number;

  @Field(() => String)
  @Column()
  name: string;

  @Field(() => String)
  @Column()
  coverImage: string;

  @Field(() => String)
  @Column()
  address: string;

  @Field(() => Category, { nullable: true })
  @ManyToOne(() => Category, (category) => category.restaurants, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  category: Category;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.restaurants, { onDelete: 'CASCADE' })
  owner: User;

  @Field(() => [Order])
  @OneToMany(() => Order, (order) => order.restaurant, { onDelete: 'CASCADE' })
  order: Order[];

  @RelationId((restaurant: Restaurant) => restaurant.owner)
  ownerId: number;

  @Field(() => [Dish])
  @OneToMany(() => Dish, (dish) => dish.restaurant)
  menu: Dish[];
}
