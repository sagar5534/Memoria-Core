import { Body, Controller, Delete, Get, Param, Put } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UpdateUserDto } from './user.dto';

@Controller('user')
export class UserController {
  constructor(private userRepository: UserRepository) {}

  @Get(':id')
  findById(@Param('id') id: string) {
    try {
      return this.userRepository.findById(id);
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
