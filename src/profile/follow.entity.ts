import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'follows' })
export class Follow {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  followerId: number;

  @Column()
  followingId: number;

}