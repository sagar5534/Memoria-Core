/* eslint-disable @typescript-eslint/no-var-requires */
import { Injectable } from '@nestjs/common';
import { MediaDto } from 'src/models/media.model';
import { join } from 'path';
import { unlink } from 'fs';
const moment = require('moment');
const config = require('config');

@Injectable()
export class MediaService {
  convertPayloadToMedia(
    createMediaDto: any,
    files: Array<Express.Multer.File>,
  ): MediaDto {
    const mediaType = parseInt(createMediaDto.mediaType, 10);
    const mediaSubType = parseInt(createMediaDto.mediaSubType, 10);
    const duration = parseFloat(createMediaDto.duration);
    const isFavorite = this.translateStrToBool(createMediaDto.isFavorite);
    const isHidden = this.translateStrToBool(createMediaDto.isHidden);
    const isLivePhoto = this.translateStrToBool(createMediaDto.isLivePhoto);
    const path = (files as any)[0].path.replace(
      join(config.get('storage.path'), 'media', '/'),
      '',
    );

    let livePhotoPath = '';
    if (isLivePhoto && files.length > 1) {
      livePhotoPath = (files as any)[1].path.replace(
        join(config.get('storage.path'), 'media', '/'),
        '',
      );
    }

    const temp: MediaDto = {
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
      source: createMediaDto.filename,
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
      unlink(file.path, (err) => {
        if (err) return console.error(err);
        console.log('File Deleted', file.path);
      });
    }
  }
}
