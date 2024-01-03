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

@ApiTags('Video')
@ApiExtraModels(PageReqDto, FindVideoResDto, FindVideoReqDto, CreateVideoResDto)
@UseGuards(ThrottlerBehindProxy)
@Controller('api/videos')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @ApiPostResponse(CreateVideoResDto)
  @ApiBearerAuth()
  @Post()
  upload(@Body() { title, video }: CreateVideoReqDto) {
    return this.videoService.create();
  }

  @ApiGetItemsResponse(FindVideoResDto)
  @ApiBearerAuth()
  @Roles(Role.Admin)
  @SkipThrottle()
  @Get()
  findAll(@Query() { page, size }: PageReqDto) {
    return this.videoService.findAll();
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
