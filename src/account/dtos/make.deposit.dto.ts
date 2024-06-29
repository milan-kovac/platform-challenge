import { ApiProperty } from '@nestjs/swagger';
import { Min } from 'class-validator';

export class MakeDepositDto {
  @ApiProperty({ required: true, type: Number })
  @Min(1, { message: 'Please provide valid amount value (minimum is 1).' })
  amount: number;
}
