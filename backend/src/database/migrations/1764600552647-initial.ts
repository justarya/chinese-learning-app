import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1764600552647 implements MigrationInterface {
    name = 'Initial1764600552647'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "chat_messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "session_id" uuid NOT NULL, "user_id" uuid NOT NULL, "role" character varying(20) NOT NULL, "content" text NOT NULL, "has_grammar_error" boolean NOT NULL DEFAULT false, "grammar_correction" text, "grammar_tips" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_40c55ee0e571e268b0d3cd37d10" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_34bfc66e62161622b54ac9af4a" ON "chat_messages" ("session_id", "created_at") `);
        await queryRunner.query(`CREATE TABLE "chat_sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "title" character varying, "scenario" character varying, "vocabulary_ids" json, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_efc151a4aafa9a28b73dedc485f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_711ae6baf3859414a31a102b75" ON "chat_sessions" ("user_id", "created_at") `);
        await queryRunner.query(`CREATE TABLE "study_sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "session_type" character varying(50) NOT NULL, "score" integer, "total" integer, "duration_seconds" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_529b2be328c0a953f9bf0cf988e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_328385b018319de43492b1b90a" ON "study_sessions" ("user_id", "created_at") `);
        await queryRunner.query(`CREATE TABLE "flashcard_reviews" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "vocabulary_id" uuid NOT NULL, "reviewed_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ffa29d4d8860422b91e887565a3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f5632c72dfdce478a68fafde19" ON "flashcard_reviews" ("vocabulary_id", "reviewed_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_75a85e839faba321018142db48" ON "flashcard_reviews" ("user_id", "reviewed_at") `);
        await queryRunner.query(`CREATE TABLE "import_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "original_text" text NOT NULL, "items_imported" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_18a2e880c124ce5283b6ca6fc98" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "google_id" character varying NOT NULL, "email" character varying NOT NULL, "name" character varying, "picture" character varying(500), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_0bd5012aeb82628e07f6a1be53b" UNIQUE ("google_id"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "vocabulary" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "chinese" character varying NOT NULL, "pinyin" character varying NOT NULL, "english" character varying NOT NULL, "example" text, "studied_count" integer NOT NULL DEFAULT '0', "last_studied_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_65dbd74f76cee79778299a2a21b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1f3fb9582a04e0cf128f1ea421" ON "vocabulary" ("user_id", "created_at") `);
        await queryRunner.query(`CREATE TABLE "vocabulary_explanations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "vocabulary_id" uuid NOT NULL, "user_id" uuid NOT NULL, "explanation" text NOT NULL, "chat_history" json, "view_count" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_20234e7e8d237e7fc29c84f803a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_eff2b83d5c07b6ba6f2ff31139" ON "vocabulary_explanations" ("vocabulary_id", "user_id") `);
        await queryRunner.query(`CREATE TABLE "translation_sentences" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "mode" character varying(20) NOT NULL, "english_sentence" text NOT NULL, "chinese_sentence" text NOT NULL, "vocabulary_used" json NOT NULL, "practice_count" integer NOT NULL DEFAULT '0', "correct_count" integer NOT NULL DEFAULT '0', "difficulty" text, "last_answer_correct" boolean, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_edd7c96738fea235e251b8df762" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4e9b379760225c5300114ffa10" ON "translation_sentences" ("user_id", "mode") `);
        await queryRunner.query(`ALTER TABLE "chat_messages" ADD CONSTRAINT "FK_0672782561e44d43febcfba2984" FOREIGN KEY ("session_id") REFERENCES "chat_sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_messages" ADD CONSTRAINT "FK_5588b6cea298cedec7063c0d33e" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_sessions" ADD CONSTRAINT "FK_1fa209cf48ae975a109366542a5" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "study_sessions" ADD CONSTRAINT "FK_5ea09953d6fd1462a931a596e23" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "flashcard_reviews" ADD CONSTRAINT "FK_18cdc9f74dbdc8aad02db4513f4" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "flashcard_reviews" ADD CONSTRAINT "FK_32ec868c92254268de5c5c8c155" FOREIGN KEY ("vocabulary_id") REFERENCES "vocabulary"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "import_history" ADD CONSTRAINT "FK_9471210b030f34ed9893b5ee1eb" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vocabulary" ADD CONSTRAINT "FK_0820235ecc44ac66b18507abaa6" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vocabulary_explanations" ADD CONSTRAINT "FK_3a69c91093290a803df31aea08e" FOREIGN KEY ("vocabulary_id") REFERENCES "vocabulary"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vocabulary_explanations" ADD CONSTRAINT "FK_7c526f3e54356ecd7503a2ea076" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "translation_sentences" ADD CONSTRAINT "FK_934633f741231727d02564a34b1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "translation_sentences" DROP CONSTRAINT "FK_934633f741231727d02564a34b1"`);
        await queryRunner.query(`ALTER TABLE "vocabulary_explanations" DROP CONSTRAINT "FK_7c526f3e54356ecd7503a2ea076"`);
        await queryRunner.query(`ALTER TABLE "vocabulary_explanations" DROP CONSTRAINT "FK_3a69c91093290a803df31aea08e"`);
        await queryRunner.query(`ALTER TABLE "vocabulary" DROP CONSTRAINT "FK_0820235ecc44ac66b18507abaa6"`);
        await queryRunner.query(`ALTER TABLE "import_history" DROP CONSTRAINT "FK_9471210b030f34ed9893b5ee1eb"`);
        await queryRunner.query(`ALTER TABLE "flashcard_reviews" DROP CONSTRAINT "FK_32ec868c92254268de5c5c8c155"`);
        await queryRunner.query(`ALTER TABLE "flashcard_reviews" DROP CONSTRAINT "FK_18cdc9f74dbdc8aad02db4513f4"`);
        await queryRunner.query(`ALTER TABLE "study_sessions" DROP CONSTRAINT "FK_5ea09953d6fd1462a931a596e23"`);
        await queryRunner.query(`ALTER TABLE "chat_sessions" DROP CONSTRAINT "FK_1fa209cf48ae975a109366542a5"`);
        await queryRunner.query(`ALTER TABLE "chat_messages" DROP CONSTRAINT "FK_5588b6cea298cedec7063c0d33e"`);
        await queryRunner.query(`ALTER TABLE "chat_messages" DROP CONSTRAINT "FK_0672782561e44d43febcfba2984"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4e9b379760225c5300114ffa10"`);
        await queryRunner.query(`DROP TABLE "translation_sentences"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_eff2b83d5c07b6ba6f2ff31139"`);
        await queryRunner.query(`DROP TABLE "vocabulary_explanations"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1f3fb9582a04e0cf128f1ea421"`);
        await queryRunner.query(`DROP TABLE "vocabulary"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "import_history"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_75a85e839faba321018142db48"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f5632c72dfdce478a68fafde19"`);
        await queryRunner.query(`DROP TABLE "flashcard_reviews"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_328385b018319de43492b1b90a"`);
        await queryRunner.query(`DROP TABLE "study_sessions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_711ae6baf3859414a31a102b75"`);
        await queryRunner.query(`DROP TABLE "chat_sessions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_34bfc66e62161622b54ac9af4a"`);
        await queryRunner.query(`DROP TABLE "chat_messages"`);
    }

}
