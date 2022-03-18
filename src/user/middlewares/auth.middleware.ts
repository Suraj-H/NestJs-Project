import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Response } from "express";
import { verify } from "jsonwebtoken";
import { JWT_SECRET } from "src/config";
import { ExpressRequest } from "../types/expressRequest.interface";
import { User } from "../user.entity";
import { UserService } from "../user.service";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  
  constructor(private readonly userService: UserService) {}

  async use(req: ExpressRequest, _res: Response, next: NextFunction) { 

    if (!req.headers.authorization) {
      req.user = null;
      next();
      return;
    }

    const token = req.headers.authorization?.split(' ')[1];
    //console.log('token', token);
     
    try {
      const decode = verify(token, JWT_SECRET) as User;
      const user = await this.userService.findById(decode.id);     
      req.user = user;
      next();
    } catch (error) {
      req.user = null;
      
      next();
    }

  }
}