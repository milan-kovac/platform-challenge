import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './account.entity';
import { MakeDepositDto } from './dtos/make.deposit.dto';
import { TransactionService } from '../transaction/transactio.service';
import { TransactionType } from '../shared/enums/transaction.type.enum';
import { LogMethod } from '../shared/decorators/log.method.decorator';
import { MakeTransferDto } from './dtos/make.transfer.dto';
import { Transaction } from '../transaction/transaction.entity';
import { MakeWithdrawalDto } from './dtos/make.withdrawal,dto';

@Injectable()
export class AccountService {
  constructor(
    private readonly transsactionService: TransactionService,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  @LogMethod()
  async makeDeposit(id: string, makeDepositRequest: MakeDepositDto): Promise<Account> {
    const { amount } = makeDepositRequest;
    const updateResult = await this.accountRepository
      .createQueryBuilder()
      .update(Account)
      .set({ balance: () => `balance + ${amount}` })
      .where('id = :id', { id })
      .returning('*')
      .execute();

    if (updateResult.affected === 0) {
      throw new NotFoundException('Account not found.');
    }

    const account = updateResult.raw[0] as Account;

    await this.transsactionService.createTransaction({ amount, type: TransactionType.DEPOSIT, account });
    return account;
  }

  @LogMethod()
  async makeWithdrawal(id: string, makeWithdrawaRequest: MakeWithdrawalDto): Promise<Account> {
    const { amount } = makeWithdrawaRequest;
    const updateResult = await this.accountRepository
      .createQueryBuilder()
      .update(Account)
      .set({ balance: () => `CASE WHEN balance >= ${amount} THEN balance - ${amount} ELSE balance END` })
      .where('id = :id', { id })
      .andWhere('balance >= :amount', { amount })
      .returning('*')
      .execute();

    if (updateResult.affected === 0) {
      throw new NotFoundException('Account not found or insufficient funds.');
    }

    const account = updateResult.raw[0] as Account;

    await this.transsactionService.createTransaction({ amount, type: TransactionType.WITHDRAWAL, account });

    return account;
  }

  @LogMethod()
  async makeTransfer(makeTransferRequest: MakeTransferDto): Promise<void> {
    const { amount, fromAccount, toAccount } = makeTransferRequest;
    const updateResult = await this.accountRepository
      .createQueryBuilder()
      .update(Account)
      .set({
        balance: () => `CASE 
        WHEN id = :fromAccount AND balance >= :amount THEN balance - :amount
        WHEN id = :toAccount AND EXISTS (SELECT 1 FROM Account WHERE id = :fromAccount AND balance >= :amount) THEN balance + :amount
        ELSE balance
      END`,
      })
      .setParameters({ fromAccount, toAccount, amount })
      .where('id IN (:fromAccount, :toAccount)', { fromAccount, toAccount })
      .andWhere('(id = :fromAccount AND balance >= :amount) OR id = :toAccount')
      .returning('*')
      .execute();

    if (updateResult.affected === 0) {
      throw new NotFoundException('Accounts not found.');
    }

    if (updateResult.affected === 1) {
      throw new BadRequestException('Insufficient funds in the account for the transfer.');
    }

    await this.transsactionService.createTransactionsForTransfer(fromAccount, toAccount, amount);
  }

  @LogMethod()
  async refundLastTransaction(id: string): Promise<void> {
    const transaction = await this.transsactionService.getLastTransaction(id);

    if (!transaction) {
      throw new BadRequestException('Transaction for that account not found.');
    }

    const { amount, type, relatedTransaction } = transaction;
    const fromAccountId = type === TransactionType.TRANSFER_OUT ? transaction.account.id : relatedTransaction.account.id;
    const toAccountId = type === TransactionType.TRANSFER_IN ? transaction.account.id : relatedTransaction.account.id;

    if (transaction.type === TransactionType.TRANSFER_OUT || transaction.type === TransactionType.TRANSFER_IN) {
      await this.accountRepository
        .createQueryBuilder()
        .update(Account)
        .set({
          balance: () => `CASE 
          WHEN id = :fromAccountId THEN balance + :amount
          WHEN id = :toAccountId THEN balance - :amount
          ELSE balance
        END`,
        })
        .setParameters({ fromAccountId, toAccountId, amount })
        .where('id IN (:fromAccountId, :toAccountId)', { fromAccountId, toAccountId })
        .execute();

      await this.transsactionService.changeTransactionToRefund(transaction.id);
    }
  }

  @LogMethod()
  async getBalance(id: string): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: { id },
      select: ['balance'],
    });

    if (!account) {
      throw new BadRequestException('Wrong account id.');
    }

    return account;
  }

  @LogMethod()
  async getTransactions(id: string): Promise<Transaction[]> {
    const transactions = await this.transsactionService.getAccountTransactions(id);

    if (!transactions.length) {
      throw new BadRequestException('Wrong account id.');
    }

    return transactions;
  }
}
