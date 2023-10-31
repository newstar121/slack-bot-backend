import { Body, Controller, Post } from '@nestjs/common'
import { GetUserDto } from './dto/get-user.dto'
import { UsersService } from './users.service'

@Controller('subscriber')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post('get-data')
  async getUserData(@Body() body: GetUserDto) {
    const { email } = body
    return this.usersService.getUserByEmail(email)
  }
}
