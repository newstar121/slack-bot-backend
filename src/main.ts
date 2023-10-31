import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { EnvVariables } from './common/app.constants'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true })
  app.enableCors({ exposedHeaders: ['app-version'] })
  app.useGlobalPipes(new ValidationPipe({ transform: true }))
  const configService = app.get(ConfigService)
  const port = configService.get(EnvVariables.port)
  await app.listen(port)
}

;(async () => await bootstrap())()
