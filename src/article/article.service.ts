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
import { ArticleType } from './types/article.type';
import { Follow } from 'src/profile/follow.entity';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
  ) {}

  async getArticles(currentUserId: number, query: any): Promise<ArticlesResponse> {
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

    if (query.favorited) {
      const author = await this.userRepository.findOne(
        { username: query.favorited },
        { relations: ['favorites'] },
      );

      const ids = author.favorites.map((fav) => fav.id);

      if (ids.length > 0) {
        queryBuilder.andWhere('articles.id IN (:...ids)', { ids });
      } else {
        queryBuilder.andWhere('1=0');
      }
    }

    queryBuilder.orderBy('articles.createdAt', 'DESC');

    const articlesCount = await queryBuilder.getCount();

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    let favoriteIds: number[] = [];

    if (currentUserId) {
      const currentUser = await this.userRepository.findOne(currentUserId, {
        relations: ['favorites'],
      });

      favoriteIds = currentUser.favorites.map((fav) => fav.id);
    }

    const articles = await queryBuilder.getMany();
    const articlesWithFavorited: ArticleType[] = articles.map((article) => {
      const favorited = favoriteIds.includes(article.id);
      return {
        ...article,
        favorited,
      };
    });

    return { articles: articlesWithFavorited, articlesCount };
  }

  async getFeed(currentUserId: number, query: any): Promise<ArticlesResponse> {
    const follows = await this.followRepository.find({
      followerId: currentUserId,
    });

    if (follows.length === 0) {
      return { articles: [], articlesCount: 0 };
    }

    const followingUserIds = follows.map((follow) => follow.followingId);
    const queryBuilder = getRepository(Article)
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author')
      .where('articles.authorId IN (:...ids)', { ids: followingUserIds });

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
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
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
