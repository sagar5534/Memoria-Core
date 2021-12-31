import { Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../models/user.model';
import {
  RefreshToken,
  RefreshTokenDocument,
} from '../../models/refresh_token.model';

@Injectable()
export class RefreshTokenRepository {
  constructor(
    @InjectModel(RefreshToken.name)
    private RefreshTokenModel: Model<RefreshTokenDocument>,
  ) {}

  public async createRefreshToken(user: User, ttl: number) {
    const token = new RefreshToken();

    token.user = user;
    token.isRevoked = false;

    const expiration = new Date();
    expiration.setTime(expiration.getTime() + ttl);
    token.expires = expiration;

    return await new this.RefreshTokenModel({
      ...token,
    }).save();
  }

  public async findTokenById(id: string): Promise<RefreshTokenDocument> {
    if (!Types.ObjectId.isValid(id)) {
      return Promise.reject('Error');
    }

    return await this.RefreshTokenModel.findById(id).exec();
  }
}
