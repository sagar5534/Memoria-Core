import { Callback } from 'mongoose';
import { join } from 'path';
import * as fs from 'fs';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require('config');

export const editDestination = (
  req: Request,
  file: Express.Multer.File,
  callback: Callback,
) => {
  callback(null, join(config.get('storage.path'), 'media'));
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
    fs.existsSync(
      join(
        config.get('storage.path'),
        'media',
        filename + dupl + '.' + fileExt,
      ),
    )
  ) {
    counter += 1;
    dupl = '(' + counter + ')';
  }

  callback(null, filename + dupl + '.' + fileExt);
};
