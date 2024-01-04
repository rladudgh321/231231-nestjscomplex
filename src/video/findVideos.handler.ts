import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindVideosQuery } from './query/find-videos.query';
import { Video } from './entity/video.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
@QueryHandler(FindVideosQuery)
export class FindVideosHandler implements IQueryHandler<FindVideosQuery> {
  constructor(@InjectRepository(Video) private readonly videoRepository: Repository<Video>) {}
  async execute({ page, size }: FindVideosQuery): Promise<any> {
    const videos = await this.videoRepository.find({
      relations: ['user'],
      skip: (page - 1) * size,
      take: size,
    });
    return videos;
  }
}
