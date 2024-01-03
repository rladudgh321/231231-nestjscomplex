import { ConflictException, BadRequestException } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { hash, compare } from 'bcrypt';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Refresh } from './entity/refresh.entity';
import { User } from 'src/user/entity/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private readonly jwtService: JwtService,
    @InjectRepository(Refresh) private readonly refreshRepository: Repository<Refresh>,
    private readonly dataSource: DataSource,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) new UnauthorizedException('이메일을 찾을 수 없습니다');

    const isMatch = await compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('비밀번호 불일치');

    return user;
  }

  async signup(email: string, password: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    let error = null;

    try {
      const user = await this.userService.findOneByEmail(email);
      if (user) throw new ConflictException('이미 존재하는 이메일주소입니다');

      const salt = 10;
      const hashPassword = await hash(password, salt);
      const userEntity = queryRunner.manager.create(User, { email, password: hashPassword });
      await queryRunner.manager.save(userEntity);

      const accessToken = await this.generateAccessToken(userEntity.id);
      const refreshToken = await this.generateRefreshToken(userEntity.id);
      const refreshEntity = queryRunner.manager.create(Refresh, { user: { id: userEntity.id }, token: refreshToken });
      await queryRunner.manager.save(refreshEntity);

      await queryRunner.commitTransaction();

      return { id: refreshEntity.id, accessToken, refreshToken };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      error = e;
    } finally {
      await queryRunner.release();
      if (error) throw error;
    }
  }

  async signin(email: string, password: string) {
    const user = await this.validateUser(email, password);

    const accessToken = await this.generateAccessToken(user.id);
    const refreshToken = await this.generateRefreshToken(user.id);

    await this.createRefreshtoken(user.id, refreshToken);

    return { id: user.id, accessToken, refreshToken };
  }

  // 리프레시토큰 다시 입력, 디비에 저장
  async refresh(token: string, userId: string) {
    const refreshTokenEntity = await this.refreshRepository.findOneBy({ token });
    if (!refreshTokenEntity) throw new BadRequestException('리프레시토큰으로만 접근 가능');

    const accessToken = await this.generateAccessToken(userId);
    const refreshToken = await this.generateRefreshToken(userId);

    refreshTokenEntity.token = refreshToken;
    await this.refreshRepository.save(refreshTokenEntity);

    return { id: userId, accessToken, refreshToken };
  }

  private async generateAccessToken(userId: string) {
    const payload = { sub: userId, tokenType: 'access' };
    return this.jwtService.sign(payload, { expiresIn: '1d' });
  }

  private async generateRefreshToken(userId: string) {
    const payload = { sub: userId, tokenType: 'refresh' };
    return this.jwtService.sign(payload, { expiresIn: '30d' });
  }

  async createRefreshtoken(userId: string, refreshToken: string) {
    let refreshEntity = await this.refreshRepository.findOneBy({ user: { id: userId } });
    if (refreshEntity) {
      refreshEntity.token = refreshToken;
    } else {
      refreshEntity = await this.refreshRepository.create({ user: { id: userId }, token: refreshToken });
    }
    await this.refreshRepository.save(refreshEntity);
  }
}
