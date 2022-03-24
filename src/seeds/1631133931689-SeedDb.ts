import {MigrationInterface, QueryRunner} from "typeorm";

export class SeedDb1631133931689 implements MigrationInterface {
    name = 'SeedDb1631133931689'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`INSERT INTO \`mediumclone\`.\`tags\` (\`name\`) VALUES ('NestJS'), ('Coffee'), ('Angular'), ('React'), ('Vue'), ('Javascript'), ('Typescript'), ('NodeJS'), ('PHP'), ('Laravel'), ('Java')`);

        // Password is password
        await queryRunner.query(`INSERT INTO \`mediumclone\`.\`users\` (\`username\`, \`email\`, \`password\`) VALUES
            ('fadi', 'fadi@gmail.com', '$2b$10$czmuRSgK8ZaOQ5VW4drX3u47/dM2GORDM4ZQ/Ga3QcHrlCyFCe/62'),
            ('mac', 'mac@gmail.com', '$2b$10$czmuRSgK8ZaOQ5VW4drX3u47/dM2GORDM4ZQ/Ga3QcHrlCyFCe/62');
        `);

        await queryRunner.query(`INSERT INTO \`mediumclone\`.\`articles\` (\`slug\`, \`title\`, \`description\`, \`body\`, \`tagList\`, \`authorId\`) VALUES
            ('first-article', 'First Article', 'First article description', 'First article body', 'Angular,Typescript', 1),
            ('second-article', 'Second Article', 'Second article description', 'Second article body', 'React,Javascript', 1),
            ('third-article', 'Third Article', 'Third article description', 'Third article body', 'React,Javascript', 2);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}
}
