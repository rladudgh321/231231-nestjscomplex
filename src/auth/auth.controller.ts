import { Controller, Post, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { ApiPostResponse } from 'src/common/decorators/swagger.decorator';
import { Body } from '@nestjs/common';
import { SigninReqDto, SignupReqDto } from './dto/req.dto';
import { UnauthorizedException } from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';
import { RefreshTokenResDto } from './dto/res.dto';
import { User, UserAfterAuth } from 'src/common/decorators/user.decorator';

@ApiTags('Auth')
@ApiExtraModels(RefreshTokenResDto)
@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiPostResponse(SignupReqDto)
  @Public()
  @Post('signup')
  async signup(@Body() { email, password, passwordConfirm }: SignupReqDto) {
    if (password !== passwordConfirm) throw new UnauthorizedException('비밀번호가 일치하지 않습니다');
    return this.authService.signup(email, password);
  }

  @ApiPostResponse(SigninReqDto)
  @Public()
  @Post('signin')
  async signin(@Body() { email, password }: SigninReqDto) {
    return this.authService.signin(email, password);
  }

  @ApiPostResponse(RefreshTokenResDto)
  @ApiBearerAuth()
  @Post('refresh')
  async refresh(@Headers('authorization') authorization, @User() user: UserAfterAuth ) {
    const token = /Bearer\s(.+)/.exec(authorization)[1];
    const { id, accessToken, refreshToken } = await this.authService.refresh(token, user.id);
    return { id, accessToken, refreshToken };
  }
}
