import { Mutation, Resolver } from '@nestjs/graphql';
import { ExcelService } from './excel.service';

@Resolver()
export class ExcelResolver {
  constructor(private readonly excelService: ExcelService) {}

  @Mutation(() => String)
  readExcelAndGenerateSQL() {}
}
