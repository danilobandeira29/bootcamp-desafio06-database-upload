import csvParse from 'csv-parse';
import fs from 'fs';
import { getCustomRepository, getRepository, In } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface CSVTransction {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute(path: string): Promise<Transaction[]> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    const readCSVStream = fs.createReadStream(path);

    const parseStream = csvParse({
      from_line: 2,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const transactions: CSVTransction[] = [];
    const categories: string[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value) return;

      categories.push(category);

      transactions.push({ title, type, value, category });
    });

    await new Promise(resolve => parseCSV.on('end', resolve));

    const existsCategories = await categoriesRepository.find({
      where: { title: In(categories) },
    });

    const existentsCategoriesTitles = existsCategories.map(
      category => category.title,
    );

    const filterCategories = categories
      .filter(category => !existentsCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoriesRepository.create(
      filterCategories.map(title => ({ title })),
    );

    await categoriesRepository.save(newCategories);

    const finalCategories = [...newCategories, ...existsCategories];

    const createTransactions = transactionsRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(category =>
          category.title === transaction.category ? category.title : null,
        ),
      })),
    );

    await transactionsRepository.save(createTransactions);

    await fs.promises.unlink(path);

    return createTransactions;
  }
}

export default ImportTransactionsService;
