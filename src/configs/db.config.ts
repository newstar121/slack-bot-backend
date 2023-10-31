import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { dataSourceOptions } from '../../typeOrm.config'

export const getDbConfig = (): TypeOrmModuleOptions => dataSourceOptions
