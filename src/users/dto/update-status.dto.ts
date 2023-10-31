import { IsNotEmpty } from 'class-validator'
import { UserStatuses } from '../../common/app.constants'

export class UpdateStatusDto {
  @IsNotEmpty()
  email: string

  @IsNotEmpty()
  date_updated: string

  @IsNotEmpty()
  status: UserStatuses
}
