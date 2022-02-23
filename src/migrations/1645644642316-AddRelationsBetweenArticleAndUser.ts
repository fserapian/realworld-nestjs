import {MigrationInterface, QueryRunner} from "typeorm";

export class AddRelationsBetweenArticleAndUser1645644642316 implements MigrationInterface {
    name = 'AddRelationsBetweenArticleAndUser1645644642316'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`mediumclone\`.\`articles\` ADD \`authorId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`mediumclone\`.\`articles\` ADD CONSTRAINT \`FK_65d9ccc1b02f4d904e90bd76a34\` FOREIGN KEY (\`authorId\`) REFERENCES \`mediumclone\`.\`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`mediumclone\`.\`articles\` DROP FOREIGN KEY \`FK_65d9ccc1b02f4d904e90bd76a34\``);
        await queryRunner.query(`ALTER TABLE \`mediumclone\`.\`articles\` DROP COLUMN \`authorId\``);
    }

}
