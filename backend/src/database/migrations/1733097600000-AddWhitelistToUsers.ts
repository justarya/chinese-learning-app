import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWhitelistToUsers1733097600000 implements MigrationInterface {
    name = 'AddWhitelistToUsers1733097600000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "is_whitelisted" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_whitelisted"`);
    }

}
