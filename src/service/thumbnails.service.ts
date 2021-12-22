import imageThumbnail from "image-thumbnail";
import * as fs from "fs";
import path from "path";

export class ThumbnailService {
  private saveLocation: string;
  private imgOptions: any;

  constructor() {
    this.imgOptions = {
      percentage: 25,
      withMetadata: true,
    };
    this.saveLocation = "public/thumbs";
  }

  async makeThumbnail(inputPath: string, fileName: string) {
    const savePath = path.join(this.saveLocation, fileName + "_thumb.png");

    imageThumbnail(inputPath, this.imgOptions)
      .then((thumbnail) => this.saveThumbnail(thumbnail, savePath))
      .catch((err) => console.error(err));
  }

  async saveThumbnail(bufferData: Buffer, savePath: string) {
    return new Promise((resolve, reject) => {
      fs.writeFile(savePath, bufferData, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(savePath);
        }
      });
    });
  }
}
