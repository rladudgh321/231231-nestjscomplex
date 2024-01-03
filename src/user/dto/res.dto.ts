import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FindUserResDto {
  @ApiProperty({ required: true })
  id: string;

  @ApiProperty({ required: true })
  email: string;

  @ApiProperty({ required: true })
  createdAt: string;

  @ApiPropertyOptional({ required: true })
  role?: string;
}
