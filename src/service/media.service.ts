import { MediaModel, Media } from "../models/media.model";

export class MediaService {
  async findAll(): Promise<Media[]> {
    return await MediaModel.find().sort("-creation_date").exec();
  }

  async findOne(id: string): Promise<Media> {
    return await MediaModel.findById(id).exec();
  }

  async create(newMedia: Media): Promise<Media> {
    return await new MediaModel({
      ...newMedia,
    }).save();
  }

  async update(id: string, newUser: Media): Promise<Media> {
    return await MediaModel.findByIdAndUpdate(id, newUser).exec();
  }

  async delete(id: string): Promise<Media> {
    return await MediaModel.findByIdAndDelete(id).exec();
  }
}
