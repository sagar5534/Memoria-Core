/* eslint-disable @typescript-eslint/no-var-requires */
import { Injectable } from '@nestjs/common';
import { readFile } from 'fs';
import { outputFile } from 'fs-extra';
import { Media, MediaDto } from 'src/models/media.model';
import { join, extname } from 'path';
import * as imageThumbnail from 'image-thumbnail';
import ThumbnailGenerator from 'video-thumbnail-generator';
const heicConvert = require('heic-convert');
const { promisify } = require('util');
const config = require('config');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('@ffprobe-installer/ffprobe').path;
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const mediaType = {
  photo: 0,
  video: 1,
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

  async makeThumbnail(fileAbsPath: string, mediaDocument: MediaDto) {
    try {
      if (mediaDocument.mediaType == mediaType.video) {
        return await this.videoThumbnail(fileAbsPath);
      } else {
        return await this.imgThumbnail(fileAbsPath, mediaDocument);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async videoThumbnail(fileAbsPath: string) {
    const tg = new ThumbnailGenerator({
      sourcePath: fileAbsPath,
      thumbnailPath: this.saveLocation,
      tmpDir: this.saveLocation,
      percent: '25%',
    });

    // return await tg.generateOneByPercent(10);

    return await tg.generateGif({
      fps: 0.75,
      scale: 180,
      speedMultiple: 4,
      deletePalette: true,
    });
  }

  async imgThumbnail(fileAbsPath: string, mediaDocument: Media) {
    const savePath = join(
      this.saveLocation,
      mediaDocument.filename + '_thumb.jpg',
    );

    if (extname(mediaDocument.path.toLowerCase()) == '.heic') {
      const buffer = await promisify(readFile)(fileAbsPath);
      const outputBuffer = await heicConvert({
        buffer: buffer, // the HEIC file buffer
        format: 'JPEG', // output format
        quality: 1, // the jpeg compression quality, between 0 and 1
      });
      return await this.saveThumbnail(outputBuffer, savePath);

      // return imageThumbnail(hiec, this.imgOptions).then((thumbnail) => {
      //   console.log('Saving thumbnail --', mediaDocument.filename);
      //   return this.saveThumbnail(thumbnail, savePath);
      // });
    } else {
      const thumbnail = await imageThumbnail(fileAbsPath, this.imgOptions);
      return await this.saveThumbnail(thumbnail, savePath);
    }
  }

  saveThumbnail(bufferData: Buffer, savePath: string) {
    return new Promise((resolve, reject) => {
      outputFile(savePath, bufferData, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(savePath);
        }
      });
    });
  }
}
