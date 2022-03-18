import { User } from '../user.entity';
import { Request } from 'express';


export interface ExpressRequest extends Request {
  user?: User;
}