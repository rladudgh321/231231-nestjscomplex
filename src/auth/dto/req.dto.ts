import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class SignupReqDto {
  @ApiProperty({ required: true, example: 'kyh@naver.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ required: true, example: 'Password1!' })
  password: string;

  @ApiProperty({ required: true, example: 'Password1!' })
  passwordConfirm: string;
}

export class SigninReqDto {
  @ApiProperty({ required: true, example: 'kyh@naver.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ required: true, example: 'Password1!' })
  password: string;
}
