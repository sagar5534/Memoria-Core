import { UserModel, User } from "../models/user.model";
import { Types } from "mongoose";
export class UserService {
  async findAll(): Promise<User[]> {
    return await UserModel.find().exec();
  }

  async findOne(id: string): Promise<User> {
    if (!Types.ObjectId.isValid(id)) {
      return Promise.reject("Error")
    }

    const res = await UserModel.findById(id).exec();
    if (res) return res;
    return Promise.reject("Not found")
  }

  async create(newUser: User): Promise<User> {
    return await new UserModel({
      ...newUser,
    }).save();
  }

  async update(id: string, newUser: User): Promise<User> {
    if (!Types.ObjectId.isValid(id)) {
      return Promise.reject("Error")
    }

    const res = await UserModel.findByIdAndUpdate(id, newUser).exec();
    if (res) return res;
    return Promise.reject("Cannot Update")
  }

  async delete(id: string): Promise<User> {
    if (!Types.ObjectId.isValid(id)) {
      return Promise.reject("Error")
    }

    const res = await UserModel.findByIdAndDelete(id).exec();
    if (res) return res;
    return Promise.reject("Cannot Delete")
  }
}
