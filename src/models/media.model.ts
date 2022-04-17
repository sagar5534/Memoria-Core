import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongoose';

export type MediaDocument = Media & Document;

@Schema()
export class Media {
  // @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  // _id: User;

  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  assetId: string;

  @Prop()
  mediaType: number;

  @Prop()
  mediaSubType?: number;

  @Prop({ required: true })
  creationDate: Date;

  @Prop()
  modificationDate: Date;

  @Prop()
  duration?: number;

  @Prop({ default: false })
  isFavorite?: boolean;

  @Prop({ default: false })
  isHidden?: boolean;

  @Prop({ default: false })
  isLivePhoto?: boolean;

  @Prop({ required: true })
  path: string;

  @Prop()
  thumbnail_path: string;

  @Prop()
  livePhoto_path: string;

  @Prop()
  source: string;
}

export class MediaDto {
  _id?: ObjectId;
  assetId: string;
  filename: string;
  mediaType: number;
  mediaSubType?: number;
  creationDate: Date;
  modificationDate: Date;
  duration?: number;
  isFavorite?: boolean;
  isHidden?: boolean;
  isLivePhoto?: boolean;
  path: string;
  thumbnail_path: string;
  livePhoto_path: string;
  source: string;
}

export const MediaSchema = SchemaFactory.createForClass(Media);
