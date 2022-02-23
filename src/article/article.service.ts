import { Injectable } from '@nestjs/common';

@Injectable()
export class ArticleService {
  createArticle() {
    return 'Create article from service';
  }
}
