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
  Req,
} from '@nestjs/common';
import { MediaDto } from '../../models/media.model';
import { MediaRepository } from './media.repository';
import { ThumbnailService } from './thumbnail.service';
import { MediaService } from './media.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editDestination, editFileName } from './upload.utils';
import { Response } from 'express';

@Controller('media')
export class MediaController {
  constructor(
    private mediaRepository: MediaRepository,
    private thumbnailService: ThumbnailService,
    private mediaService: MediaService,
  ) {}

  @Post()
  create(@Body() createMediaDto: MediaDto, @Req() request) {
    try {
      const userId = request.user.id;

      const temp = {
        ...createMediaDto,
        user: userId,
      };

      return this.mediaRepository.create(temp);
    } catch (error) {
      return error;
    }
  }

  @Get()
  findAll(@Req() request) {
    const userId = request.user.id;
    return this.mediaRepository.findAll(userId);
  }

  @Get('assets')
  findAssetIds(@Req() request) {
    const userId = request.user.id;
    return this.mediaRepository.findAllAssetIds(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() request) {
    try {
      const userId = request.user.id;
      return this.mediaRepository.findOne(id, userId);
    } catch (error) {
      return;
    }
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateMediaDto: MediaDto,
    @Req() request,
  ) {
    try {
      const userId = request.user.id;
      return this.mediaRepository.update(id, updateMediaDto, userId);
    } catch (error) {
      return;
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() request) {
    try {
      const userId = request.user.id;
      return this.mediaRepository.delete(id, userId);
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
    @Req() request,
  ) {
    if (!files) return;
    if (!createMediaDto.assetId) return;

    const userId = request.user.id;
    const media = this.mediaService.convertPayloadToMedia(
      createMediaDto,
      files,
    );

    try {
      for (const file of files as any) {
        console.log('File Uploaded', '--', media.filename, '--', file.path);
      }

      const saved = await this.mediaRepository.create(media);
      console.log('Record Created', '--', media.filename);
      res.status(HttpStatus.OK).send();

      this.thumbnailService
        .makeThumbnail((files as any)[0].path, media)
        .then((savePath) => {
          // TODO: Find a better solution to update a record
          media.thumbnail_path = savePath as string;
          this.mediaRepository.update(saved.id, media, userId);
        })
        .then(() => console.log('Thumbnail Updated', '--', media.filename))
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
