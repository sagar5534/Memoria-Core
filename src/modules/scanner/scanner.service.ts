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
const ffprobe = require('ffprobe');
const ffprobeStatic = require('ffprobe-static');
@Injectable()
export class ScannerService {
  private ACCEPTED_IMAGE_TYPES = ['.PNG', '.JPG', '.HEIC'];
  private ACCEPTED_VIDEO_TYPES = ['.MOV', '.MP4', 'GIF'];

  constructor(
    private mediaRepository: MediaRepository,
    private thumbnailService: ThumbnailService,
  ) {
    // this.truncateDB();
    this.runner();
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async runner() {
    const saveLocation = join(config.get('storage.path'), 'media');

    const files = await this.getFiles(saveLocation);
    console.log('Found', files.length, 'Assets');

    const images = files
      .filter((image) => {
        return this.ACCEPTED_IMAGE_TYPES.includes(extname(image).toUpperCase());
      })
      .map((image) => {
        let livePhoto = null;

        if (extname(image).toUpperCase() != '.PNG') {
          const searchString = image
            .replace(/\.[^/.]+$/, '')
            .replace(/ *\([^)]*\) */g, '');
          const absolutePath = join(saveLocation, image);
          const imageMTime = statSync(absolutePath).mtime.getTime();

          livePhoto = files.find((v) => {
            const absolutePath = join(saveLocation, v);

            return (
              this.ACCEPTED_VIDEO_TYPES.includes(extname(v).toUpperCase()) &&
              v.startsWith(searchString) &&
              statSync(absolutePath).mtime.getTime() === imageMTime
            );
          });
        }

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

    this.missingThumbnailGenerator();
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

  // @Cron(CronExpression.EVERY_5_MINUTES)
  async missingThumbnailGenerator() {
    const saveLocation = join(config.get('storage.path'), 'media');

    const allMedia: MediaDto[] = (await this.mediaRepository.findAll()).filter(
      (media) => {
        return !media.thumbnail_path || media.thumbnail_path.length === 0;
      },
    );

    console.log('Found', allMedia.length, 'assets with missing thumbnails');

    for (const media of allMedia) {
      media.thumbnail_path = '-';
      this.mediaRepository.update(media._id + '', media);
    }

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
            join(config.get('storage.path'), 'media', '/'),
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
          media.thumbnail_path = '';
          this.mediaRepository.update(media._id + '', media);
        }
      } catch (error) {
        console.error('Thumbnail Error: ', '--', absolutePath, '\n', error);
        media.thumbnail_path = '';
        this.mediaRepository.update(media._id + '', media);
      }
    }

    console.log('Done creating thumbnails');
  }

  async truncateDB() {
    const allMedia: MediaDto[] = await this.mediaRepository.findAll();

    for (const media of allMedia) {
      media.thumbnail_path = '-';
      this.mediaRepository.delete(media._id + '');
    }

    console.log('Truncated');
  }
}
