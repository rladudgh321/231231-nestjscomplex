import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class CreateVideoReqDto {
  @ApiProperty({ required: true })
  @IsString()
  title: string;

  @ApiProperty({ required: true, type: 'string', format: 'binary' })
  video: any;
}

export class FindVideoReqDto {
  @ApiProperty({ required: true })
  @IsUUID()
  id: string;
}
