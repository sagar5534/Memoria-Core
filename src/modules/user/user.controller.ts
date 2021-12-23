import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import { CreateUserDto, UpdateUserDto } from './user.dto';

@Controller('user')
export class UserController {
  constructor(private userRepository: UserRepository) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    try {
      return this.userRepository.create(createUserDto);
    } catch (error) {
      return error;
    }
  }

  @Get()
  findAll() {
    return this.userRepository.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    try {
      return this.userRepository.findOne(id);
    } catch (error) {
      return;
    }
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      return this.userRepository.update(id, updateUserDto);
    } catch (error) {
      return;
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    try {
      return this.userRepository.delete(id);
    } catch (error) {
      return;
    }
  }
}
