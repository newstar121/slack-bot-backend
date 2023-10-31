import { config } from 'dotenv'
import { DataSource, DataSourceOptions } from 'typeorm'
import { EnvVariables } from './src/common/app.constants'
import { UserEntity } from './src/users/entities/user.entity'
import { envFilePath } from './src/common/utils'
import { ConfigService } from '@nestjs/config'
import { SubscriptionEntity } from './src/payments/entities/subscription.entity'
import { UpdateEntities1697212388410 } from './migrations/1697212388410-UpdateEntities'

config({ path: envFilePath })

const configService = new ConfigService({ path: envFilePath })

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: configService.get(EnvVariables.dbHost),
  port: configService.get(EnvVariables.dbPort),
  username: configService.get(EnvVariables.dbUserName),
  password: configService.get(EnvVariables.dbUserPassword),
  database: configService.get(EnvVariables.dbName),
  entities: [UserEntity, SubscriptionEntity],
  migrations: [UpdateEntities1697212388410]
}

const dataSource = new DataSource(dataSourceOptions)

export default dataSource
