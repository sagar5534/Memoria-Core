import {
  Body,
  Controller,
  Get,
  Head,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import {
  LoginRequest,
  RefreshRequest,
  RegisterRequest,
} from '../user/requests';
import { UserService } from '../user/user.service';
import { RefreshTokenService } from '../authentication/refresh_token.service';
import { User, UserDocument } from '../../models/user.model';
import { Public } from './public.decorator';

export interface AuthenticationPayload {
  user: User;
  payload: {
    type: string;
    token: string;
    refresh_token?: string;
  };
}

@Controller('/api/auth')
export class AuthenticationController {
  constructor(
    private userService: UserService,
    private refreshTokenService: RefreshTokenService,
  ) {}

  @Public()
  @Get('/health')
  public async health() {
    return {
      status: 'healthy',
    };
  }

  @Public()
  @Post('/register')
  public async register(@Body() body: RegisterRequest) {
    const user = await this.userService.createUserFromRequest(body);
    const token = await this.refreshTokenService.generateAccessToken(user);
    const refresh = await this.refreshTokenService.generateRefreshToken(
      user,
      60 * 60 * 24 * 30,
    );

    const payload = this.buildResponsePayload(user, token, refresh);

    return {
      status: 'success',
      data: payload,
    };
  }

  @Public()
  @Post('/login')
  public async login(@Body() body: LoginRequest) {
    const { username, password } = body;

    const user = await this.userService.findForUsername(username);
    const valid = user
      ? await this.userService.validateCredentials(user, password)
      : false;

    if (!valid) {
      throw new UnauthorizedException('The login is invalid');
    }

    const token = await this.refreshTokenService.generateAccessToken(user);
    const refresh = await this.refreshTokenService.generateRefreshToken(
      user,
      60 * 60 * 24 * 30,
    );

    const payload = this.buildResponsePayload(user, token, refresh);

    return {
      status: 'success',
      data: payload,
    };
  }

  @Public()
  @Post('/refresh')
  public async refresh(@Body() body: RefreshRequest) {
    const { user, token } =
      await this.refreshTokenService.createAccessTokenFromRefreshToken(
        body.refresh_token,
      );

    const payload = this.buildResponsePayload(user, token);

    return {
      status: 'success',
      data: payload,
    };
  }

  @Get('/me')
  public async getUser(@Req() request) {
    const userId = request.user.id;

    const user = await this.userService.findForId(userId);

    return {
      status: 'success',
      data: user,
    };
  }

  private buildResponsePayload(
    user: UserDocument,
    accessToken: string,
    refreshToken?: string,
  ): AuthenticationPayload {
    return {
      user: user,
      payload: {
        type: 'bearer',
        token: accessToken,
        ...(refreshToken ? { refresh_token: refreshToken } : {}),
      },
    };
  }
}
