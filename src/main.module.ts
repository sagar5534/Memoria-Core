import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaModule } from './modules/media/media.module';
import { UserModule } from './modules/user/user.module';
import { ScannerModule } from './modules/scanner/scanner.module';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { MulterModule } from '@nestjs/platform-express';
import { join } from 'path';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { JWTGuard } from './modules/authentication/jwt.guard';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require('config');
@Module({
  imports: [
    MongooseModule.forRoot(config.get('mongo.host')),
    MulterModule.registerAsync({
      useFactory: () => ({
        dest: join(config.get('storage.path'), 'media'),
      }),
    }),
    ScheduleModule.forRoot(),
    MediaModule,
    AuthenticationModule,
    UserModule,
    ScannerModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JWTGuard,
    },
  ],
})
export class MainModule {}
