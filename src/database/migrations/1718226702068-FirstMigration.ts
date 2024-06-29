import { MigrationInterface, QueryRunner } from "typeorm";

export class FirstMigration1718226702068 implements MigrationInterface {
    name = 'FirstMigration1718226702068'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_79cc8332af9a1ab7540f1523a4f"`);
        await queryRunner.query(`ALTER TABLE "transaction" RENAME COLUMN "source_account_id" TO "related_transaction_id"`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "UQ_f7c8e3dbb6752a8cd2c1049b075" UNIQUE ("related_transaction_id")`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_f7c8e3dbb6752a8cd2c1049b075" FOREIGN KEY ("related_transaction_id") REFERENCES "transaction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_f7c8e3dbb6752a8cd2c1049b075"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "UQ_f7c8e3dbb6752a8cd2c1049b075"`);
        await queryRunner.query(`ALTER TABLE "transaction" RENAME COLUMN "related_transaction_id" TO "source_account_id"`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_79cc8332af9a1ab7540f1523a4f" FOREIGN KEY ("source_account_id") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
