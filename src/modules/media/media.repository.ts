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

  async findAll(): Promise<Media[]> {
    return await this.MediaModel.find().exec();
  }

  async findOne(id: string): Promise<MediaDocument> {
    if (!Types.ObjectId.isValid(id)) {
      return Promise.reject('Error');
    }

    const x = await this.MediaModel.findById(id).exec();

    return x;
  }

  async findOneByPath(path: string): Promise<MediaDocument> {
    const x = await this.MediaModel.findOne({
      path: path,
    }).exec();

    return x;
  }

  async findAllAssetIds(): Promise<any> {
    const res = await this.MediaModel.find({ assetId: 1 }).exec();
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
