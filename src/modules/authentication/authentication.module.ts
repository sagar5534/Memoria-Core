import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import {
  RefreshToken,
  RefreshTokenSchema,
} from 'src/models/refresh_token.model';
import { AuthenticationController } from './authentication.controller';
import { RefreshTokenService } from './refresh_token.service';
import { RefreshTokenRepository } from './refresh_token.repository';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
    JwtModule.register({
      secret: 'SagarPatel',
      signOptions: {
        expiresIn: '5m',
      },
    }),
    UserModule,
  ],
  controllers: [AuthenticationController],
  providers: [RefreshTokenService, RefreshTokenRepository, JwtStrategy],
})
export class AuthenticationModule {}
