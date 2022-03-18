import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import slugify from "slugify";
import { Follow } from "src/profile/follow.entity";
import { User } from "src/user/user.entity";
import { DeleteResult, getRepository, Repository } from "typeorm";
import { Article } from "./article.entity";
import { CreateArticleDto } from "./dto/createArticle.dto";
import { ArticleResponseInterface } from "./types/articleResponse.interface";
import { ArticlesResponseInterface } from "./types/articlesResponse.interface";

@Injectable()
export class ArticleService {

  constructor(
    @InjectRepository(Article) private readonly articleRepository: Repository<Article>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Follow) private readonly followRepository: Repository<Follow>
  ) { }

  async findAll(currentUserId: number, query: any): Promise<ArticlesResponseInterface> {
    const queryBuilder = getRepository(Article)
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');

    if (query.tag)
      queryBuilder.andWhere('articles.tagList LIKE :tag', { tag: `%${query.tag}%` })

    if (query.author) {
      const author = await this.userRepository.findOne({ username: query.author });

      queryBuilder.andWhere('articles.authorId = :id', { id: author.id })

    }

    if (query.favorited) {
      const author = await this.userRepository.findOne({ username: query.favorited }, { relations: ['favorites'] });

      const favoriteArticleIds = author.favorites.map(el => el.id);

      if (favoriteArticleIds.length > 0) {
        queryBuilder.andWhere('articles.authorId IN (:...ids)', { ids: favoriteArticleIds });
      }
      else {
        queryBuilder.andWhere('1=0');
      }

      //console.log('author', author); 
    }

    queryBuilder.orderBy('articles.createdAt', 'DESC');

    const articlesCount = await queryBuilder.getCount();

    if (query.limit) queryBuilder.limit(query.limit);
    if (query.offset) queryBuilder.offset(query.offset);

    let favoriteIds: number[] = [];

    if (currentUserId) {
      const currentUser = await this.userRepository.findOne(currentUserId, { relations: ['favorites'] });

      favoriteIds = currentUser.favorites.map((favorite) => favorite.id);
    }

    const articles = await queryBuilder.getMany();
    const articleWithFavorited = articles.map((article) => {
      const favorited = favoriteIds.includes(article.id);
      return { ...article, favorited };
    });

    return { articles: articleWithFavorited, articlesCount };
  }


  async getFeed(userId: number, query: any): Promise<ArticlesResponseInterface> {
    const follows = await this.followRepository.find({ followerId: userId });

    if (follows.length === 0)
      return { articles: [], articlesCount: 0 };

    const followingUserIds = follows.map(follow => follow.followingId);

    const queryBuilder = getRepository(Article)
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author')
      .where('articles.authorId IN (:...ids)', { ids: followingUserIds});

      queryBuilder.orderBy('articles.createdAt', 'DESC');

      const articlesCount = await queryBuilder.getCount();

      if (query.limit) queryBuilder.limit(query.limit);
    if (query.offset) queryBuilder.offset(query.offset);

    const articles = await queryBuilder.getMany();

    return { articles, articlesCount };

  }


  async createArticle(currentUser: User, createArticleDto: CreateArticleDto): Promise<Article> {
    const article = new Article();
    Object.assign(article, createArticleDto);

    if (!article.tagList) article.tagList = [];

    article.slug = this.getSlug(createArticleDto.title);
    article.author = currentUser;

    return await this.articleRepository.save(article);
  }

  async findBySlug(slug: string) {
    const article = await this.articleRepository.findOne({ slug })

    if (!article)
      throw new HttpException('Article not found...', HttpStatus.NOT_FOUND);

    return article;
  }

  async deleteArticle(currentUserId: number, slug: string): Promise<DeleteResult> {
    const article = await this.findBySlug(slug);

    if (article.author.id !== currentUserId)
      throw new HttpException('You are not author of this article...', HttpStatus.FORBIDDEN);

    return await this.articleRepository.delete({ slug });
  }

  async updateArticle(currentUserId: number, slug: string, updateArticleDto: CreateArticleDto): Promise<Article> {
    const article = await this.findBySlug(slug);

    if (article.author.id !== currentUserId)
      throw new HttpException('You are not author of this article...', HttpStatus.FORBIDDEN);

    Object.assign(article, updateArticleDto);

    article.slug = this.getSlug(updateArticleDto.title);

    return await this.articleRepository.save(article);
  }

  async addArticleToFavorites(userId: number, slug: string): Promise<Article> {
    const article = await this.articleRepository.findOne({ slug });

    const user = await this.userRepository.findOne(userId, { relations: ['favorites'] });

    const isNotFavorited = user.favorites.findIndex(
      (articleInFavorites) => articleInFavorites.id === article.id
    ) === -1;

    if (isNotFavorited) {
      user.favorites.push(article);
      article.favoritesCount++;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }

    return article;
  }

  async deleteArticleFromFavorites(userId: number, slug: string): Promise<Article> {
    const article = await this.articleRepository.findOne({ slug });

    const user = await this.userRepository.findOne(userId, { relations: ['favorites'] });

    const articleIndex = user.favorites.findIndex(
      (articleInFavorites) => articleInFavorites.id === article.id
    );

    if (articleIndex >= 0) {
      user.favorites.splice(articleIndex, 1);
      article.favoritesCount--;

      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }

    return article;
  }


  buildArticleResponse(article: Article): ArticleResponseInterface {

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