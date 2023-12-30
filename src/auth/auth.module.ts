import { TypeOrmModule } from '@nestjs/typeorm';
import { Logger, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { Refresh } from './entity/refresh.entity';
import { JwtStrategy } from './jwt-strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Refresh]),
    UserModule,
    PassportModule,
    JwtModule.register({
      global: true,
      secret: 'temp secret',
    }),
  ],
  providers: [AuthService, JwtStrategy, Logger],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
