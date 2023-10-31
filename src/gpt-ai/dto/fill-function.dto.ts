import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Max,
  Min
} from 'class-validator'
import { COMMON_ERRORS, GPT_AVAILABLE_MODELS } from '../../common/app.constants'
import { AvailableModelVersions } from '../../interfaces/gpt-ai.interfaces'

export class FillFunctionDto {
  @IsNotEmpty({ message: 'Partial is missing!' })
  partial: string[][]

  @IsArray({ message: 'Example is missing!' })
  example: string[][]

  @Min(0, { message: COMMON_ERRORS.temperatureError })
  @Max(2, { message: COMMON_ERRORS.temperatureError })
  @IsNumber()
  @IsOptional()
  temperature?: number

  @IsEnum(GPT_AVAILABLE_MODELS)
  @IsOptional()
  modelVersion?: AvailableModelVersions

  @IsEmail()
  @IsOptional()
  email?: string
}
