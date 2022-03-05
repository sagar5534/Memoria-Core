/* eslint-disable @typescript-eslint/no-var-requires */
import { Injectable } from '@nestjs/common';
import * as imageThumbnail from 'image-thumbnail';
import * as fs from 'fs';
import { Media } from 'src/models/media.model';
import { join } from 'path';
import ThumbnailGenerator from 'video-thumbnail-generator';
const config = require('config');
const ffmpeg = require('fluent-ffmpeg');
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

  async makeThumbnail(inputPath: string, mediaDocument: Media) {
    const savePath = join(
      this.saveLocation,
      mediaDocument.filename + '_thumb.jpg',
    );

    try {
      if (mediaDocument.mediaType === mediaType.video) {
        const tg = new ThumbnailGenerator({
          sourcePath: inputPath,
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
      } else {
        const thumbnail = await imageThumbnail(inputPath, this.imgOptions);
        return this.saveThumbnail(thumbnail, savePath);
      }
    } catch (err) {
      console.error(err);
    }
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
