import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from '../../transaction/transactio.service';
import { AccountService } from '../account.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Account } from '../account.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { MockTransactionService } from './mocks/mock.transaction.service';
import { MockAccountRepository } from './mocks/mock.account.repository';
import { ConfigModule } from '@nestjs/config';
import { makeDepositAccountStub } from './stub/account.stub';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AccountService', () => {
  let service: AccountService;
  let transactionService: TransactionService;
  let accountRepository: Repository<Account>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        AccountService,
        {
          provide: TransactionService,
          useClass: MockTransactionService,
        },
        {
          provide: getRepositoryToken(Account),
          useClass: MockAccountRepository,
        },
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
    transactionService = module.get<TransactionService>(TransactionService);
    accountRepository = module.get<Repository<Account>>(getRepositoryToken(Account));
  });

  describe('makeDeposit', () => {
    const id = '528464eb-ef81-4a91-8aaa-1844388631b5';
    const makeDepositRequest = { amount: 100 };
    it('should be called with the appropriate parameters', async () => {
      const spy = jest.spyOn(service, 'makeDeposit');
      await service.makeDeposit(id, makeDepositRequest);
      expect(spy).toHaveBeenCalledWith(id, makeDepositRequest);
    });

    it('should return successful response ', async () => {
      const result = await service.makeDeposit(id, makeDepositRequest);
      expect(result).toEqual(makeDepositAccountStub);
    });

    it('should throw NotFoundException if account not found', async () => {
      jest.spyOn(accountRepository, 'createQueryBuilder').mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({
          affected: 0,
          raw: [],
        }),
      } as unknown as SelectQueryBuilder<Account>);

      try {
        await service.makeDeposit(id, makeDepositRequest);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('makeWithdrawal', () => {
    const id = '528464eb-ef81-4a91-8aaa-1844388631b5';
    const makeWithdrawaRequest = { amount: 50 };
    it('should be called with the appropriate parameters', async () => {
      const spy = jest.spyOn(service, 'makeWithdrawal');
      await service.makeWithdrawal(id, makeWithdrawaRequest);
      expect(spy).toHaveBeenCalledWith(id, makeWithdrawaRequest);
    });

    it('should return successful response ', async () => {
      const withdrawAccount = { ...makeDepositAccountStub, balance: makeDepositAccountStub.balance - makeWithdrawaRequest.amount };
      jest.spyOn(accountRepository, 'createQueryBuilder').mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({
          affected: 1,
          raw: [withdrawAccount],
        }),
      } as unknown as SelectQueryBuilder<Account>);
      const result = await service.makeWithdrawal(id, makeWithdrawaRequest);
      expect(result).toEqual(withdrawAccount);
    });

    it('should throw NotFoundException if account not found', async () => {
      jest.spyOn(accountRepository, 'createQueryBuilder').mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({
          affected: 0,
          raw: [],
        }),
      } as unknown as SelectQueryBuilder<Account>);

      try {
        await service.makeDeposit(id, makeWithdrawaRequest);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('getBalance', () => {
    const id = '528464eb-ef81-4a91-8aaa-1844388631b5';
    it('should be called with the appropriate parameters', async () => {
      const spy = jest.spyOn(service, 'getBalance');
      await service.getBalance(id);
      expect(spy).toHaveBeenCalledWith(id);
    });

    it('should return successful response ', async () => {
      jest.spyOn(accountRepository, 'findOne').mockResolvedValueOnce({ balance: 100 } as Account);
      const result = await service.getBalance(id);
      expect(result).toEqual({ balance: 100 });
    });

    it('should throw NotFoundException if account not found', async () => {
      jest.spyOn(accountRepository, 'findOne').mockResolvedValueOnce(null);
      try {
        await service.getBalance(id);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });
  });
});
