import { Callback } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';

export const editDestination = (
  req: Request,
  file: Express.Multer.File,
  callback: Callback,
) => {
  callback(null, 'public/uploads/');
};

export const editFileName = (
  req: Request,
  file: Express.Multer.File,
  callback: Callback,
) => {
  const fileExt = file.originalname.split('.').pop();
  const filename = (req.body as any).filename ?? 'File';

  let counter = 0;
  let dupl = '';
  while (
    fs.existsSync(path.join('public/uploads', filename + dupl + '.' + fileExt))
  ) {
    counter += 1;
    dupl = '(' + counter + ')';
  }

  callback(null, filename + dupl + '.' + fileExt);
};
