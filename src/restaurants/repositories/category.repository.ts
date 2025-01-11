import { DataSource, Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CategoryRepository extends Repository<Category> {
  constructor(private dataSource: DataSource) {
    super(Category, dataSource.createEntityManager());
  }
  async getOrCreateCategory(name: string): Promise<Category> {
    try {
      const categoryName = name.trim().toLowerCase();
      const categorySlug = categoryName.replace(/ /g, '-');
      let category = await this.findOne({
        where: { slug: categorySlug },
      });
      if (!category) {
        category = await this.save(
          this.create({
            slug: categorySlug,
            name: categoryName,
            coverImage: ' ',
          }),
        );
      }
      return category;
    } catch (e) {
      let error = e.message;
      console.log(error);
    }
  }
}
