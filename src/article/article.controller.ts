import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UsePipes } from "@nestjs/common";
import { BackendValidationPipe } from "src/shared/pipes/backendValidation.pipe";
import { UserDecorator } from "src/user/decorators/user.decorator";
import { AuthGuard } from "src/user/guards/auth.guard";
import { User } from "src/user/user.entity";
import { DeleteResult } from "typeorm";
import { ArticleService } from "./article.service";
import { CreateArticleDto } from "./dto/createArticle.dto";
import { ArticleResponseInterface } from "./types/articleResponse.interface";
import { ArticlesResponseInterface } from "./types/articlesResponse.interface";

@Controller('articles')
export class ArticleController {

  constructor(private readonly articleService: ArticleService) { }

  @Get()
  async findAll(@UserDecorator('id') currentUserId: number, @Query() query: any): Promise<ArticlesResponseInterface> {

    return await this.articleService.findAll(currentUserId, query);
  }
  
  @Get('/feed')
  @UseGuards(AuthGuard)
  async getFeed(@UserDecorator('id') currentUserId: number, @Query() query: any): Promise<ArticlesResponseInterface> {

    return await this.articleService.getFeed(currentUserId, query);

    
  }

  @Post()
  @UseGuards(AuthGuard)
  //@UsePipes(new ValidationPipe())
  @UsePipes(new BackendValidationPipe())
  async create(@UserDecorator() currentUser: User, @Body('article') createArticleDto: CreateArticleDto): Promise<ArticleResponseInterface> { 

    const article = await this.articleService.createArticle(currentUser, createArticleDto);

    return this.articleService.buildArticleResponse(article);
  } 

  @Get('/:slug')
  async getSingleArticle(@Param('slug') slug: string): Promise<ArticleResponseInterface> {

    const article = await this.articleService.findBySlug(slug);

    return this.articleService.buildArticleResponse(article);
  }

  @Delete('/:slug')
  @UseGuards(AuthGuard)
  async deleteArticle(@UserDecorator('id') currentUserId: number, @Param('slug') slug: string): Promise<DeleteResult> {

    return await this.articleService.deleteArticle(currentUserId, slug);
  }

  @Put('/:slug')
  @UseGuards(AuthGuard)
  @UsePipes(new BackendValidationPipe())
  async updateArticle(@UserDecorator('id') currentUserId: number, @Param('slug') slug: string, @Body('article') updateArticleDto: CreateArticleDto): Promise<ArticleResponseInterface> {
    const article = await this.articleService.updateArticle(currentUserId, slug, updateArticleDto);

    return this.articleService.buildArticleResponse(article);
  }

  @Post('/:slug/favorite')
  @UseGuards(AuthGuard)
  async addArticleToFavorites(@UserDecorator('id') currentUserId: number, @Param('slug') slug: string): Promise<ArticleResponseInterface> {
    const article = await this.articleService.addArticleToFavorites(currentUserId, slug);

    return this.articleService.buildArticleResponse(article);
  }

  @Delete('/:slug/favorite')
  @UseGuards(AuthGuard)
  async deleteArticleFromFavorites(@UserDecorator('id') currentUserId: number, @Param('slug') slug: string): Promise<ArticleResponseInterface> {
    const article = await this.articleService.deleteArticleFromFavorites(currentUserId, slug);

    return this.articleService.buildArticleResponse(article);
  }

}