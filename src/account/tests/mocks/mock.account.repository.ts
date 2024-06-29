import { makeDepositAccountStub } from '../stub/account.stub';

export const MockAccountRepository = jest.fn().mockReturnValue({
  createQueryBuilder: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    returning: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue({ affected: 1, raw: [makeDepositAccountStub] }),
  })),
  findOne: jest.fn().mockReturnThis(),
});
