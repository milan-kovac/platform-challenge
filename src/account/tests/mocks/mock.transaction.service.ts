export const MockTransactionService = jest.fn().mockReturnValue({
  createTransaction: jest.fn().mockReturnThis(),
});
