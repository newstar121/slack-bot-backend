import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'
import { Response } from 'express'
import { AxiosError } from 'axios'
import { COMMON_ERRORS } from '../common/app.constants'

@Catch(AxiosError)
export class AxiosExceptionFilter implements ExceptionFilter {
  catch(exception: AxiosError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    // @ts-ignore
    let message = exception?.response?.data?.error?.message
    let status = exception?.response?.status || 500
    message = `OpenAI API error ${status && `(code ${status})`} - ${message}`
    response.status(exception?.response?.status || 500).json({
      message: message || exception?.cause?.message || COMMON_ERRORS.unExpectedError
    })
  }
}
