import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Follow } from "src/profile/follow.entity";
import { User } from "src/user/user.entity";
import { ArticleController } from "./article.controller";
import { Article } from "./article.entity";
import { ArticleService } from "./article.service";

@Module({
imports: [TypeOrmModule.forFeature([Article, User, Follow])],
controllers: [ArticleController],
providers: [ArticleService]
})
export class ArticleModule {}