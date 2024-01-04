import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from './entity/video.entity';
import { FindVideoResDto } from './dto/res.dto';
import { join } from 'path';
import { ReadStream, createReadStream } from 'fs';
import { stat } from 'fs/promises';

@Injectable()
export class VideoService {
  constructor(@InjectRepository(Video) private videoRepository: Repository<Video>) {}

  async findOne(id: string) {
    const video = await this.videoRepository.findOne({
      relations: ['user'],
      where: { id },
    });

    if (!video) throw new NotFoundException('no video');

    return video;
  }

  async download(id: string): Promise<{ stream: ReadStream; mimetype: string; size: number }> {
    const video = await this.videoRepository.findOneBy({ id });
    if (!video) throw new NotFoundException('no video');

    await this.videoRepository.update({ id }, { downloadCnt: () => 'download_cnt + 1' });

    const { mimetype } = video;
    const extension = mimetype.split('/')[1];
    const filePath = join(process.cwd(), 'video-storage', `${id}.${extension}`);
    const { size } = await stat(filePath);
    const stream = createReadStream(filePath);

    return { stream, mimetype, size };
  }
}
