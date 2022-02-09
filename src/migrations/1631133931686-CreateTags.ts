import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateTags1631133931686 implements MigrationInterface {
    name = 'CreateTags1631133931686'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`mediumclone\`.\`tags\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`mediumclone\`.\`tags\``);
    }

}
