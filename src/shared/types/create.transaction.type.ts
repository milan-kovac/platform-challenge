import { Account } from 'src/account/account.entity';
import { TransactionType } from '../enums/transaction.type.enum';

export type CreateTransaction = {
  account: Account;
  amount: number;
  type: TransactionType;
};
