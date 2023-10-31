import { IsDate, IsEmpty, IsNotEmpty } from 'class-validator'
import { UserEntity } from '../../users/entities/user.entity'

export class UpdateSubscriptionDto {
  @IsNotEmpty()
  subscription_id: string

  @IsNotEmpty()
  status: string

  @IsDate()
  @IsNotEmpty()
  current_period_start: Date

  @IsDate()
  @IsNotEmpty()
  current_period_end: Date

  @IsDate()
  @IsEmpty()
  canceled_at: Date

  @IsDate()
  @IsEmpty()
  ended_at: Date

  @IsEmpty()
  user: UserEntity
}
