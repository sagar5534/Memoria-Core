import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../models/user.model';
import { Types } from 'mongoose';
import { hash } from 'bcrypt';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private UserModel: Model<UserDocument>) {}

  async findAll(): Promise<User[]> {
    return await this.UserModel.find().exec();
  }

  async findById(id: string): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(id)) {
      return Promise.reject('Error');
    }

    return await this.UserModel.findById(id).exec();
  }

  async findByUsername(username: string): Promise<UserDocument> {
    return await this.UserModel.findOne({
      username: username.toLowerCase(),
    }).exec();
  }

  async create(newUser: User): Promise<UserDocument> {
    const temp = new User();
    temp.username = newUser.username;
    temp.password = await hash(newUser.password, 10);

    return await new this.UserModel({
      ...temp,
    }).save();
  }

  async update(id: string, newUser: User): Promise<User> {
    if (!Types.ObjectId.isValid(id)) {
      return Promise.reject('Error');
    }

    return await this.UserModel.findByIdAndUpdate(id, newUser).exec();
  }

  async delete(id: string): Promise<User> {
    if (!Types.ObjectId.isValid(id)) {
      return Promise.reject('Error');
    }

    return await this.UserModel.findByIdAndDelete(id).exec();
  }
}
