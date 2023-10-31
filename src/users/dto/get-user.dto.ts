import { IsNotEmpty } from 'class-validator'

export class GetUserDto {
  @IsNotEmpty({ message: 'Missing parameters!' })
  email: string
}
