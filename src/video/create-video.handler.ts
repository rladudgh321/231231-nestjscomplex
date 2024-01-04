import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Video } from './entity/video.entity';
import { Injectable } from '@nestjs/common';
import { CreateVideoCommand } from './command/create-video.command';
import { DataSource } from 'typeorm';
import { User } from 'src/user/entity/user.entity';
import { VideoCreatedEvent } from './evnet/video-created.event';

@Injectable()
@CommandHandler(CreateVideoCommand)
export class CreateVideoHandler implements ICommandHandler<CreateVideoCommand> {
  constructor(private readonly dataSource: DataSource, private readonly eventBus: EventBus) {}
  async execute(command: CreateVideoCommand): Promise<Video> {
    const { userId, title, mimetype, extension, buffer } = command;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    let error = null;

    try {
      const user = await queryRunner.manager.findOneBy(User, { id: userId });
      const video = await queryRunner.manager.save(queryRunner.manager.create(Video, { title, mimetype, user }));
      await this.uploadVideo(video.id, extension, buffer);
      await queryRunner.commitTransaction();
      await this.eventBus.publish(new VideoCreatedEvent(video.id));
      return video;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      error = e;
    } finally {
      await queryRunner.release();
      if (error) throw error;
    }
  }

  private async uploadVideo(id: string, extension: string, buffer: Buffer) {
    console.log('upload video');
  }
}
