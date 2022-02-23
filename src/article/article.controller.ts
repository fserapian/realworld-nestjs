import { Controller, Post } from '@nestjs/common';

@Controller('articles')
export class ArticleController {
  @Post()
  createArticle() {
    return 'Create article';
  }
}
