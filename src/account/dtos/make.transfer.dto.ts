import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, Min } from 'class-validator';

export class MakeTransferDto {
  @ApiProperty({ required: true, type: String })
  @IsUUID(4, { message: 'Please provide valid fromAccount value.' })
  fromAccount: string;

  @ApiProperty({ required: true, type: String })
  @IsUUID(4, { message: 'Please provide valid fromAccount toAccount.' })
  toAccount: string;

  @ApiProperty({ required: true, type: Number })
  @Min(1, { message: 'Please provide valid amount value (minimum is 1).' })
  amount: number;
}
