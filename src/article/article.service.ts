import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { DeleteResult, getRepository, Repository } from 'typeorm';
import { Article } from './article.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { ArticleResponse } from './types/article-response.interface';
import slugify from 'slugify';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticlesResponse } from './types/articles-response.interface';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(query: any): Promise<any> {
    const queryBuilder = getRepository(Article)
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');

    if (query.tag) {
      queryBuilder.andWhere('articles.tagList LIKE :tag', {
        tag: `%${query.tag}%`,
      });
    }

    if (query.author) {
      const author = await this.userRepository.findOne({
        username: query.author,
      });

      queryBuilder.andWhere('articles.authorId = :id', {
        id: author.id,
      });
    }

    queryBuilder.orderBy('articles.createdAt', 'DESC');

    const articlesCount = await queryBuilder.getCount();

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    const articles = await queryBuilder.getMany();

    return { articles, articlesCount };
  }

  async createArticle(
    currentUser: User,
    createArticleDto: CreateArticleDto,
  ): Promise<Article> {
    const article = new Article();
    Object.assign(article, createArticleDto);

    if (!article.tagList) {
      article.tagList = [];
    }

    article.author = currentUser;

    article.slug = this.getSlug(createArticleDto.title);

    return await this.articleRepository.save(article);
  }

  async findBySlug(slug: string): Promise<Article> {
    return await this.articleRepository.findOne({ slug });
  }

  async deleteBySlug(
    currentUserId: number,
    slug: string,
  ): Promise<DeleteResult> {
    const article = await this.findBySlug(slug);

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.author.id !== currentUserId) {
      throw new ForbiddenException('Only author can delete article');
    }

    return this.articleRepository.delete({ slug });
  }

  async updateBySlug(
    currentUserId: number,
    slug: string,
    updateArticleDto: UpdateArticleDto,
  ): Promise<Article> {
    const article = await this.findBySlug(slug);

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.author.id !== currentUserId) {
      throw new ForbiddenException('Only author can update article');
    }

    Object.assign(article, updateArticleDto);

    if (updateArticleDto.title) {
      article.slug = this.getSlug(updateArticleDto.title);
    }

    return await this.articleRepository.save(article);
  }

  async addArticleToFavorites(slug: string, userId: number): Promise<Article> {
    const article = await this.findBySlug(slug);
    const user = await this.userRepository.findOne(userId, {
      relations: ['favorites'],
    });

    const isFavorited =
      user.favorites.findIndex((fav) => fav.id === article.id) !== -1;

    if (!isFavorited) {
      user.favorites.push(article);
      article.favoritesCount++;
      await this.articleRepository.save(article);
      await this.userRepository.save(user);
    }

    return article;
  }

  async removeArticleFromFavorites(slug: string, userId: number): Promise<Article> {
    const article = await this.findBySlug(slug);
    const user = await this.userRepository.findOne(userId, {
      relations: ['favorites'], // favorites: favorite articles
    });

    const articleIndex =
      user.favorites.findIndex((fav) => fav.id === article.id);

    if (articleIndex >= 0) { // article found
      user.favorites.splice(articleIndex, 1);
      article.favoritesCount--;
      await this.articleRepository.save(article);
      await this.userRepository.save(user);
    }

    return article;
  }

  buildArticleResponse(article: Article): ArticleResponse {
    return { article };
  }

  private getSlug(title: string): string {
    return (
      slugify(title, { lower: true }) +
      '-' +
      ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
    );
  }
}
