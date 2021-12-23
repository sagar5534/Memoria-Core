import { Injectable } from '@nestjs/common';
import * as imageThumbnail from 'image-thumbnail';
import * as fs from 'fs';
import * as path from 'path';
import { Media } from 'src/models/media.model';

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
    this.saveLocation = 'public/thumbs';
  }

  async makeThumbnail(inputPath: string, mediaDocument: Media) {
    const savePath = path.join(
      this.saveLocation,
      mediaDocument.filename + '_thumb.jpg',
    );

    try {
      const thumbnail = await imageThumbnail(inputPath, this.imgOptions);
      return this.saveThumbnail(thumbnail, savePath);
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
