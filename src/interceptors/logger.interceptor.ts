import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  NestInterceptor
} from '@nestjs/common'
import { Observable, throwError, tap } from 'rxjs'
import { catchError } from 'rxjs/operators'
import { Request, Response } from 'express'
import { AxiosError } from 'axios'

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(private readonly logger: Logger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now()
    const req: Request = context.switchToHttp().getRequest()
    const res: Response = context.switchToHttp().getResponse()
    const baseLogMessage = `${req.method} ${req.url}`
    return next.handle().pipe(
      catchError(err => {
        const responseTime = Date.now() - now
        let resStatusCode = err.status
        let errMessage = err.message
        if (err instanceof AxiosError) {
          resStatusCode = err?.response?.status
          errMessage = err?.response?.data?.error?.message
        }
        if (err instanceof BadRequestException || err instanceof ForbiddenException) {
          // @ts-ignore
          errMessage = String(err.getResponse().message)
        }
        const fullLogMessage = `${baseLogMessage} ${resStatusCode} - ${responseTime}ms. Message: ${errMessage}`
        if (resStatusCode === 500) this.logger.error(fullLogMessage)
        this.logger.warn(fullLogMessage)
        return throwError(err)
      }),
      tap(value => {
        const responseTime = Date.now() - now
        this.logger.log(`${baseLogMessage} ${res.statusCode} - ${responseTime}ms`)
      })
    )
  }
}
