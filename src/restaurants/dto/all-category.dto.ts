import { Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Category } from '../entities/category.entity';

@ObjectType()
export class AllCategoryListOutput extends CoreOutput {
  @Field(() => [Category], { nullable: true })
  categoryList?: Category[];
}
