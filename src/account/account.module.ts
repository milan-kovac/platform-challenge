import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './account.entity';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { TransactionModule } from '../transaction/transaction.modile';

@Module({
  imports: [TypeOrmModule.forFeature([Account]), TransactionModule],
  providers: [AccountService],
  controllers: [AccountController],
})
export class AccountModule {}
