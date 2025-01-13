import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Category } from '../entities/category.entity';

@InputType()
export class FindCategoryBySlugInput {
  @Field(() => String)
  slug: string;
}

@ObjectType()
export class FindCategoryBySlugOutput extends CoreOutput {
  @Field(() => Category, { nullable: true })
  category?: Category;
}
