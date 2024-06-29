import { Controller, Body, Param, ParseUUIDPipe, Patch, UseInterceptors, Post, Get } from '@nestjs/common';
import { AccountService } from './account.service';
import { MakeDepositDto } from './dtos/make.deposit.dto';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MakeWithdrawalDto } from './dtos/make.withdrawal,dto';
import { TransactionInterceptor } from '../shared/interceptors/transaction.interceptor';
import { MakeTransferDto } from './dtos/make.transfer.dto';
import { CreateGenericResponse } from '../shared/responses/create.response';

@ApiTags('Accounts')
@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @ApiOperation({
    summary: 'Make deposit.',
  })
  @ApiBody({ type: MakeDepositDto })
  @Patch(':id/deposit')
  @UseInterceptors(TransactionInterceptor)
  async makeDeposit(@Body() makeDepositRequest: MakeDepositDto, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    const account = await this.accountService.makeDeposit(id, makeDepositRequest);
    return CreateGenericResponse(account);
  }

  @ApiOperation({
    summary: 'Make withdrawal.',
  })
  @ApiBody({ type: MakeWithdrawalDto })
  @Patch(':id/withdrawal')
  @UseInterceptors(TransactionInterceptor)
  async makeWithdrawal(@Body() makeWithdrawalRequest: MakeWithdrawalDto, @Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    const account = await this.accountService.makeWithdrawal(id, makeWithdrawalRequest);
    return CreateGenericResponse(account);
  }

  @ApiOperation({
    summary: 'Make transfer.',
  })
  @ApiBody({ type: MakeTransferDto })
  @Post('transfer')
  @UseInterceptors(TransactionInterceptor)
  async makeTransfer(@Body() makeTransferRequest: MakeTransferDto) {
    await this.accountService.makeTransfer(makeTransferRequest);
    return CreateGenericResponse(true);
  }

  @ApiOperation({
    summary: 'Refund transaction.',
  })
  @Post(':id/refund')
  @UseInterceptors(TransactionInterceptor)
  async refundTransaction(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    await this.accountService.refundLastTransaction(id);
    return CreateGenericResponse(true);
  }

  @ApiOperation({
    summary: 'Get account balance.',
  })
  @Get(':id/balance')
  async getBalance(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    const account = await this.accountService.getBalance(id);
    return CreateGenericResponse(account);
  }

  @ApiOperation({
    summary: 'Get all transactions.',
  })
  @Get(':id/transactions')
  async getTransactions(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    const transactions = await this.accountService.getTransactions(id);
    return CreateGenericResponse(transactions);
  }
}
