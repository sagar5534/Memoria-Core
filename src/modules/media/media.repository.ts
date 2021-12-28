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

  async findAll(user: string): Promise<Media[]> {
    return await this.MediaModel.find({ user }).exec();
  }

  async findOne(id: string, user: string): Promise<MediaDocument> {
    if (!Types.ObjectId.isValid(id)) {
      return Promise.reject('Error');
    }

    const x = await this.MediaModel.findById(id).exec();

    return (x.user as any) === user ? x : null;
  }

  async findAllAssetIds(user: string): Promise<any> {
    if (!Types.ObjectId.isValid(user)) {
      return Promise.reject('Error');
    }
    const res = await this.MediaModel.find({ user }, { assetId: 1 }).exec();
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

  async update(
    id: string,
    newMedia: Media,
    user: string,
  ): Promise<MediaDocument> {
    if (!Types.ObjectId.isValid(id)) {
      return Promise.reject('Error');
    }

    if (newMedia.user && (newMedia.user as any) != user) return;

    return await this.MediaModel.findOneAndUpdate(
      { user, id },
      newMedia,
    ).exec();
  }

  async delete(id: string, user: string): Promise<Media> {
    if (!Types.ObjectId.isValid(id)) {
      return Promise.reject('Error');
    }

    return await this.MediaModel.findOneAndDelete({ user, id }).exec();
  }
}
