import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { VideoService } from 'src/video/video.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly videoService: VideoService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleEmailCron() {
    Logger.log('Email task called');
    const videos = await this.videoService.findTop5Download();
  }
}
