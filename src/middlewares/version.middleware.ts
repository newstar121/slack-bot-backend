import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { ConfigService } from '@nestjs/config'
import { APP_VERSION_HEADER, EnvVariables } from '../common/app.constants'

@Injectable()
export class VersionMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const appVersion = this.configService.get(EnvVariables.frontAppVersion)
    res.setHeader(APP_VERSION_HEADER, appVersion)
    next()
  }
}
