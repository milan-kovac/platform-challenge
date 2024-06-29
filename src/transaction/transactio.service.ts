import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from './transaction.entity';
import { Repository } from 'typeorm';
import { CreateTransaction } from '../shared/types/create.transaction.type';
import { LogMethod } from '../shared/decorators/log.method.decorator';
import { TransactionType } from '../shared/enums/transaction.type.enum';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  @LogMethod()
  async createTransaction(transactionDetails: CreateTransaction): Promise<void> {
    await this.transactionRepository.insert(transactionDetails);
  }

  @LogMethod()
  async createTransactionsForTransfer(fromAccount: string, toAccount: string, amount: number): Promise<void> {
    const [fromTransaction, toTransaction] = await this.transactionRepository.save([
      { amount, type: TransactionType.TRANSFER_OUT, account: { id: fromAccount } },
      { amount, type: TransactionType.TRANSFER_IN, account: { id: toAccount } },
    ]);

    fromTransaction.relatedTransaction = toTransaction;
    toTransaction.relatedTransaction = fromTransaction;

    await this.transactionRepository.save([fromTransaction, toTransaction]);
  }

  @LogMethod()
  async getLastTransaction(accountId: string): Promise<Transaction> {
    return await this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.account_id = :accountId', { accountId })
      .andWhere('transaction.type IN (:...types)', {
        types: [TransactionType.TRANSFER_IN, TransactionType.TRANSFER_OUT],
      })
      .leftJoinAndSelect('transaction.account', 'account')
      .leftJoinAndSelect('transaction.relatedTransaction', 'relatedTransaction')
      .leftJoinAndSelect('relatedTransaction.account', 'relatedAccount')
      .orderBy('transaction.createdAt', 'DESC')
      .getOne();
  }

  @LogMethod()
  async changeTransactionToRefund(id: string): Promise<void> {
    await this.transactionRepository
      .createQueryBuilder()
      .update(Transaction)
      .set({ type: TransactionType.REFUND })
      .where('id = :id OR id = (SELECT "related_transaction_id" FROM transaction WHERE id = :id)', { id })
      .execute();
  }

  @LogMethod()
  async getAccountTransactions(accountId: string): Promise<Transaction[]> {
    return await this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoin('transaction.account', 'account')
      .where('account.id = :accountId', { accountId })
      .getMany();
  }
}
