import { IsDate, IsEmpty, IsNotEmpty } from 'class-validator'
import { UserEntity } from '../../users/entities/user.entity'
import { UpdateSubscriptionDto } from './update-subscription.dto'

export class CreateSubscriptionDto extends UpdateSubscriptionDto {
  @IsNotEmpty()
  customer_id: string

  @IsNotEmpty()
  customer_email: string

  @IsNotEmpty()
  interval: string

  @IsNotEmpty()
  amount: number

  @IsEmpty()
  user: UserEntity

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
}
