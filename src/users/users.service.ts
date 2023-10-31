import { Injectable } from '@nestjs/common'
import { UserEntity } from './entities/user.entity'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateStatusDto } from './dto/update-status.dto'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>
  ) {}

  async getUserByEmail(email: string) {
    const user = await this.usersRepository.find({ where: { email } })
    return { data: user }
  }

  async findUserByEmail(email: string) {
    return this.usersRepository.findOneBy({ email })
  }

  async createNewUser(userData: CreateUserDto) {
    const newUser = this.usersRepository.create(userData)
    await this.usersRepository.save(newUser)
    return newUser
  }

  async updateUserStatus(updateData: UpdateStatusDto) {
    const { email, date_updated, status } = updateData
    const existingUser = await this.usersRepository.findOneBy({ email })
    if (existingUser) {
      existingUser.date_updated = date_updated as unknown as Date
      existingUser.status = status
      await this.usersRepository.save(existingUser)
    }
  }
}
