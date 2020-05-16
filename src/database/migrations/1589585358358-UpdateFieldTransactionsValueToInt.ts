import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export default class UpdateFieldTransactionsValueToInt1589585358358
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('transactions', 'value');

    await queryRunner.addColumn(
      'transactions',
      new TableColumn({
        name: 'value',
        type: 'int',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('transactions', 'value');

    await queryRunner.addColumn(
      'transactions',
      new TableColumn({
        name: 'value',
        type: 'decimal',
        precision: 10,
        scale: 2,
      }),
    );
  }
}
