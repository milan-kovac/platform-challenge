import { MigrationInterface, QueryRunner } from "typeorm";

export class FirstMigration1718225458351 implements MigrationInterface {
    name = 'FirstMigration1718225458351'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction" RENAME COLUMN "timestamp" TO "related_transaction_id"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "related_transaction_id"`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD "related_transaction_id" uuid`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "UQ_f7c8e3dbb6752a8cd2c1049b075" UNIQUE ("related_transaction_id")`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_f7c8e3dbb6752a8cd2c1049b075" FOREIGN KEY ("related_transaction_id") REFERENCES "transaction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_f7c8e3dbb6752a8cd2c1049b075"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "UQ_f7c8e3dbb6752a8cd2c1049b075"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "related_transaction_id"`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD "related_transaction_id" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "transaction" RENAME COLUMN "related_transaction_id" TO "timestamp"`);
    }

}
