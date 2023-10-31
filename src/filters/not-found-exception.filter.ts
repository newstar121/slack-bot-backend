import { ArgumentsHost, Catch, ExceptionFilter, Logger, NotFoundException } from '@nestjs/common'
import { Request, Response } from 'express'

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const res = ctx.getResponse<Response>()
    const req = ctx.getResponse<Request>()
    this.logger.warn(exception.message)
    // @ts-ignore
    res.status(404).send('Not found!')
  }
}
