import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Tag } from "./tag.entity"

@Injectable()
export class TagService {

  constructor(@InjectRepository(Tag) private readonly tagRepository: Repository<Tag>) {}

  async findAll(): Promise<Tag[]> {

    return await this.tagRepository.find();
  }

}