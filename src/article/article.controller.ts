import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/user/decorators/current-user.decorator';
import { AuthGuard } from 'src/user/guards/auth.guard';
import { User } from 'src/user/user.entity';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @UseGuards(AuthGuard)
  async createArticle(
    @CurrentUser() currentUser: User,
    @Body('article') createArticleDto: CreateArticleDto,
  ): Promise<any> {
    return this.articleService.createArticle(currentUser, createArticleDto);
  }
}
