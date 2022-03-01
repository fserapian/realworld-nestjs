import { Article } from '../article.entity';

export interface ArticlesResponse {
  articles: Article[];
  articlesCount: number;
}
