import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateEntities1697212388410 implements MigrationInterface {
  name = 'UpdateEntities1697212388410'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`subscriptions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`customer_id\` varchar(255) NOT NULL, \`subscription_id\` varchar(255) NOT NULL, \`customer_email\` varchar(255) NOT NULL, \`interval\` varchar(255) NOT NULL, \`amount\` int NOT NULL, \`status\` varchar(255) NOT NULL, \`current_period_start\` datetime NOT NULL, \`current_period_end\` datetime NOT NULL, \`canceled_at\` datetime NULL, \`ended_at\` datetime NULL, \`user_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    )
    await queryRunner.query(
      `CREATE TABLE \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`first_name\` varchar(255) NULL, \`last_name\` varchar(255) NULL, \`email\` varchar(255) NOT NULL, \`date_created\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`date_updated\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`date_subscribed\` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`status\` varchar(255) NOT NULL DEFAULT 'free', UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    )
    await queryRunner.query(
      `ALTER TABLE \`subscriptions\` ADD CONSTRAINT \`FK_d0a95ef8a28188364c546eb65c1\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`subscriptions\` DROP FOREIGN KEY \`FK_d0a95ef8a28188364c546eb65c1\``
    )
    await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``)
    await queryRunner.query(`DROP TABLE \`users\``)
    await queryRunner.query(`DROP TABLE \`subscriptions\``)
  }
}
