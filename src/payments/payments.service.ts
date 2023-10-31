import { BadRequestException, Injectable } from '@nestjs/common'
import { UsersService } from '../users/users.service'
import { UserStatuses } from '../common/app.constants'
import { CreateSubscriptionDto } from './dto/create-subscription.dto'
import { Repository } from 'typeorm'
import { SubscriptionEntity } from './entities/subscription.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { UpdateSubscriptionDto } from './dto/update-subscription.dto'
import { StripeService } from '../stripe/stripe.service'

@Injectable()
export class PaymentsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly stripeService: StripeService,
    @InjectRepository(SubscriptionEntity)
    private readonly subscriptionsRepository: Repository<SubscriptionEntity>
  ) {}

  async createOrder(session) {
    const date = new Date().toISOString().slice(0, 19).replace('T', ' ')
    const email = session.customer_details.email
    const payment_status = session.payment_status
    let status = UserStatuses.free
    let date_subscribed = null

    if (payment_status === 'paid') {
      status = UserStatuses.premium
      date_subscribed = date
    }

    // Check if email is null or empty
    if (!email) {
      console.log('email is null or empty')
      return Promise.resolve(false)
    }

    // Split the full name into first and last name
    const fullName = session.customer_details.name.split(' ')
    const firstName = fullName[0]
    const lastName = fullName.length > 1 ? fullName.slice(1).join(' ') : ''
    try {
      const user = await this.usersService.findUserByEmail(email)
      if (!user) {
        const newUser = await this.usersService.createNewUser({
          date_created: date,
          date_subscribed,
          date_updated: date,
          status,
          email,
          first_name: firstName,
          last_name: lastName
        })
        if (await this.checkExistingSubscription(session.subscription)) {
          await this.subscriptionsRepository.update(
            { subscription_id: session.subscription },
            { user: newUser }
          )
        } else {
          const subscription = await this.stripeService.getSubscription(session.subscription)
          const subscriptionEndedAt = subscription.ended_at
            ? new Date(subscription.ended_at * 1000)
            : null
          const subscriptionCanceledAt = subscription.canceled_at
            ? new Date(subscription.canceled_at * 1000)
            : null
          await this.createSubscription({
            user: newUser,
            current_period_start: new Date(subscription.current_period_start * 1000),
            status: subscription.status,
            ended_at: subscriptionEndedAt,
            canceled_at: subscriptionCanceledAt,
            current_period_end: new Date(subscription.current_period_end * 1000),
            subscription_id: subscription.id,
            customer_email: newUser.email,
            customer_id: subscription.customer as string,
            amount: subscription.items.data[0].plan.amount,
            interval: subscription.items.data[0].plan.interval
          })
        }
        return true
      }
      return false
    } catch (error) {
      console.log('Error while creating order from stripe session: ', error)
      return false
    }
  }
  async fulfillOrder(email: string) {
    email = email.trim()
    if (!email) throw new BadRequestException('Email is empty while fulfilling order!')
    await this.updateUserStatus(email, UserStatuses.premium)
  }

  async updateUserStatus(email: string, status: UserStatuses) {
    const date = new Date().toISOString().slice(0, 19).replace('T', ' ')
    await this.usersService.updateUserStatus({ email, date_updated: date, status })
  }

  async checkExistingSubscription(subscriptionId: string) {
    return this.subscriptionsRepository.exist({ where: { subscription_id: subscriptionId } })
  }

  async updateSubscription(dto: UpdateSubscriptionDto) {
    const existingSub = await this.subscriptionsRepository.findOneBy({
      subscription_id: dto.subscription_id
    })
    existingSub.user = dto.user
    existingSub.status = dto.status
    existingSub.current_period_end = dto.current_period_end
    existingSub.current_period_start = dto.current_period_start
    existingSub.canceled_at = dto.canceled_at
    existingSub.ended_at = dto.ended_at
    await this.subscriptionsRepository.save(existingSub)
  }

  async createSubscription(dto: CreateSubscriptionDto) {
    const newSubscription = this.subscriptionsRepository.create(dto)
    await this.subscriptionsRepository.save(newSubscription)
  }

  async emailCustomerAboutFailedPayment(session) {}
}
