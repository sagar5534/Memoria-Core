import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from './user.model';

export type MediaDocument = Media & Document;

@Schema()
export class Media {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;

  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  assetId: string;

  @Prop()
  mediaType: number;

  @Prop()
  mediaSubType: number;

  @Prop({ required: true })
  creationDate: Date;

  @Prop()
  modificationDate: Date;

  @Prop()
  duration: number;

  @Prop({ default: false })
  isFavorite: boolean;

  @Prop({ default: false })
  isHidden: boolean;

  @Prop({ default: false })
  isLivePhoto: boolean;

  @Prop({ required: true })
  path: string;

  @Prop()
  thumbnail_path: string;

  @Prop()
  livePhoto_path: string;
}

export class MediaDto {
  readonly user: User;
  readonly assetId: string;
  readonly filename: string;
  readonly mediaType: number;
  readonly mediaSubType: number;
  readonly creationDate: Date;
  readonly modificationDate: Date;
  readonly duration: number;
  readonly isFavorite: boolean;
  readonly isHidden: boolean;
  readonly isLivePhoto: boolean;
  readonly path: string;
  readonly thumbnail_path: string;
  readonly livePhoto_path: string;
}

export const MediaSchema = SchemaFactory.createForClass(Media);
