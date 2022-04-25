/* eslint-disable @typescript-eslint/no-var-requires */
import { Injectable } from '@nestjs/common';
import { readFile } from 'fs';
import { outputFile } from 'fs-extra';
import { Media, MediaDto } from 'src/models/media.model';
import { join, extname } from 'path';
import ThumbnailGenerator from 'video-thumbnail-generator';
const heicConvert = require('heic-convert');
const { promisify } = require('util');
const config = require('config');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('@ffprobe-installer/ffprobe').path;
const sharp = require('sharp');
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const mediaType = {
  photo: 0,
  video: 1,
};
@Injectable()
export class ThumbnailService {
  private saveLocation: string;

  constructor() {
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
      percent: '50%',
    });

    // return await tg.generateOneByPercent(10);

    return await tg.generateGif({
      fps: 0.75,
      scale: 200,
      speedMultiple: 2,
      deletePalette: true,
    });
  }

  async imgThumbnail(fileAbsPath: string, mediaDocument: Media) {
    const savePath = join(
      this.saveLocation,
      mediaDocument.assetId + '_thumb.jpg',
    );

    if (extname(mediaDocument.path.toLowerCase()) == '.heic') {
      const buffer = await promisify(readFile)(fileAbsPath);
      const outputBuffer = await heicConvert({
        buffer: buffer,
        format: 'JPEG',
        quality: 1,
      });
      const heic = await this.saveThumbnail(outputBuffer, savePath);

      const thumbnail = await sharp(heic)
        .rotate()
        .resize({ width: 300 })
        .toBuffer();
      return await this.saveThumbnail(thumbnail, savePath);
    } else {
      const thumbnail = await sharp(fileAbsPath)
        .rotate()
        .resize({ width: 300 })
        .toBuffer();
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
