/* eslint-disable @typescript-eslint/no-var-requires */
import { Injectable } from '@nestjs/common';
import { Media } from 'src/models/media.model';
import { join } from 'path';
const moment = require('moment');
const config = require('config');
import * as fs from 'fs';

@Injectable()
export class MediaService {
  convertPayloadToMedia(
    createMediaDto: any,
    files: Array<Express.Multer.File>,
    user: string,
  ): Media {
    const mediaType = parseInt(createMediaDto.mediaType, 10);
    const mediaSubType = parseInt(createMediaDto.mediaSubType, 10);
    const duration = parseFloat(createMediaDto.duration);
    const isFavorite = this.translateStrToBool(createMediaDto.isFavorite);
    const isHidden = this.translateStrToBool(createMediaDto.isHidden);
    const isLivePhoto = this.translateStrToBool(createMediaDto.isLivePhoto);
    const path = (files as any)[0].path.replace(
      join(config.get('storage.path'), 'media'),
      '',
    );

    let livePhotoPath = '';
    if (isLivePhoto && files.length > 1) {
      livePhotoPath = (files as any)[1].path.replace(
        join(config.get('storage.path'), 'media'),
        '',
      );
    }

    const temp: Media = {
      user: user as any,
      assetId: createMediaDto.assetId,
      filename: createMediaDto.filename,
      mediaType,
      mediaSubType,
      creationDate: new Date(moment.unix(createMediaDto.creationDate).toDate()),
      modificationDate: new Date(
        moment.unix(createMediaDto.modificationDate).toDate(),
      ),
      duration,
      isFavorite,
      isHidden,
      isLivePhoto,
      path: path,
      thumbnail_path: '',
      livePhoto_path: livePhotoPath,
    };

    return temp;
  }

  translateStrToBool(str: string): boolean {
    if (!str) {
      return false;
    } else {
      if (str === 'true') {
        return true;
      }
      return false;
    }
  }

  deleteSavedFiles(files: Array<Express.Multer.File>) {
    for (const file of files as any) {
      fs.unlink(file.path, (err) => {
        if (err) return console.log(err);
        console.warn('File Deleted', file.path);
      });
    }
  }
}
