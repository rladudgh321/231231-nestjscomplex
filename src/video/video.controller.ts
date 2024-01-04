import {
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiExtraModels, ApiTags } from '@nestjs/swagger';
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
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

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
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('video'))
  @Post()
  async upload(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'mp4',
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
    @Body() { title }: CreateVideoReqDto,
    @User() user: UserAfterAuth,
  ): Promise<CreateVideoResDto> {
    const { originalname, buffer, mimetype } = file;
    const extension = originalname.split('.')[1];
    const command = new CreateVideoCommand(user.id, title, mimetype, extension, buffer);
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
      },
    }));
  }

  @ApiGetResponse(FindVideoResDto)
  @ApiBearerAuth()
  @Get(':id')
  async findOne(@Param() { id }: FindVideoReqDto): Promise<FindVideoResDto> {
    const { title, user } = await this.videoService.findOne(id);
    return {
      id,
      title,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  @ApiBearerAuth()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Get(':id/download')
  async download(@Param() { id }: FindVideoReqDto, @Res({ passthrough: true }) res: Response) {
    const { stream, mimetype, size } = await this.videoService.download(id);
    res.set({
      'Content-Length': size,
      'Content-Type': mimetype,
      'Content-Disposition': 'attachment;',
    });
    return new StreamableFile(stream);
  }
}
