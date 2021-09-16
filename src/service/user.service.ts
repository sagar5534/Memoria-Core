import { UserModel, User } from "../models/user.model";
export class UserService {
  async findAll(): Promise<User[]> {
    return await UserModel.find().exec();
  }

  async findOne(id: string): Promise<User> {
    return await UserModel.findById(id).exec();
  }

  async create(newUser: User): Promise<User> {
    return await new UserModel({
      ...newUser,
    }).save();
  }

  async update(id: string, newUser: User): Promise<User> {
    return await UserModel.findByIdAndUpdate(id, newUser).exec();
  }

  async delete(id: string): Promise<User> {
    return await UserModel.findByIdAndDelete(id).exec();
  }
}
