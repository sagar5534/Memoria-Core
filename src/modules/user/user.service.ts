import { UnprocessableEntityException, Injectable } from '@nestjs/common';
import { compare } from 'bcrypt';
import { RegisterRequest } from './requests';
import { User, UserDocument } from '../../models/user.model';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  public async validateCredentials(
    user: User,
    password: string,
  ): Promise<boolean> {
    return compare(password, user.password);
  }

  public async createUserFromRequest(
    request: RegisterRequest,
  ): Promise<UserDocument> {
    const { username, password } = request;

    const existingFromUsername = await this.findForUsername(request.username);

    if (existingFromUsername) {
      throw new UnprocessableEntityException('Username already in use');
    }

    const temp = new User();
    temp.username = username;
    temp.password = password;

    return this.userRepository.create(temp);
  }

  public async findForId(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  public async findForUsername(username: string): Promise<UserDocument | null> {
    return this.userRepository.findByUsername(username);
  }
}
