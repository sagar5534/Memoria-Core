/* eslint-disable @typescript-eslint/no-var-requires */
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { join, extname, resolve, parse } from 'path';
import { statSync, promises } from 'fs';
import { randomUUID } from 'crypto';
import { MediaDto } from '../../models/media.model';
import { MediaRepository } from '../media/media.repository';
import { ThumbnailService } from '../media/thumbnail.service';
const config = require('config');
const ffprobe = require('ffprobe');
const ffprobeStatic = require('ffprobe-static');
const _ = require('lodash');

@Injectable()
export class ScannerService {
  private ACCEPTED_IMAGE_TYPES = ['.PNG', '.JPG', '.HEIC'];
  private ACCEPTED_VIDEO_TYPES = ['.MOV', '.MP4', 'GIF'];
  private saveLocation = join(config.get('storage.path'), 'media');

  constructor(
    private mediaRepository: MediaRepository,
    private thumbnailService: ThumbnailService,
  ) {
    // this.truncateDB();
    this.runner();
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async runner() {
    const files = await this.getFiles(this.saveLocation);
    console.log('Found', files.length, 'Assets');

    const images = files
      .filter((image) => {
        return this.ACCEPTED_IMAGE_TYPES.includes(extname(image).toUpperCase());
      })
      .map((image) => {
        let livePhoto = null;

        const parsed = parse(image);
        const searchString = join(parsed.dir, parsed.name);

        const absolutePath = join(this.saveLocation, image);
        const imageMTime = statSync(absolutePath).mtime.getTime();

        livePhoto = files.find((v) => {
          const absolutePath = join(this.saveLocation, v);

          return (
            this.ACCEPTED_VIDEO_TYPES.includes(extname(v).toUpperCase()) &&
            v.startsWith(searchString) &&
            statSync(absolutePath).mtime.getTime() === imageMTime
          );
        });

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
        const absolutePath = join(this.saveLocation, image);
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
          .then(() => console.log('Record Created', '--', temp.filename));
      }
    }

    for (const video of videos) {
      const search = await this.mediaRepository.ExistsOneByPath(video);

      if (!search) {
        const absolutePath = join(this.saveLocation, video);
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
    const allMedia: MediaDto[] = await this.mediaRepository.MissingThumbnail();

    console.log('Found', allMedia.length, 'assets with missing thumbnails');

    for (const media of allMedia) {
      media.thumbnail_path = '-';
      this.mediaRepository.update(media._id + '', media);
    }

    const batches = _.chunk(allMedia, 5);
    const results = [];
    while (batches.length) {
      const batch = batches.shift();
      const result = await Promise.all(
        batch.map((media) => this.runQuery(media)),
      );
      results.push(result);
    }
    console.log('Done creating thumbnails');
  }

  async runQuery(media) {
    const absolutePath = join(this.saveLocation, media.path);

    try {
      console.error('Thumbnail Started', '--', media.filename);

      let savePath = await this.thumbnailService.makeThumbnail(
        absolutePath,
        media,
      );

      if (savePath != null) {
        savePath = savePath.replace(
          join(config.get('storage.path'), 'media', '/'),
          '',
        );
        media.thumbnail_path = savePath;
        await this.mediaRepository.update(media._id + '', media);
        console.log(
          'Thumbnail Created & Updated',
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
      console.error('Thumbnail Error: ', '--', absolutePath, '\n', error, '\n');
      media.thumbnail_path = '';
      this.mediaRepository.update(media._id + '', media);
    }
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
