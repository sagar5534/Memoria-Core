/* eslint-disable @typescript-eslint/no-var-requires */
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { join, extname, resolve } from 'path';
import { statSync, promises } from 'fs';
import { randomUUID } from 'crypto';
import { MediaDto } from '../../models/media.model';
import { MediaRepository } from '../media/media.repository';
const config = require('config');

@Injectable()
export class ScannerService {
  private ACCEPTED_IMAGE_TYPES = ['.PNG', '.JPG', '.HEIC'];
  private ACCEPTED_VIDEO_TYPES = ['.MOV', '.MP4', 'GIF'];

  constructor(private mediaRepository: MediaRepository) {
    this.runner();
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async runner() {
    const saveLocation = join(config.get('storage.path'), 'media');

    const files = await this.getFiles(saveLocation);
    console.log('Found', files.length, 'Assets');
    // console.log(files);

    const images = files.filter((image) => {
      return this.ACCEPTED_IMAGE_TYPES.includes(extname(image).toUpperCase());
    });

    const videos = files.filter((video) => {
      return this.ACCEPTED_VIDEO_TYPES.includes(extname(video).toUpperCase());
    });

    images.forEach(async (image) => {
      const absolutePath = join(saveLocation, image);
      const search = await this.mediaRepository.findOneByPath(image);

      if (search == null) {
        let isLivePhoto = false;
        let livePhotoPath = '';

        const fileStats = statSync(absolutePath);
        const dateCreated = fileStats.birthtime;
        const dateLastModified = fileStats.mtime;

        //Find Live Photo
        const searchString = image.replace(/\.[^/.]+$/, '') + '.';
        const livePhoto = videos.find((v) => v.startsWith(searchString));
        if (livePhoto) {
          isLivePhoto = true;
          livePhotoPath = livePhoto;
        }

        const temp: MediaDto = {
          assetId: randomUUID(),
          filename: searchString,
          creationDate: dateCreated,
          modificationDate: dateLastModified,
          isLivePhoto,
          path: image,
          thumbnail_path: '',
          livePhoto_path: livePhotoPath,
        };

        this.mediaRepository.create(temp);

        console.log(temp);
      }

      //1. Check if it exists in the documents
      // IF NOT EXISTS
      //    Find the livePhoto if any
      //      Delete LivePhoto from the array
      //    Create metadata
      //    Add the documents
    });

    videos.forEach((video) => {
      //1. Check if it exists in the documents
      // IF NOT EXISTS
      //      Delete video from the array
      //    Create metadata
      //    Add the documents
    });
  }

  async getFiles(dir, path = '\\') {
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
}
