import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Follow } from 'src/profile/follow.entity';
import { User } from 'src/user/user.entity';
import { ArticleController } from 'src/article/article.controller';
import { Article } from 'src/article/article.entity';
import { ArticleService } from 'src/article/article.service';

@Module({
  imports: [TypeOrmModule.forFeature([Article, User, Follow])],
  controllers: [ArticleController],
  providers: [ArticleService],
})
export class ArticleModule {}
