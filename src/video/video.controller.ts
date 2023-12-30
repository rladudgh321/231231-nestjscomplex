import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { VideoService } from './video.service';
import { ApiGetItemsResponse, ApiGetResponse, ApiPostResponse } from 'src/common/decorators/swagger.decorator';
import { CreateVideoResDto, FindVideoResDto } from './dto/res.dto';
import { Body } from '@nestjs/common';
import { CreateVideoReqDto, FindVideoReqDto } from './dto/req.dto';
import { Query } from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/user/enum/role.enum';

@ApiTags('Video')
@ApiExtraModels(FindVideoResDto, FindVideoReqDto, CreateVideoResDto)
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
  @Get()
  findAll(@Query() { id }: FindVideoReqDto) {
    return this.videoService.findAll();
  }

  @ApiGetResponse(FindVideoResDto)
  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param() { id }: FindVideoReqDto) {
    return this.videoService.findOne(id);
  }

  @ApiBearerAuth()
  @Get(':id/download')
  async download(@Param() { id }: FindVideoReqDto) {
    return this.videoService.download(id);
  }
}
