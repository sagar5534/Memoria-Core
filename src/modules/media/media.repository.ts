import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Media, MediaDocument } from '../../models/media.model';
import { Types } from 'mongoose';

@Injectable()
export class MediaRepository {
  constructor(
    @InjectModel(Media.name) private MediaModel: Model<MediaDocument>,
  ) {}

  async findAll(): Promise<MediaDocument[]> {
    return await this.MediaModel.find().sort({ modificationDate: -1 }).exec();
  }

  async findOne(id: string): Promise<MediaDocument> {
    if (!Types.ObjectId.isValid(id)) {
      return Promise.reject('Error');
    }

    const x = await this.MediaModel.findById(id).exec();

    return x;
  }

  async ExistsOneByPath(path: string): Promise<MediaDocument> {
    return await this.MediaModel.findOne({
      path: path,
    }).exec();
  }

  async MissingThumbnail(): Promise<MediaDocument[]> {
    return await this.MediaModel.find({ thumbnail_path: '' })
      .sort({ modificationDate: -1, mediaType: 1 })
      .exec();
  }

  async findAllAssetIds(): Promise<any> {
    const res = await this.MediaModel.find()
      .sort({ modificationDate: -1 })
      .exec();
    if (res) {
      return res.map((asset) => {
        return asset.assetId;
      });
    } else {
      return Promise.reject('Not found');
    }
  }

  async create(newMedia: Media) {
    return await new this.MediaModel({
      ...newMedia,
    }).save();
  }

  async update(id: string, newMedia: Media): Promise<MediaDocument> {
    if (!Types.ObjectId.isValid(id)) {
      return Promise.reject('Error');
    }
    return await this.MediaModel.findByIdAndUpdate(id, newMedia).exec();
  }

  async delete(id: string): Promise<Media> {
    if (!Types.ObjectId.isValid(id)) {
      return Promise.reject('Error');
    }
    return await this.MediaModel.findByIdAndDelete(id).exec();
  }
}
