import { IsNotEmpty } from 'class-validator'
import { UserStatuses } from '../../common/app.constants'

export class CreateUserDto {
  @IsNotEmpty()
  first_name: string

  @IsNotEmpty()
  last_name: string

  @IsNotEmpty()
  email: string

  @IsNotEmpty()
  date_created: string

  @IsNotEmpty()
  date_updated: string

  @IsNotEmpty()
  date_subscribed: string

  @IsNotEmpty()
  status: UserStatuses
}
