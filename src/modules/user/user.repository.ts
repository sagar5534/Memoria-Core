import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../models/user.model';
import { Types } from 'mongoose';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private UserModel: Model<UserDocument>) {}

  async findAll(): Promise<User[]> {
    return await this.UserModel.find().exec();
  }

  async findOne(id: string): Promise<User> {
    if (!Types.ObjectId.isValid(id)) {
      return Promise.reject('Error');
    }

    const res = await this.UserModel.findById(id).exec();
    if (res) return res;
    return Promise.reject('Not found');
  }

  async create(newUser: User): Promise<User> {
    return await new this.UserModel({
      ...newUser,
    }).save();
  }

  async update(id: string, newUser: User): Promise<User> {
    if (!Types.ObjectId.isValid(id)) {
      return Promise.reject('Error');
    }

    const res = await this.UserModel.findByIdAndUpdate(id, newUser).exec();
    if (res) return res;
    return Promise.reject('Cannot Update');
  }

  async delete(id: string): Promise<User> {
    if (!Types.ObjectId.isValid(id)) {
      return Promise.reject('Error');
    }

    const res = await this.UserModel.findByIdAndDelete(id).exec();
    if (res) return res;
    return Promise.reject('Cannot Delete');
  }
}
