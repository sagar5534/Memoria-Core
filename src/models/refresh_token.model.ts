import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from './user.model';

export type RefreshTokenDocument = RefreshToken & Document;

@Schema()
export class RefreshToken {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;

  @Prop()
  isRevoked: boolean;

  @Prop()
  expires: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
