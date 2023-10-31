import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { envFilePath } from './common/utils'
import { GptAiModule } from './gpt-ai/gpt-ai.module'
import { AppService } from './app.service'
import { AppController } from './app.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { getDbConfig } from './configs/db.config'
import { UsersModule } from './users/users.module'
import { PaymentsModule } from './payments/payments.module'
import { StripeModule } from './stripe/stripe.module'
import { getStripeConfig } from './configs/stripe.config'
import { HttpModule } from '@nestjs/axios'
import { VersionMiddleware } from './middlewares/version.middleware'
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'
import { LoggerInterceptor } from './interceptors/logger.interceptor'
import { NotFoundExceptionFilter } from './filters/not-found-exception.filter'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        ...getDbConfig(),
        entities: [],
        autoLoadEntities: true
      })
    }),
    GptAiModule,
    UsersModule,
    PaymentsModule,
    StripeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: getStripeConfig
    }),
    HttpModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerInterceptor
    },
    {
      provide: APP_FILTER,
      useClass: NotFoundExceptionFilter
    },
    Logger
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(VersionMiddleware).forRoutes('*')
  }
}
