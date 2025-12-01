import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddLastAnswerCorrectToTranslationSentence1733063000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'translation_sentences',
      new TableColumn({
        name: 'last_answer_correct',
        type: 'boolean',
        isNullable: true,
        default: null,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('translation_sentences', 'last_answer_correct');
  }
}
