import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Res,
  UploadedFiles,
  UseInterceptors,
  HttpStatus,
} from '@nestjs/common';
import { MediaDto } from '../../models/media.model';
import { MediaRepository } from './media.repository';
import { ThumbnailService } from './thumbnail.service';
import { MediaService } from './media.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editDestination, editFileName } from './upload.utils';
import { Response } from 'express';
import { join } from 'path';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require('config');

@Controller('media')
export class MediaController {
  constructor(
    private mediaRepository: MediaRepository,
    private thumbnailService: ThumbnailService,
    private mediaService: MediaService,
  ) {}

  @Post()
  create(@Body() createMediaDto: MediaDto) {
    try {
      const temp = {
        ...createMediaDto,
      };

      return this.mediaRepository.create(temp);
    } catch (error) {
      return error;
    }
  }

  @Get()
  findAll() {
    return this.mediaRepository.findAll();
  }

  @Get('rsrc/:file')
  findResource(@Param('file') file: string, @Res() res) {
    //TODO: This only allows 1 level - Shouldnt be necess. just yet
    return res.sendFile(join(config.get('storage.path'), 'media', file));
  }

  @Get('thumb/:file')
  findThumb(@Param('file') file: string, @Res() res) {
    return res.sendFile(
      join(config.get('storage.path'), 'media', '.thumbs', file),
    );
  }

  @Get('assets')
  findAssetIds() {
    return this.mediaRepository.findAllAssetIds();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    try {
      return this.mediaRepository.findOne(id);
    } catch (error) {
      return;
    }
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateMediaDto: MediaDto) {
    try {
      return this.mediaRepository.update(id, updateMediaDto);
    } catch (error) {
      return;
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    try {
      return this.mediaRepository.delete(id);
    } catch (error) {
      return;
    }
  }

  @Post('upload')
  @UseInterceptors(
    FilesInterceptor('files', null, {
      storage: diskStorage({
        destination: editDestination,
        filename: editFileName,
      } as any),
    }),
  )
  async upload(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() createMediaDto: any,
    @Res() res: Response,
  ) {
    if (!files) return;
    if (!createMediaDto.assetId) return;

    const media = this.mediaService.convertPayloadToMedia(
      createMediaDto,
      files,
    );

    try {
      //Save to mongodb
      const saved = await this.mediaRepository.create(media);
      console.log('Record Created', '--', media.filename);

      //Upload completed
      res.status(HttpStatus.OK).send();

      //Make Thumbnail
      this.thumbnailService
        .makeThumbnail(files, media)
        .then((savePath) => {
          if (savePath != null) {
            savePath = (savePath as string).replace(
              join(config.get('storage.path'), 'media'),
              '',
            );
            media.thumbnail_path = savePath;
            this.mediaRepository.update(saved.id, media);
            console.log('Thumbnail Updated', '--', media.filename);
          } else {
            console.log('Thumbnail Skipped', '--', media.filename);
          }
        })
        .catch((error) => {
          console.log('Thumbnail Error: ', '--', error);
        });
    } catch (error) {
      console.error('File Upload Error', '--', error);
      this.mediaService.deleteSavedFiles(files);
      return;
    }
  }
}
