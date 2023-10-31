import { Inject, Injectable } from '@nestjs/common'
import Stripe from 'stripe'
import { STRIPE_MODULE_OPTIONS } from './stripe.constants'
import { IStripeModuleOptions } from './stripe.interfaces'
import { ConfigService } from '@nestjs/config'
import { EnvVariables } from '../common/app.constants'

@Injectable()
export class StripeService {
  public readonly stripe: Stripe
  constructor(
    @Inject(STRIPE_MODULE_OPTIONS) readonly options: IStripeModuleOptions,
    private readonly configService: ConfigService
  ) {
    this.stripe = new Stripe(options.apiKey, options.options)
  }

  public async constructEventFromPayload(
    signature: string,
    payload: Buffer
  ): Promise<Stripe.Event> {
    const webhookSecret = this.configService.get(EnvVariables.stripeWebhookSecret)
    return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  }

  public async getCustomer(customerId: string) {
    return await this.stripe.customers.retrieve(customerId)
  }

  public async getSubscription(subscriptionId: string) {
    return await this.stripe.subscriptions.retrieve(subscriptionId)
  }
}
