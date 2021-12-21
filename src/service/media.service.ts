import { MediaModel, Media } from "../models/media.model";
import { Types } from "mongoose";

export class MediaService {
  async findAll(): Promise<Media[]> {
    return await MediaModel.find().sort("-creation_date").exec();
  }

  async findOne(id: string): Promise<Media> {
    if (!Types.ObjectId.isValid(id)) {
      return Promise.reject("Error")
    }
    const res = await MediaModel.findById(id).exec();
    if (res) return res;
    return Promise.reject("Not found")
  }

  async findAllAssetIds(user: string): Promise<any> {
    if (!Types.ObjectId.isValid(user)) {
      return Promise.reject("Errornn")
    }
    const res = await MediaModel.find( { user }, {assetId: 1} ).exec();
    if (res) {
      return res.map( (asset) => {
        return asset.assetId
      });
    } else {
      return Promise.reject("Not found")
    }
  }


  async create(newMedia: Media): Promise<Media> {
    return await new MediaModel({
      ...newMedia,
    }).save();
  }

  async update(id: string, newMedia: Media): Promise<Media> {
    if (!Types.ObjectId.isValid(id)) {
      return Promise.reject("Error")
    }
    const res = await MediaModel.findByIdAndUpdate(id, newMedia).exec();
    if (res) return res;
    return Promise.reject("Cannot Update")
  }

  async delete(id: string): Promise<Media> {
    if (!Types.ObjectId.isValid(id)) {
      return Promise.reject("Error")
    }
    const res = await MediaModel.findByIdAndDelete(id).exec();
    if (res) return res;
    return Promise.reject("Cannot Delete")
  }

  translateStrToBool(str: string): boolean {
    if (!str) {
      return false
    } else {
      if (str === 'true') {
        return true
      }
      return false
    }
  }
}
