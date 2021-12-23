import { UnprocessableEntityException, Injectable } from '@nestjs/common';
import { SignOptions, TokenExpiredError } from 'jsonwebtoken';
import { RefreshTokenRepository } from './refresh_token.repository';
import { UserRepository } from '../user/user.repository';
import { JwtService } from '@nestjs/jwt';
import { UserDocument } from '../../models/user.model';
import { RefreshTokenDocument } from '../../models/refresh_token.model';

const BASE_OPTIONS: SignOptions = {
  issuer: 'https://my-app.com',
  audience: 'https://my-app.com',
};

export interface RefreshTokenPayload {
  jti: number;
  sub: number;
}

@Injectable()
export class RefreshTokenService {
  constructor(
    private refreshTokenRepository: RefreshTokenRepository,
    private jwtService: JwtService,
    private userRepository: UserRepository,
  ) {}

  public async generateAccessToken(user: UserDocument): Promise<string> {
    const opts: SignOptions = {
      ...BASE_OPTIONS,
      subject: String(user.id),
    };

    return this.jwtService.signAsync({}, opts);
  }

  public async generateRefreshToken(
    user: UserDocument,
    expiresIn: number,
  ): Promise<string> {
    const token = await this.refreshTokenRepository.createRefreshToken(
      user,
      expiresIn,
    );

    const opts: SignOptions = {
      ...BASE_OPTIONS,
      expiresIn,
      subject: String(user.id),
      jwtid: String(token.id),
    };

    return this.jwtService.signAsync({}, opts);
  }

  public async resolveRefreshToken(
    encoded: string,
  ): Promise<{ user: UserDocument; token: RefreshTokenDocument }> {
    const payload = await this.decodeRefreshToken(encoded);
    const token = await this.getStoredTokenFromRefreshTokenPayload(payload);

    if (!token) {
      throw new UnprocessableEntityException('Refresh token not found');
    }

    if (token.isRevoked) {
      throw new UnprocessableEntityException('Refresh token revoked');
    }

    const user = await this.getUserFromRefreshTokenPayload(payload);

    if (!user) {
      throw new UnprocessableEntityException('Refresh token malformed');
    }

    return { user, token };
  }

  public async createAccessTokenFromRefreshToken(
    refresh: string,
  ): Promise<{ token: string; user: UserDocument }> {
    const { user } = await this.resolveRefreshToken(refresh);

    const token = await this.generateAccessToken(user);

    return { user, token };
  }

  private async decodeRefreshToken(
    token: string,
  ): Promise<RefreshTokenPayload> {
    try {
      return this.jwtService.verifyAsync(token);
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new UnprocessableEntityException('Refresh token expired');
      } else {
        throw new UnprocessableEntityException('Refresh token malformed');
      }
    }
  }

  private async getUserFromRefreshTokenPayload(
    payload: RefreshTokenPayload,
  ): Promise<UserDocument> {
    const subId = payload.sub;

    if (!subId) {
      throw new UnprocessableEntityException('Refresh token malformed');
    }

    return this.userRepository.findById(subId.toString());
  }

  private async getStoredTokenFromRefreshTokenPayload(
    payload: RefreshTokenPayload,
  ): Promise<RefreshTokenDocument | null> {
    const tokenId = payload.jti;

    if (!tokenId) {
      throw new UnprocessableEntityException('Refresh token malformed');
    }

    return this.refreshTokenRepository.findTokenById(tokenId.toString());
  }
}
