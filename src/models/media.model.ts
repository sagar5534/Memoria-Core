import { Schema, model, Types } from 'mongoose';

// 1. Create an interface representing a document in MongoDB.
export interface Media {
  name: string;
  user: Types.ObjectId;
  assetId: string;
  creation_date: Date;
  isFavorite: boolean;
  path: string;
  thumbnail_path: string;
}

// 2. Create a Schema corresponding to the document interface.
const schema = new Schema<Media>({
  name: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  assetId: { type: String, required: true },
  creation_date: { type: Date, required: true },
  isFavorite: { type: Boolean, required: false, default: false },
  path: { type: String, required: true },
  thumbnail_path: { type: String, required: false },
});

// 3. Create a Model.
export const MediaModel = model<Media>('media', schema);

