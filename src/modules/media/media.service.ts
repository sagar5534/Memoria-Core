import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { Media } from 'src/models/media.model';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const moment = require('moment');
import * as fs from 'fs';

@Injectable()
export class MediaService {
  convertPayloadToMedia(
    createMediaDto: any,
    files: Array<Express.Multer.File>,
  ): Media {
    const mediaType = parseInt(createMediaDto.mediaType, 10);
    const mediaSubType = parseInt(createMediaDto.mediaSubType, 10);
    const duration = parseFloat(createMediaDto.duration);
    const isFavorite = this.translateStrToBool(createMediaDto.isFavorite);
    const isHidden = this.translateStrToBool(createMediaDto.isHidden);
    const isLivePhoto = this.translateStrToBool(createMediaDto.isLivePhoto);
    let livePhotoPath = '';

    if (isLivePhoto && files.length > 1) {
      livePhotoPath = (files as any)[1].path;
    }

    const temp: Media = {
      user: new Types.ObjectId(createMediaDto.user) as any,
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
      path: (files as any)[0].path,
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
