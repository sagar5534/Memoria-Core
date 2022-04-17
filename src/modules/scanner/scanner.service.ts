/* eslint-disable @typescript-eslint/no-var-requires */
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { join, extname, resolve } from 'path';
import { statSync, promises } from 'fs';
import { randomUUID } from 'crypto';
import { MediaDto } from '../../models/media.model';
import { MediaRepository } from '../media/media.repository';
import { ThumbnailService } from '../media/thumbnail.service';
const config = require('config');

@Injectable()
export class ScannerService {
  private ACCEPTED_IMAGE_TYPES = ['.PNG', '.JPG', '.HEIC'];
  private ACCEPTED_VIDEO_TYPES = ['.MOV', '.MP4', 'GIF'];

  constructor(
    private mediaRepository: MediaRepository,
    private thumbnailService: ThumbnailService,
  ) {
    // this.runner();
    this.garbageCollector();
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async runner() {
    const saveLocation = join(config.get('storage.path'), 'media');

    const files = await this.getFiles(saveLocation);
    console.log('Found', files.length, 'Assets');

    const images = files
      .filter((image) => {
        return this.ACCEPTED_IMAGE_TYPES.includes(extname(image).toUpperCase());
      })
      .map((image) => {
        const searchString = image.replace(/\.[^/.]+$/, '') + '.';
        const livePhoto = files.find(
          (v) =>
            v.startsWith(searchString) &&
            this.ACCEPTED_VIDEO_TYPES.includes(extname(v).toUpperCase()),
        );
        return { image, livePhoto };
      });

    const videos = files.filter((video) => {
      return (
        this.ACCEPTED_VIDEO_TYPES.includes(extname(video).toUpperCase()) &&
        images.find((v) => v.livePhoto == video) == null
      );
    });

    for (const res of images) {
      const { image, livePhoto } = res;
      const search = await this.mediaRepository.ExistsOneByPath(image);

      if (!search) {
        const absolutePath = join(saveLocation, image);
        const filename = image.replace(/\.[^/.]+$/, '');
        const fileStats = statSync(absolutePath);
        const dateCreated = fileStats.birthtime;
        const dateLastModified = fileStats.mtime;

        const temp: MediaDto = {
          assetId: randomUUID(),
          filename: filename,
          creationDate: dateCreated,
          modificationDate: dateLastModified,
          isLivePhoto: livePhoto != null,
          path: image,
          thumbnail_path: '',
          livePhoto_path: livePhoto ?? '',
          mediaType: 0,
          source: 'LOCAL',
        };

        this.mediaRepository
          .create(temp)
          .then((res) => console.log('Record Created', '--', temp.filename));
      }
    }

    for (const video of videos) {
      const search = await this.mediaRepository.ExistsOneByPath(video);

      if (!search) {
        const absolutePath = join(saveLocation, video);
        const filename = video.replace(/\.[^/.]+$/, '');
        const fileStats = statSync(absolutePath);
        const dateCreated = fileStats.birthtime;
        const dateLastModified = fileStats.mtime;

        const info = await ffprobe(absolutePath, { path: ffprobeStatic.path });
        const duration = info.streams[0].duration;

        const temp: MediaDto = {
          assetId: randomUUID(),
          filename,
          creationDate: dateCreated,
          modificationDate: dateLastModified,
          path: video,
          thumbnail_path: '',
          livePhoto_path: '',
          duration,
          mediaType: 1,
          source: 'LOCAL',
        };

        this.mediaRepository
          .create(temp)
          .then(() => console.log('Record Created', '--', temp.filename));
      }
    }
  }

  private async getFiles(dir, path = '') {
    if (dir.includes('.thumbs')) {
      return [];
    }

    const dirents = await promises.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      dirents.map((dirent) => {
        const res = join(path, dirent.name);

        return dirent.isDirectory()
          ? this.getFiles(resolve(dir, dirent.name), res)
          : res;
      }),
    );
    return Array.prototype.concat(...files).filter((dirent) => {
      const x = extname(dirent).toUpperCase();
      return (
        this.ACCEPTED_IMAGE_TYPES.includes(x) ||
        this.ACCEPTED_VIDEO_TYPES.includes(x)
      );
    });
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async garbageCollector() {
    const saveLocation = join(config.get('storage.path'), 'media');

    const allMedia: MediaDto[] = (await this.mediaRepository.findAll()).filter(
      (media) => {
        return !media.thumbnail_path || media.thumbnail_path.length === 0;
      },
    );

    console.log('Found', allMedia.length, 'assets with missing thumbnails');

    for (const media of allMedia) {
      const absolutePath = join(saveLocation, media.path);

      try {
        console.error('Thumbnail Started', '--', media.filename);

        let savePath = await this.thumbnailService.makeThumbnail(
          absolutePath,
          media,
        );
        console.log('Thumbnail Created', '--', media.filename);

        if (savePath != null) {
          savePath = savePath.replace(
            join(config.get('storage.path'), 'media', '\\'),
            '',
          );
          media.thumbnail_path = savePath;
          this.mediaRepository.update(media._id + '', media);
          console.log(
            'Thumbnail DB Updated',
            '--',
            media.filename,
            media.thumbnail_path,
          );
        } else {
          console.error('Thumbnail Skipped', '--', media.filename);
        }
      } catch (error) {
        console.error('Thumbnail Error: ', '--', absolutePath, '\n', error);
      }
    }

    console.log('Done creating thumbnails');
  }
}
