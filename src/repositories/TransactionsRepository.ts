import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactionRepository = await this.find();

    const income = transactionRepository
      .filter(transaction => {
        if (transaction.type === 'income') return transaction;

        return false;
      })
      .reduce((total, trans) => total + trans.value, 0);

    const outcome = transactionRepository
      .filter(transaction => {
        if (transaction.type === 'outcome') return transaction;

        return false;
      })
      .reduce((total, trans) => total + trans.value, 0);

    const total = income - outcome;

    return { income, outcome, total };
  }
}

export default TransactionsRepository;
