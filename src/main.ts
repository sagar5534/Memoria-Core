import { NestFactory } from '@nestjs/core';
import { MainModule } from './main.module';
import { join } from 'path';
import * as fs from 'fs';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require('config');

async function bootstrap() {
  const PORT = config.get('web.port');

  checkStoragePaths();

  const app = await NestFactory.create(MainModule);
  await app.listen(PORT, () => {
    console.log(`Running Memoria on ${PORT} ⚡`);
  });
}

async function checkStoragePaths() {
  const storagePaths = [
    join(config.get('storage.path'), 'Memoria'),
    join(config.get('storage.path'), 'Memoria', '.thumbs'),
  ];

  for (const path of storagePaths) {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }
  }
}

bootstrap();
