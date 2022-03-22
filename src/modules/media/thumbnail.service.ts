/* eslint-disable @typescript-eslint/no-var-requires */
import { Injectable } from '@nestjs/common';
import * as imageThumbnail from 'image-thumbnail';
import * as fs from 'fs';
import { Media } from 'src/models/media.model';
import { join } from 'path';
import ThumbnailGenerator from 'video-thumbnail-generator';
const config = require('config');
const ffmpeg = require('fluent-ffmpeg');
const heicConvert = require('heic-convert');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('@ffprobe-installer/ffprobe').path;

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const mediaType = {
  photo: 1,
  video: 2,
};

@Injectable()
export class ThumbnailService {
  private saveLocation: string;
  private imgOptions: any;

  constructor() {
    this.imgOptions = {
      percentage: 25,
      withMetadata: true,
      responseType: 'buffer',
      jpegOptions: { force: true, quality: 100 },
    };
    this.saveLocation = join(config.get('storage.path'), 'media', '.thumbs');
  }

  async makeThumbnail(files: Array<Express.Multer.File>, mediaDocument: Media) {
    try {
      console.log(mediaDocument);

      if (mediaDocument.mediaType == mediaType.video) {
        return this.videoThumbnail(files[0], mediaDocument);
      } else {
        return this.imgThumbnail(files[0], mediaDocument);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async videoThumbnail(file: Express.Multer.File, mediaDocument: Media) {
    const tg = new ThumbnailGenerator({
      sourcePath: file.path,
      thumbnailPath: this.saveLocation,
      tmpDir: this.saveLocation,
      percent: '25%',
    });

    return await tg.generateGif({
      fps: 0.75,
      scale: 180,
      speedMultiple: 4,
      deletePalette: true,
    });
  }

  async imgThumbnail(file: Express.Multer.File, mediaDocument: Media) {
    const savePath = join(
      this.saveLocation,
      mediaDocument.filename + '_thumb.jpg',
    );

    // Dealing with an heic
    if (mediaDocument.path.toLowerCase().includes('.heic')) {
      file = await heicConvert({
        buffer: fs.readFileSync(file.path),
        format: 'JPEG',
        quality: 1,
      });

      const thumbnail = await imageThumbnail(file, this.imgOptions);
      return this.saveThumbnail(thumbnail, savePath);
    }

    const thumbnail = await imageThumbnail(file.path, this.imgOptions);
    return this.saveThumbnail(thumbnail, savePath);
  }

  saveThumbnail(bufferData: Buffer, savePath: string) {
    return new Promise((resolve, reject) => {
      fs.writeFile(savePath, bufferData, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(savePath);
        }
      });
    });
  }
}
