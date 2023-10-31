import Stripe from 'stripe'
import { ModuleMetadata } from '@nestjs/common'

export interface IStripeModuleOptions {
  apiKey: string
  options?: Stripe.StripeConfig
}

export interface IStripeModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (...args: any[]) => Promise<IStripeModuleOptions> | IStripeModuleOptions
  inject?: any[]
}
