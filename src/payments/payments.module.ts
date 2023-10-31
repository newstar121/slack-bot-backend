import { Logger, Module } from '@nestjs/common'
import { PaymentsController } from './payments.controller'
import { PaymentsService } from './payments.service'
import { UsersModule } from '../users/users.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SubscriptionEntity } from './entities/subscription.entity'

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([SubscriptionEntity])],
  controllers: [PaymentsController],
  providers: [PaymentsService, Logger]
})
export class PaymentsModule {}
