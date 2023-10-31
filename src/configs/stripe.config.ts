import { IStripeModuleOptions } from '../stripe/stripe.interfaces'
import { ConfigService } from '@nestjs/config'
import { EnvVariables } from '../common/app.constants'

export const getStripeConfig = (configService: ConfigService): IStripeModuleOptions => {
  const stripeApiKey = configService.get(EnvVariables.stripeKey)
  return {
    apiKey: stripeApiKey
  }
}
