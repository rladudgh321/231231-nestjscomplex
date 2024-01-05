import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { VideoModule } from 'src/video/video.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [VideoModule, ScheduleModule.forRoot()],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
