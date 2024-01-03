import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { Query } from '@nestjs/common';
import { PageReqDto } from 'src/common/dto/req.dto';
import { ApiGetItemsResponse, ApiGetResponse } from 'src/common/decorators/swagger.decorator';
import { FindUserReqDto } from './dto/req.dto';
import { FindUserResDto } from './dto/res.dto';
import { PageResDto } from 'src/common/dto/res.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from './enum/role.enum';

@ApiTags('User')
@ApiExtraModels(PageReqDto, PageResDto, FindUserReqDto, FindUserResDto)
@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @ApiGetItemsResponse(FindUserResDto)
  @Roles(Role.Admin)
  @Get()
  async findAll(@Query() { page, size }: PageReqDto): Promise<FindUserResDto[]> {
    const users = await this.userService.findAll(page, size);
    return users.map(({ id, email, createdAt }) => {
      return { id, email, createdAt: createdAt.toISOString() };
    });
  }

  @ApiGetResponse(FindUserResDto)
  @Get(':id')
  findOne(@Param() { id }: FindUserReqDto) {
    return this.userService.findOne(id);
  }
}
