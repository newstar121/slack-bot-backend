import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min
} from 'class-validator'
import { COMMON_ERRORS, GPT_AVAILABLE_MODELS } from '../../common/app.constants'
import {
  AvailableModelVersions,
  AvailableModelsForVersions
} from '../../interfaces/gpt-ai.interfaces'
import { ValidForModel } from '../models.validator'

export class TableFunctionDto {
  @IsNotEmpty({ message: COMMON_ERRORS.promptIsEmpty })
  @IsString({ message: 'Prompt must be string!' })
  prompt: string

  @IsArray({ message: 'Invalid headers!' })
  @IsOptional()
  header?: string[]

  @Min(0, { message: COMMON_ERRORS.temperatureError })
  @Max(2, { message: COMMON_ERRORS.temperatureError })
  @IsNumber()
  @IsOptional()
  temperature?: number

  @ValidForModel()
  @IsOptional()
  model?: AvailableModelsForVersions

  @IsEnum(GPT_AVAILABLE_MODELS)
  @IsOptional()
  modelVersion?: AvailableModelVersions

  @IsEmail()
  @IsOptional()
  email?: string
}
