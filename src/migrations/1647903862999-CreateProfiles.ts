import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateProfiles1647903862999 implements MigrationInterface {
    name = 'CreateProfiles1647903862999'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`mediumclone\`.\`profiles\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`mediumclone\`.\`profiles\``);
    }

}
