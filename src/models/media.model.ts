import { Schema, model, Types } from "mongoose";

// 1. Create an interface representing a document in MongoDB.
export interface Media {
  user: Types.ObjectId;
  assetId: string;
  filename: string;
  mediaType: number;
  mediaSubtype: number;
  creationDate: Date;
  modificationDate: Date;
  duration: number;
  isFavorite: boolean;
  isHidden: boolean;
  isLivePhoto: boolean;
  path: string;
  thumbnail_path: string;
  livePhoto_path: string;
}

// 2. Create a Schema corresponding to the document interface.
const schema = new Schema<Media>({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  filename: { type: String, required: true },
  assetId: { type: String, unique: true, required: true },
  mediaType: { type: Number, required: false},
  mediaSubtype: {type: Number, required: false},
  creationDate: { type: Date, required: true },
  modificationDate: { type: Date, required: true },
  duration: { type: Number, required: false},
  isFavorite: { type: Boolean, required: false, default: false },
  isHidden: { type: Boolean, required: false, default: false },
  isLivePhoto: { type: Boolean, required: false, default: false },
  path: { type: String, required: true },
  thumbnail_path: { type: String, required: false },
  livePhoto_path: { type: String, required: false },
});

// 3. Create a Model.
export const MediaModel = model<Media>("media", schema);
