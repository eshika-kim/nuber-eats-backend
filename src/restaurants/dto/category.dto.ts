import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Category } from '../entities/category.entity';
import { PaginationInput, PaginationOutput } from './pagination.dt';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class FindCategoryBySlugInput extends PaginationInput {
  @Field(() => String)
  slug: string;
}

@ObjectType()
export class FindCategoryBySlugOutput extends PaginationOutput {
  @Field(() => Category, { nullable: true })
  category?: Category;

  @Field(() => [Restaurant], { nullable: true })
  restaurants?: Restaurant[];
}
