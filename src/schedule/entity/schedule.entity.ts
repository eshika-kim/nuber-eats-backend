import { Field, InputType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity } from 'typeorm';

@Entity()
@InputType()
export class Schedule extends CoreEntity {
  @Column()
  @Field(() => Date)
  dates: Date;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  todo_1: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  todo_2: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  todo_3: string;

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  todo_4: string;
}
