import { Controller, Request, Post, UseGuards, Body, BadRequestException } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorator/public.decorator';
import { ApiPostResponse } from 'src/common/decorator/swagger.decorator';
import { SignupResDto } from './dto/res.dto';
import { SignupReqDto } from './dto/req.dto';

@ApiTags('Auth')
@ApiExtraModels(SignupResDto)
@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @ApiPostResponse(SignupResDto)
  @Post('signup')
  async signup(@Body() { email, password, passwordConfirm }: SignupReqDto): Promise<SignupResDto> {
    if (password !== passwordConfirm) throw new BadRequestException('Password and PasswordConfirm is not matched.');
    const { id } = await this.authService.signup(email, password);
    return { id };
  }

  @Public()
  @ApiPostResponse(SignupResDto)
  @UseGuards(LocalAuthGuard)
  @Post('signin')
  async signin(@Request() req) {
    return this.authService.signin(req.user);
  }
}
