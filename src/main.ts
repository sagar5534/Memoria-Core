import { NestFactory } from '@nestjs/core';
import { MainModule } from './main.module';

async function bootstrap() {
  const PORT = 12480;

  const app = await NestFactory.create(MainModule);
  await app.listen(PORT, () => {
    console.log(`Running on ${PORT} ⚡`);
  });
}

bootstrap();
