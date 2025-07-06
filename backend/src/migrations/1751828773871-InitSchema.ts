import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1751828773871 implements MigrationInterface {
    name = 'InitSchema1751828773871'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "comments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" text NOT NULL, "authorId" uuid NOT NULL, "parentId" uuid, "isDeleted" boolean NOT NULL DEFAULT false, "deletedAt" TIMESTAMP, "isEdited" boolean NOT NULL DEFAULT false, "editedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_94ffa05f2fb3da114904ba901b" ON "comments" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_4548cc4a409b8651ec75f70e28" ON "comments" ("authorId") `);
        await queryRunner.query(`CREATE INDEX "IDX_8770bd9030a3d13c5f79a7d2e8" ON "comments" ("parentId") `);
        await queryRunner.query(`CREATE TYPE "public"."notifications_type_enum" AS ENUM('comment_reply', 'comment_mention')`);
        await queryRunner.query(`CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "type" "public"."notifications_type_enum" NOT NULL, "title" character varying NOT NULL, "message" text NOT NULL, "isRead" boolean NOT NULL DEFAULT false, "commentId" uuid, "triggeredByUserId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_831a5a06f879fb0bebf8965871" ON "notifications" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_5340fc241f57310d243e5ab20b" ON "notifications" ("userId", "isRead") `);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "avatarUrl" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_fe0bb3f6520ee0469504521e71" ON "users" ("username") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_4548cc4a409b8651ec75f70e280" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_8770bd9030a3d13c5f79a7d2e81" FOREIGN KEY ("parentId") REFERENCES "comments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_692a909ee0fa9383e7859f9b406" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_9faba56a12931cf4e38f9dddb49" FOREIGN KEY ("commentId") REFERENCES "comments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_0a70ca4c02439704e33062f91c1" FOREIGN KEY ("triggeredByUserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_0a70ca4c02439704e33062f91c1"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_9faba56a12931cf4e38f9dddb49"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_692a909ee0fa9383e7859f9b406"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_8770bd9030a3d13c5f79a7d2e81"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_4548cc4a409b8651ec75f70e280"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fe0bb3f6520ee0469504521e71"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5340fc241f57310d243e5ab20b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_831a5a06f879fb0bebf8965871"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8770bd9030a3d13c5f79a7d2e8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4548cc4a409b8651ec75f70e28"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_94ffa05f2fb3da114904ba901b"`);
        await queryRunner.query(`DROP TABLE "comments"`);
    }

}
