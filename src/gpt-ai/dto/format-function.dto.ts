import { IsArray, IsEmail, IsEnum, IsOptional } from 'class-validator'
import { COMMON_ERRORS, GPT_AVAILABLE_MODELS } from '../../common/app.constants'
import { AvailableModelVersions } from '../../interfaces/gpt-ai.interfaces'

export class FormatFunctionDto {
  // @IsArray({ message: COMMON_ERRORS.promptIsEmpty })
  prompt: string[][]

  // @IsArray({ message: 'Invalid format!' })
  value: string[][]

  @IsEnum(GPT_AVAILABLE_MODELS)
  @IsOptional()
  modelVersion?: AvailableModelVersions

  @IsEmail()
  @IsOptional()
  email?: string
}
