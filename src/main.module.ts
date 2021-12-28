import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaModule } from './modules/media/media.module';
import { UserModule } from './modules/user/user.module';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { MulterModule } from '@nestjs/platform-express';
import * as dotenv from 'dotenv';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { APP_GUARD } from '@nestjs/core';
import { JWTGuard } from './modules/authentication/jwt.guard';

dotenv.config();
const DB_PATH = process.env.DB_PATH;

@Module({
  imports: [
    MongooseModule.forRoot(DB_PATH),
    MulterModule.registerAsync({
      useFactory: () => ({
        dest: join(__dirname, 'public', 'uploads'),
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'public'),
      serveRoot: '/data',
    }),
    MediaModule,
    AuthenticationModule,
    UserModule,
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
