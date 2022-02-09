import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateUsers1631133942288 implements MigrationInterface {
    name = 'CreateUsers1631133942288'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`mediumclone\`.\`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`username\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`bio\` varchar(255) NOT NULL DEFAULT '', \`image\` varchar(255) NOT NULL DEFAULT '', \`password\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_fe0bb3f6520ee0469504521e71\` (\`username\`), UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`mediumclone\`.\`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_fe0bb3f6520ee0469504521e71\` ON \`mediumclone\`.\`users\``);
        await queryRunner.query(`DROP TABLE \`mediumclone\`.\`users\``);
    }

}
