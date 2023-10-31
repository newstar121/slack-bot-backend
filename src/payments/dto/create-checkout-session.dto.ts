import { IsEmail, IsNotEmpty } from 'class-validator'

export class CreateCheckoutSessionDto {
  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsNotEmpty()
  firstName: string

  @IsNotEmpty()
  lastName: string

  @IsNotEmpty()
  priceInfo: any
}
