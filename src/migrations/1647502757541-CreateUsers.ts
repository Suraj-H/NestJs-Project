import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateUsers1647502757541 implements MigrationInterface {
    name = 'CreateUsers1647502757541'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "username"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "username" character varying NOT NULL`);
    }

}
