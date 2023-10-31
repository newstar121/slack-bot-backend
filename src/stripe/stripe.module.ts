import { DynamicModule, Module, Provider } from '@nestjs/common'
import { IStripeModuleAsyncOptions } from './stripe.interfaces'
import { StripeService } from './stripe.service'
import { STRIPE_MODULE_OPTIONS } from './stripe.constants'

@Module({})
export class StripeModule {
  static forRootAsync(options: IStripeModuleAsyncOptions): DynamicModule {
    const asyncOptions = this.createAsyncOptionsProvider(options)
    return {
      module: StripeModule,
      imports: options.imports,
      providers: [StripeService, asyncOptions],
      exports: [StripeService],
      global: true
    }
  }

  private static createAsyncOptionsProvider(options: IStripeModuleAsyncOptions): Provider {
    return {
      provide: STRIPE_MODULE_OPTIONS,
      useFactory: async (...args: any[]) => options.useFactory(...args),
      inject: options.inject || []
    }
  }
}
