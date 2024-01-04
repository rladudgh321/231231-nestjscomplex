import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { VideoService } from './video.service';
import { ApiGetItemsResponse, ApiGetResponse, ApiPostResponse } from 'src/common/decorators/swagger.decorator';
import { CreateVideoResDto, FindVideoResDto } from './dto/res.dto';
import { Body } from '@nestjs/common';
import { CreateVideoReqDto, FindVideoReqDto } from './dto/req.dto';
import { Query } from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/user/enum/role.enum';
import { ThrottlerBehindProxy } from 'src/common/guard/throttler-behind-proxy.guard';
import { PageReqDto } from 'src/common/dto/req.dto';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { User, UserAfterAuth } from 'src/common/decorators/user.decorator';
import { CreateVideoCommand } from './command/create-video.command';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FindVideosQuery } from './query/find-videos.query';

@ApiTags('Video')
@ApiExtraModels(PageReqDto, FindVideoResDto, FindVideoReqDto, CreateVideoResDto)
@UseGuards(ThrottlerBehindProxy)
@Controller('api/videos')
export class VideoController {
  constructor(
    private readonly videoService: VideoService,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiPostResponse(CreateVideoResDto)
  @ApiBearerAuth()
  @Post()
  async upload(@Body() { title, video }: CreateVideoReqDto, @User() user: UserAfterAuth): Promise<CreateVideoResDto> {
    const command = new CreateVideoCommand(user.id, title, 'video/mp4', 'mp4', Buffer.from(''));
    const { id } = await this.commandBus.execute(command);
    return { id, title };
  }

  @ApiGetItemsResponse(FindVideoResDto)
  @ApiBearerAuth()
  @Roles(Role.Admin)
  @SkipThrottle()
  @Get()
  async findAll(@Query() { page, size }: PageReqDto): Promise<FindVideoResDto[]> {
    const query = new FindVideosQuery(page, size);
    const videos = await this.queryBus.execute(query);
    return videos.map(({ id, title, user }) => ({
      id,
      title,
      user: {
        id: user.id,
        email: user.email,
      }
    }))
  }

  @ApiGetResponse(FindVideoResDto)
  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param() { id }: FindVideoReqDto) {
    return this.videoService.findOne(id);
  }

  @ApiBearerAuth()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Get(':id/download')
  async download(@Param() { id }: FindVideoReqDto) {
    return this.videoService.download(id);
  }
}
