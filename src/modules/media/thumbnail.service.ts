/* eslint-disable @typescript-eslint/no-var-requires */
import { Injectable } from '@nestjs/common';
import { readFile } from 'fs';
import { outputFile } from 'fs-extra';
import { Media, MediaDto } from 'src/models/media.model';
import { join, extname } from 'path';
import { randomBytes } from 'crypto';
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
  photo: 1,
  video: 2,
};
@Injectable()
export class ThumbnailService {
  private saveLocation: string;

  constructor() {
    this.saveLocation = join(config.get('storage.path'), 'media', '.thumbs');
  }

  async makeThumbnail(
    fileAbsPath: string,
    mediaDocument: MediaDto,
  ): Promise<string | null> {
    console.log(fileAbsPath, mediaDocument);
    try {
      if (mediaDocument.mediaType == mediaType.video) {
        return await this.videoThumbnail(fileAbsPath, mediaDocument);
      } else {
        return await this.imgThumbnail(fileAbsPath, mediaDocument);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async videoThumbnail(
    fileAbsPath: string,
    mediaDocument: Media,
  ): Promise<string | null> {
    const settings = {
      count: 1,
      folder: this.saveLocation,
      filename: randomBytes(20).toString('hex') + '_thumb.jpg',
    };

    try {
      const res = await this.generate(fileAbsPath, settings);
      return join(this.saveLocation, res.pop());
    } catch (err) {
      return null;
    }
  }

  async generate(fileAbsPath, settings): Promise<string[] | null> {
    // eslint-disable-next-line no-var
    var filenameArray: string[] = [];

    return await new Promise((resolve, reject) => {
      function complete() {
        resolve(filenameArray);
      }

      function filenames(fns) {
        filenameArray = fns;
      }

      ffmpeg(fileAbsPath)
        .on('filenames', filenames)
        .on('end', complete)
        .on('error', reject)
        .screenshots(settings);
    });
  }

  async imgThumbnail(
    fileAbsPath: string,
    mediaDocument: Media,
  ): Promise<string | null> {
    const savePath = join(
      this.saveLocation,
      randomBytes(20).toString('hex') + '_thumb.jpg',
    );

    if (extname(mediaDocument.path.toLowerCase()) == '.heic') {
      const buffer = await promisify(readFile)(fileAbsPath);
      const outputBuffer = await heicConvert({
        buffer: buffer,
        format: 'JPEG',
        quality: 1,
      });
      // const heic = await this.saveThumbnail(outputBuffer, savePath);

      const thumbnail = await sharp(outputBuffer)
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

  saveThumbnail(bufferData: Buffer, savePath: string): Promise<string | null> {
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
