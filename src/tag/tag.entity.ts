import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'tags' })
export class Tag {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}