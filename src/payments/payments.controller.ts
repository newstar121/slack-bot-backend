import { Body, Controller, Headers, Logger, Post, RawBodyRequest, Req, Res } from '@nestjs/common'
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto'
import { StripeService } from '../stripe/stripe.service'
import { ConfigService } from '@nestjs/config'
import { EnvVariables, UserStatuses } from '../common/app.constants'
import { WebServiceClient } from '@maxmind/geoip2-node'
import { getParityGroupByCountry, getParityGroupByGroupId } from '../common/utils'
import { Request, Response } from 'express'
import { PaymentsService } from './payments.service'
import Stripe from 'stripe'
import { UsersService } from '../users/users.service'
import { CreateSubscriptionDto } from './dto/create-subscription.dto'
import { UpdateSubscriptionDto } from './dto/update-subscription.dto'

@Controller('stripe')
export class PaymentsController {
  private webServiceClient: WebServiceClient
  constructor(
    private readonly stripeService: StripeService,
    private readonly paymentsService: PaymentsService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly logger: Logger
  ) {
    const geo2IP2AccountId = this.configService.get(EnvVariables.geo2IP2AccountId)
    const geo2IP2LicenceKey = this.configService.get(EnvVariables.geo2IP2LicenceKey)
    this.webServiceClient = new WebServiceClient(geo2IP2AccountId, geo2IP2LicenceKey)
  }

  @Post('create-checkout-session')
  async createCheckoutSession(@Body() body: CreateCheckoutSessionDto) {
    const { email, lastName, firstName, priceInfo } = body
    try {
      let parityGroup

      if (priceInfo?.group) parityGroup = getParityGroupByGroupId(priceInfo.group)
      else parityGroup = getParityGroupByGroupId(0) //for old versions that dont pass priceInfo
      const customer = await this.stripeService.stripe.customers.create({
        email: email,
        name: firstName + (lastName ? ' ' : '') + lastName
      })
      const session = await this.stripeService.stripe.checkout.sessions.create({
        mode: parityGroup.mode,
        customer: customer.id, // here you pass the id of the customer
        line_items: [
          {
            price: parityGroup.priceId,
            // For metered billing, do not pass quantity
            quantity: 1
          }
        ],
        automatic_tax: { enabled: true },
        customer_update: { address: 'auto' },
        allow_promotion_codes: true,
        consent_collection: {
          promotions: 'auto'
        },

        // {CHECKOUT_SESSION_ID} is a string literal; do not change it!
        // the actual Session ID is returned in the query parameter when your customer
        // is redirected to the success page.
        success_url: 'https://appsdowonders.com/payment-success/?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'https://appsdowonders.com/payment-error/?error=1'
      })

      // Redirect to the URL returned on the Checkout Session.
      // With express, you can redirect with:
      //   res.redirect(303, session.url);
      return { session }
    } catch (error) {
      console.log('Error while checkout session: ', error)
      return { error: { message: error.message } }
    }
  }

  @Post('webhook')
  async stripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
    @Res() response: Response
  ) {
    const payload = request.rawBody
    let event: Stripe.Event | undefined
    try {
      event = await this.stripeService.constructEventFromPayload(signature, payload)
    } catch (error) {
      this.logger.log('Webhook Error: ', error.message)
      return response.status(400).send(`Webhook Error: , ${error.message}`)
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        await this.paymentsService.createOrder(session)
        break
      }

      case 'payment_intent.succeeded':
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object
        // @ts-ignore
        await this.paymentsService.fulfillOrder(session.receipt_email)
        break
      }

      case 'customer.subscription.deleted':
      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription
        const subEndedAt = updatedSubscription.ended_at
          ? new Date(updatedSubscription.ended_at * 1000)
          : null
        const subCanceledAt = updatedSubscription.canceled_at
          ? new Date(updatedSubscription.canceled_at * 1000)
          : null
        const updSubCustomerId = updatedSubscription.customer
        const customer = await this.stripeService.getCustomer(updSubCustomerId as string)
        const customerEmail = (customer as Stripe.Customer).email
        const user = await this.usersService.findUserByEmail(customerEmail)
        const updateSubscriptionDto: UpdateSubscriptionDto = {
          subscription_id: updatedSubscription.id,
          status: updatedSubscription.status,
          ended_at: subEndedAt,
          user,
          current_period_start: new Date(updatedSubscription.current_period_start * 1000),
          current_period_end: new Date(updatedSubscription.current_period_end * 1000),
          canceled_at: subCanceledAt
        }
        // Change user status to free if even subscription does not exist and user in premium status
        if (updatedSubscription.status === 'canceled') {
          await this.paymentsService.updateUserStatus(customerEmail, UserStatuses.free)
        }
        // If subscription already exists, then update subscription
        if (await this.paymentsService.checkExistingSubscription(updatedSubscription.id)) {
          await this.paymentsService.updateSubscription(updateSubscriptionDto)
          break
        }
        // Else create new subscription
        const createSubscriptionDto: CreateSubscriptionDto = {
          ...updateSubscriptionDto,
          amount: updatedSubscription.items.data[0].plan.amount,
          interval: updatedSubscription.items.data[0].plan.interval,
          customer_id: String(updSubCustomerId),
          customer_email: customerEmail,
          user
        }
        await this.paymentsService.createSubscription(createSubscriptionDto)
        break

      case 'checkout.session.async_payment_failed': {
        const session = event.data.object
        // TODO This method should be implemented
        await this.paymentsService.emailCustomerAboutFailedPayment(session)
        break
      }
    }
    return response.status(200).end()
  }

  @Post('promo')
  async paymentPromo(@Req() request: Request) {
    const clientIp = request.headers['x-forwarded-for'] || request.connection.remoteAddress
    try {
      const geoIp2Response = await this.webServiceClient.country(clientIp as string)
      const promo = getParityGroupByCountry(geoIp2Response.country.isoCode)
      if (promo) return { code: promo.code, discount: promo.discount }
      else return {}
    } catch (error) {
      console.error(error)
      return {
        message: 'GeoIP2 Error',
        error: error.message
      }
    }
  }

  @Post('price-info')
  async priceInfo(@Req() request: Request) {
    const clientIp = request.headers['x-forwarded-for'] || request.connection.remoteAddress
    let isoCode = null
    let parityGroup = null
    try {
      const geoIp2Response = await this.webServiceClient.country(clientIp as string)
      isoCode = geoIp2Response.country.isoCode
    } catch (error: unknown) {
      if (typeof error === 'object' && 'code' in error)
        console.error('Error from geo2IP: ', error.code)
      else console.log('geo2IP error: ', error)
    }
    parityGroup = getParityGroupByCountry(isoCode)
    return {
      group: parityGroup?.group,
      isoCode: isoCode,
      discount: parityGroup?.discount,
      code: parityGroup?.code,
      price: parityGroup?.price,
      mode: parityGroup?.mode
    }
  }
}
