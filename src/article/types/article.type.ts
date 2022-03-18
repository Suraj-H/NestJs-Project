import { Article } from "../article.entity";

export type ArticleType = Omit<Article, 'updateTimestamp'>; 